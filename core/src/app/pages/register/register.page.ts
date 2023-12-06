import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {ModalController, NavController, Platform} from '@ionic/angular';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {ESuccessType} from '../../types/esuccess.enum';
import {ModalSaveComponent} from './modal-save/modal-save.component';
import {ModalSuccessComponent} from '../../components/modal-success/modal-success.component';
import {SaveService} from 'src/app/services/save.service';
import {ITrack} from 'src/app/types/track';
import {DEF_MAP_LOCATION_ZOOM} from 'src/app/constants/map';
import {BehaviorSubject, Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {Location} from '@capacitor-community/background-geolocation';
import {Collection, Feature} from 'ol';
import {LineString, Point} from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON.js';
import {fromLonLat} from 'ol/proj';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {LangService} from 'wm-core/localization/lang.service';
import {confMAP} from 'wm-core/store/conf/conf.selector';
@Component({
  selector: 'webmapp-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  providers: [LangService],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage implements OnInit, OnDestroy {
  private _timerInterval: any;

  actualSpeed: number = 0;
  averageSpeed: number = 0;
  confMap$: Observable<any> = this._store.select(confMAP);
  currentPosition$: Observable<Location> = this._geolocationSvc.onLocationChange;
  currentTrack$: BehaviorSubject<CGeojsonLineStringFeature | null> = new BehaviorSubject(null);
  focusPosition$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  geojson: CGeojsonLineStringFeature = new CGeojsonLineStringFeature();
  geojson$: BehaviorSubject<any> = new BehaviorSubject(null);
  isPaused = false;
  isRegestering = true;
  length: number = 0;
  linestring = new LineString([]);
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
    private _saveSvc: SaveService,
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
        const featureCollection = new Collection([new Feature({geometry: this.linestring})]);
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

  ngOnDestroy() {
    try {
      clearInterval(this._timerInterval);
    } catch (e) {}
  }

  backToMap() {
    this._navCtrl.navigateForward('map');
    this.reset();
    this._geolocationSvc.stop();
  }

  background(ev) {
    this.backToMap();
  }

  checkRecording() {
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
    this._geolocationSvc.start();
  }

  async openModalSuccess(track) {
    const modaSuccess = await this._modalCtrl.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: ESuccessType.TRACK,
        track,
      },
    });
    await modaSuccess.present();
    // await modaSuccess.onDidDismiss();
  }

  async pause(event: MouseEvent) {
    await this._geolocationSvc.pauseRecording();
    this.isPaused = true;
  }

  recordMove(ev) {
    this.opacity = ev;
  }

  /**
   * Calculate the time values for seconds, minutes and hours given a time in seconds
   *
   * @param timeSeconds the time in seconds
   *
   * @returns
   */
  async recordStart(event: boolean) {
    this.isPaused = false;
    this.focusPosition$.next(true);
    this._geolocationSvc.startRecording();
    this.checkRecording();
  }

  reset() {
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

  async resume(event: MouseEvent) {
    await this._geolocationSvc.resumeRecording();
    this.focusPosition$.next(true);
    this.isPaused = false;
  }

  async stop(event: MouseEvent) {
    this.stopRecording();
    this.focusPosition$.next(false);
  }

  async stopRecording() {
    await this._geolocationSvc.pauseRecording();
    this.isPaused = true;

    const modal = await this._modalCtrl.create({
      component: ModalSaveComponent,
    });
    await modal.present();
    const res = await modal.onDidDismiss();

    if (!res.data.dismissed && res.data.save) {
      try {
        clearInterval(this._timerInterval);
      } catch (e) {}
      const geojson = await this._geolocationSvc.stopRecording();
      const trackData = res.data.trackData;
      const distanceFilter = +localStorage.getItem('wm-distance-filter') || 10;
      const device = {
        os: this._platform.is('android') ? 'android' : this._platform.is('ios') ? 'ios' : 'other',
      };
      const metadata = {
        ...geojson.properties.metadata,
        ...{date: trackData.date, activity: trackData.activity, distanceFilter, device},
      };

      const track: ITrack = Object.assign(
        {
          geojson,
          metadata,
        },
        res.data.trackData,
        {metadata},
      );
      const saved = await this._saveSvc.saveTrack(track);

      await this.openModalSuccess(saved);
      this.backToMap();
    } else if (!res.data.dismissed) {
      await this._geolocationSvc.stopRecording();
      this.backToMap();
    }
  }

  updateMap() {
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
