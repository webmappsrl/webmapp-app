import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {ModalController, NavController, Platform} from '@ionic/angular';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {ModalSaveComponent} from './modal-save/modal-save.component';
import {DEF_MAP_LOCATION_ZOOM} from 'src/app/constants/map';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {Location} from '@capacitor-community/background-geolocation';
import {Collection, Feature as OlFeature} from 'ol';
import {LineString as olLinestring, Point} from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON.js';
import {fromLonLat} from 'ol/proj';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {LangService} from '@wm-core/localization/lang.service';
import {confMAP, confTRACKFORMS} from '@wm-core/store/conf/conf.selector';
import {Feature, LineString} from 'geojson';
@Component({
  selector: 'webmapp-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage implements OnInit, OnDestroy {
  private _backBtnSub$: Subscription = Subscription.EMPTY;
  private _timerInterval: any;

  actualSpeed: number = 0;
  averageSpeed: number = 0;
  confMap$: Observable<any> = this._store.select(confMAP);
  confTRACKFORMS$: Observable<any[]> = this._store.select(confTRACKFORMS);
  currentPosition$: Observable<Location> = this._geolocationSvc.onLocationChange;
  currentTrack$: BehaviorSubject<Feature<LineString> | null> = new BehaviorSubject(null);
  focusPosition$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  geojson: Feature<LineString>;
  geojson$: BehaviorSubject<any> = new BehaviorSubject(null);
  isPaused = false;
  isRegestering = true;
  length: number = 0;
  linestring = new olLinestring([]);
  location: number[];
  opacity: number = 0;
  point = new Point([]);
  record$: Observable<boolean>;
  time: {hours: number; minutes: number; seconds: number} = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  trackColor$: BehaviorSubject<string> = new BehaviorSubject<string>('#caaf15');

  constructor(
    private _geolocationSvc: GeolocationService,
    private _geoutilsSvc: GeoutilsService,
    private _navCtrl: NavController,
    private _modalCtrl: ModalController,
    private _cdr: ChangeDetectorRef,
    private _platform: Platform,
    private _store: Store,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
    this._route.queryParams.subscribe(_ => {
      if (this._router.getCurrentNavigation().extras.state) {
        const state = this._router.getCurrentNavigation().extras.state;
        if (state.currentTrack) {
          this.currentTrack$.next(state.currentTrack);
        }
      }
    });
    this.currentPosition$.subscribe(loc => {
      if (this.focusPosition$.value || this.geojson$.value == null) {
        const coordinate = fromLonLat([loc.longitude, loc.latitude]);
        this.linestring.appendCoordinate(coordinate);

        this.point.setCoordinates(coordinate);
        const featureCollection = new Collection([new OlFeature({geometry: this.linestring})]);
        const geojson = new GeoJSON({featureProjection: 'EPSG:3857'}).writeFeaturesObject(
          featureCollection.getArray(),
        );
        this.geojson$.next(geojson);
      }
    });
    this.record$ = this._geolocationSvc.onRecord$;
  }

  ngOnInit() {
    if (this._geolocationSvc.location) {
      this.location = [
        this._geolocationSvc.location.longitude,
        this._geolocationSvc.location.latitude,
        DEF_MAP_LOCATION_ZOOM,
      ];
    }
    this._geolocationSvc.onLocationChange.subscribe(() => {
      this.updateMap();
    });
    this.checkRecording();
  }

  ngOnDestroy(): void {
    try {
      clearInterval(this._timerInterval);
    } catch (e) {}
  }

  backToMap(): void {
    this._navCtrl.navigateForward('map');
    this.reset();
  }

  background(ev: MouseEvent): void {
    this.backToMap();
  }

  checkRecording(): void {
    if (this._geolocationSvc.onRecord$.value) {
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
  }

  ionViewDidEnter(): void {
    this._geolocationSvc.startNavigation();
    this._backBtnSub$ = this._platform.backButton.subscribeWithPriority(99999, () => {});
  }

  ionViewWillLeave(): void {
    this._backBtnSub$.unsubscribe();
  }

  async pause(event: MouseEvent): Promise<void> {
    await this._geolocationSvc.pauseRecording();
    this.isPaused = true;
  }

  recordMove(ev: number): void {
    this.opacity = ev;
  }

  /**
   * Calculate the time values for seconds, minutes and hours given a time in seconds
   *
   * @param timeSeconds the time in seconds
   *
   * @returns
   */
  async recordStart(event: boolean): Promise<void> {
    this.isPaused = false;
    this.focusPosition$.next(true);
    this._geolocationSvc.startRecording();
    this.checkRecording();
  }

  reset(): void {
    this.isRegestering = true;
    this.opacity = 0;
    this.time = {hours: 0, minutes: 0, seconds: 0};
    this.actualSpeed = 0;
    this.averageSpeed = 0;
    this.length = 0;
    this._geolocationSvc.onRecord$.next(false);
    this.focusPosition$.next(false);

    this.isPaused = false;
    this._geolocationSvc.stopRecording();
  }

  async resume(event: MouseEvent): Promise<void> {
    await this._geolocationSvc.resumeRecording();
    this.focusPosition$.next(true);
    this.isPaused = false;
  }

  async stop(event: MouseEvent): Promise<void> {
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

  updateMap(): void {
    if (this._geolocationSvc.onRecord$.value && this._geolocationSvc.recordedFeature) {
      this.length = this._geoutilsSvc.getLength(this._geolocationSvc.recordedFeature);
      // const timeSeconds = this._geoutilsSvc.getTime(
      //   this._geolocationSvc.recordedFeature
      // );
      // this.time = this.formatTime(timeSeconds);
      this.actualSpeed =
        this._geolocationSvc.location.speed ??
        this._geoutilsSvc.getCurrentSpeed(this._geolocationSvc.recordedFeature);
      this.averageSpeed = this._geoutilsSvc.getAverageSpeed(this._geolocationSvc.recordedFeature);
    }
  }

  waypoint(): void {
    let navigationExtras: NavigationExtras = {
      state: {currentTrack: this._geolocationSvc.recordedFeature},
    };
    this._navCtrl.navigateForward('waypoint', navigationExtras);
  }
}
