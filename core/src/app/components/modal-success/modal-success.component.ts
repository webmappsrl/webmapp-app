import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {AlertController, ModalController, NavController} from '@ionic/angular';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {ESuccessType} from '../../types/esuccess.enum';
import {BehaviorSubject, Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {confMAP, confOPTIONS} from '@wm-core/store/conf/conf.selector';
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
export class ModalSuccessComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private MINSCATTER = 30;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private PHOTOSCATTER = 100;

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
        break;
      case ESuccessType.WAYPOINT:
        this.isWaypoint = true;
        break;
    }
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
   * The template deliberately does NOT bind `[disabled]` on the share button: Ionic's
   * built-in disabled state dims the button's opacity, which let the white card underneath
   * bleed through the circular chip (it overlaps the card's corner) — looked broken on
   * device. The guard below is enough on its own to prevent double-invocation; only the
   * native `disabled` semantics/opacity are skipped, not the re-entrancy protection itself.
   */
  async triggerShare(): Promise<void> {
    if (this.shareState$.value === EUgcTrackShareState.GENERATING) {
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
