import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {GeoutilsService} from '@wm-core/services/geoutils.service';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {ModalSaveComponent} from '../shared/modal-save/modal-save.component';
import {ModalController, NavController} from '@ionic/angular';
import {confTRACKFORMS} from '@wm-core/store/conf/conf.selector';
import {
  onRecord,
  trackLiveDistanceVm,
  TrackLiveDistanceVm,
} from '@wm-core/store/user-activity/user-activity.selector';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {
  setEnablePoiRecorderPanel,
  setEnableTrackRecorderPanel,
  setMapDetailsStatus,
  setOnRecord,
} from '@wm-core/store/user-activity/user-activity.action';
import {WmFeature} from '@wm-types/feature';
import {LineString} from 'geojson';

@Component({
  standalone: false,
  selector: 'wm-track-recorder',
  templateUrl: './track-recorder.component.html',
  styleUrls: ['./track-recorder.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackRecorderComponent implements OnInit, OnDestroy {
  //TODO: Gestire il flusso della registrazione dallo store creando action, effect, selector e reducer necessari
  actualSpeed: number = 0;
  // null quando non calcolabile (es. tempo trascorso troppo breve) — il template mostra "—"
  // invece del valore grezzo, che altrimenti può risultare Infinity/NaN (bug preesistente in
  // GeoutilsService.getAverageSpeed, non risolto qui: solo la visualizzazione viene messa in sicurezza).
  averageSpeed: number | null = 0;
  isPaused = false;
  length: number = 0;
  opacity: number = 0;
  time: {hours: number; minutes: number; seconds: number} = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  confTRACKFORMS$: Observable<any[]> = this._store.select(confTRACKFORMS);
  focusPosition$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  onRecord$: Observable<boolean> = this._store.select(onRecord);
  // Selettore condiviso con tab-detail.component.ts (oc:8177) — vedi commento su
  // trackLiveDistanceVm in user-activity.selector.ts per il gate su
  // OPTIONS.showTrackRemainingDistance.
  trackLiveDistanceVm$: Observable<TrackLiveDistanceVm> = this._store.select(trackLiveDistanceVm);

  private _timerInterval: any;
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private _store: Store,
    private _geolocationSvc: GeolocationService,
    private _cdr: ChangeDetectorRef,
    private _geoutilsSvc: GeoutilsService,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
  ) {}

  ngOnInit() {
    this._geolocationSvc.onLocationChange$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.updateMap();
    });
    this.checkRecording();
  }

  ngOnDestroy(): void {
    try {
      clearInterval(this._timerInterval);
    } catch (e) {}
    this._destroy$.next();
    this._destroy$.complete();
  }

  recordMove(ev: number): void {
    this.opacity = ev;
  }

  recordStart(event: boolean): void {
    this.isPaused = false;
    this._geolocationSvc.startRecording();
    // Riduce il pannello di dettaglio (es. traccia aperta) a solo titolo all'avvio della
    // registrazione, così la mappa resta visibile durante il movimento — non azzera
    // currentEcTrack (a differenza della chiusura esplicita del pannello), quindi le
    // distanze inizio/fine restano disponibili nel box (vedi trackLiveDistanceVm$).
    this._store.dispatch(setMapDetailsStatus({status: 'onlyTitle'}));
    this.checkRecording();
  }

  checkRecording(): void {
    this.onRecord$.pipe(take(1)).subscribe(onRecord => {
      if (onRecord) {
        this.isPaused = this._geolocationSvc.paused;
        this.opacity = 1;
        this._timerInterval = setInterval(() => {
          this.time = GeoutilsService.formatTime(this._geolocationSvc.recordTime / 1000);
          this._cdr.detectChanges();
        }, 1000);
        setTimeout(() => {
          this.updateMap();
        }, 100);
      }
    });
  }

  updateMap(): void {
    this.onRecord$.pipe(take(1)).subscribe(onRecord => {
      if (onRecord && this._geolocationSvc.recordedFeature) {
        this.length = this._geoutilsSvc.getLength(this._geolocationSvc.recordedFeature);
        this.actualSpeed =
          this._geolocationSvc.location.speed ??
          this._geoutilsSvc.getCurrentSpeed(this._geolocationSvc.recordedFeature);
        const avgSpeed = this._geoutilsSvc.getAverageSpeed(this._geolocationSvc.recordedFeature);
        this.averageSpeed = Number.isFinite(avgSpeed) ? avgSpeed : null;
      }
    });
  }

  backToMap(): void {
    this.reset();
  }

  reset(): void {
    this.opacity = 0;
    this.time = {hours: 0, minutes: 0, seconds: 0};
    this.actualSpeed = 0;
    this.averageSpeed = 0;
    this.length = 0;
    this._store.dispatch(setOnRecord({onRecord: false}));
    this._store.dispatch(setEnableTrackRecorderPanel({enable: false}));
    this.focusPosition$.next(false);

    this.isPaused = false;
    this._geolocationSvc.stopRecording();
  }

  async pause(): Promise<void> {
    await this._geolocationSvc.pauseRecording();
    this.isPaused = true;
  }

  async resume(): Promise<void> {
    await this._geolocationSvc.resumeRecording();
    this.focusPosition$.next(true);
    this.isPaused = false;
    // Stesso motivo di recordStart(): se durante la pausa l'utente ha riaperto un pannello di
    // dettaglio (map-details.component.ts lo forza sempre a 'open' all'apertura di una
    // feature), riprendere la registrazione deve tornare a liberare la mappa.
    this._store.dispatch(setMapDetailsStatus({status: 'onlyTitle'}));
  }

  async stop(): Promise<void> {
    this.stopRecording();
    this.focusPosition$.next(false);
  }

  async stopRecording(): Promise<void> {
    await this._geolocationSvc.pauseRecording();
    this.isPaused = true;

    // TODO: show dialog no coordinates recorded

    const recordedFeature = this._geolocationSvc.recordedFeature;
    const modal = await this._modalCtrl.create({
      component: ModalSaveComponent,
      componentProps: {
        acquisitionFORM$: this.confTRACKFORMS$,
        recordedFeature,
      },
    });
    await modal.present();
    const res = await modal.onDidDismiss();

    if (!res.data.dismissed && res.data.save) {
      this._geolocationSvc.stopRecording();
      clearInterval(this._timerInterval);
      this.backToMap();
    } else if (!res.data.dismissed) {
      await this._geolocationSvc.stopRecording();
      this.backToMap();
    }
  }

  waypoint(): void {
    this._store.dispatch(setEnablePoiRecorderPanel({enable: true}));
  }
}
