import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AlertController, ModalController, NavController} from '@ionic/angular';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {ESuccessType} from '../../types/esuccess.enum';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {confMAP, confOPTIONS} from '@wm-core/store/conf/conf.selector';
import {ugcTracksFeatures} from '@wm-core/store/features/ugc/ugc.selector';
import {
  LineStringProperties,
  Media,
  PointProperties,
  WmFeature,
} from '@wm-types/feature';
import {Point, LineString} from 'geojson';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {EUgcTrackShareState} from '@wm-core/types/eugc-track-share-state.enum';
import {LangService} from '@wm-core/localization/lang.service';
import {ShareService} from 'src/app/services/share.service';
@Component({
  standalone: false,
  selector: 'webmapp-modal-registersuccess',
  templateUrl: './modal-success.component.html',
  styleUrls: ['./modal-success.component.scss'],
})
export class ModalSuccessComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private MINSCATTER = 30;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private PHOTOSCATTER = 100;
  private _destroy$ = new Subject<void>();

  @Input() track: WmFeature<LineString, LineStringProperties>;
  @Input() type: ESuccessType;
  @Input() waypoint: WmFeature<Point, PointProperties>;
  @ViewChild('slider', {read: ElementRef}) slider: ElementRef;

  /**
   * Local alias so the template can reference enum members without importing them.
   */
  readonly EUgcTrackShareState = EUgcTrackShareState;
  confMap$: Observable<any> = this._store.select(confMAP);
  confOPTIONS$ = this._store.select(confOPTIONS);
  isPhotos = false;
  isTrack = false;
  /**
   * Whether THIS specific track has reached the backend (`properties.id` assigned by the
   * server, checked against the live `ugcTracksFeatures` store selector by matching `uuid` —
   * see `ngOnInit()`). Starts `false`: right after recording, the track exists only in local
   * storage (`ModalSaveComponent.save()` now dispatches the sync action before opening this
   * modal, not after closing it, precisely so this can resolve while the user is still here).
   * Gates `triggerShare()` — sharing before the backend knows about this uuid would 404.
   */
  isTrackSynced = false;
  isWaypoint = false;
  shareState$: BehaviorSubject<EUgcTrackShareState> = new BehaviorSubject<EUgcTrackShareState>(
    EUgcTrackShareState.IDLE,
  );
  sliderOptions: any = {
    slidesPerView: 2.5,
  };
  today = new Date();
  topValues = [];
  trackAvgSpeed: number = 0;
  trackDate;
  trackSlope: number = 0;
  trackTime = {hours: 0, minutes: 0, seconds: 0};
  trackTopSpeed: number = 0;
  trackodo: number = 0;

  constructor(
    private _modalController: ModalController,
    private _geoUtils: GeoutilsService,
    private _navController: NavController,
    private _store: Store,
    private _urlHandlerSvc: UrlHandlerService,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
    private _shareSvc: ShareService,
  ) {}

  ngOnInit() {
    switch (this.type) {
      case ESuccessType.TRACK:
        this.trackDate = this._geoUtils.getDate(this.track);
        this.trackodo = this._geoUtils.getLength(this.track);
        this.trackSlope = this._geoUtils.getSlope(this.track);
        this.trackAvgSpeed = this._geoUtils.getAverageSpeed(this.track);
        this.trackTopSpeed = this._geoUtils.getTopSpeed(this.track);
        this.trackTime = GeoutilsService.formatTime(this._geoUtils.getTime(this.track));
        this.isTrack = true;
        this._watchTrackSyncStatus();
        break;
      case ESuccessType.WAYPOINT:
        this.isWaypoint = true;
        break;
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * `ugcTracksFeatures` holds BOTH device-only and backend-synced tracks merged together
   * (`getUgcTracks()` in wm-core's localForage utils) — the only reliable per-track signal is
   * matching this track's `uuid` and checking whether `properties.id` has appeared on it. The
   * list refreshes via `updateUgcTracks`, dispatched after every successful sync cycle
   * (immediate, right after save — see `ModalSaveComponent.save()` — and the periodic
   * background retry in `UgcEffects.syncOnInterval$`), so this naturally flips to `true` once
   * the push actually lands, with no polling of our own needed.
   */
  private _watchTrackSyncStatus(): void {
    const uuid = this.track?.properties?.uuid;

    this._store
      .select(ugcTracksFeatures)
      .pipe(
        map(features => features?.some(f => f.properties?.uuid === uuid && f.properties?.id != null) ?? false),
        takeUntil(this._destroy$),
      )
      .subscribe(synced => {
        this.isTrackSynced = synced;
      });
  }

  async close(): Promise<boolean> {
    return this._modalController.dismiss({
      dismissed: true,
    });
  }

  async gotoPhotos(): Promise<void> {
    await this.close();
    this._navController.navigateForward('photolist');
  }

  /**
   * Shares the just-recorded track (oc:8183, second entry point). Same guard/retry pattern
   * as `UgcTrackPropertiesComponent.triggerShare()` in wm-core: guarded against re-entrancy
   * while `GENERATING`, error reported via a native alert (not an in-template banner), no
   * dedicated success UI beyond the native share sheet itself closing.
   *
   * The button is a full-width block sibling below the stats card (not overlapping it), so
   * the template safely uses Ionic's native `[disabled]` for both the `GENERATING` and
   * "not yet synced" states — no opacity/bleed-through risk here, unlike the chip layout
   * used in wm-core's `ugc-track-properties`.
   */
  async triggerShare(): Promise<void> {
    if (this.shareState$.value === EUgcTrackShareState.GENERATING) {
      return;
    }
    if (!this.isTrackSynced) {
      await this._presentNotSyncedAlert();
      return;
    }
    this.shareState$.next(EUgcTrackShareState.GENERATING);

    const result = await this._shareSvc.shareTrackToStories(this.track);

    this.shareState$.next(
      result.success ? EUgcTrackShareState.SUCCESS : EUgcTrackShareState.ERROR,
    );

    if (!result.success) {
      await this._presentShareErrorAlert(result.errorMessage ?? 'Condivisione non riuscita');
    }
  }

  private async _presentShareErrorAlert(message: string): Promise<void> {
    const alert = await this._alertCtrl.create({
      message: this._langSvc.instant(message),
      buttons: [
        {text: this._langSvc.instant('Annulla'), role: 'cancel'},
        {text: this._langSvc.instant('Riprova'), handler: () => this.triggerShare()},
      ],
    });
    await alert.present();
  }

  /**
   * Explicit feedback instead of a silent no-op or a confusing 404 from the backend (which
   * doesn't know about this track's uuid yet): tells the user why the tap did nothing right
   * now. No "Riprova" handler needed here — the button re-enables itself automatically the
   * moment `_watchTrackSyncStatus()` sees the sync land, no manual retry required.
   */
  private async _presentNotSyncedAlert(): Promise<void> {
    const alert = await this._alertCtrl.create({
      message: this._langSvc.instant(
        'Il percorso è ancora in fase di sincronizzazione, riprova tra qualche secondo.',
      ),
      buttons: [this._langSvc.instant('OK')],
    });
    await alert.present();
  }

  async openTrack(track: WmFeature<LineString>): Promise<void> {
    await this.close();

    const queryParams = {
      ugc_track: track.properties.uuid ?? undefined,
    };

    this._urlHandlerSvc.updateURL(queryParams);
  }

  async openWaypoint(waypoint: WmFeature<Point>): Promise<void> {
    await this.close();

    const queryParams = {
      ugc_poi: waypoint.properties.uuid ?? undefined,
    };

    this._urlHandlerSvc.updateURL(queryParams);
  }
}
