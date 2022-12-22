import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewEncapsulation,
  OnDestroy,
} from '@angular/core';
import {IonFab, IonSlides} from '@ionic/angular';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {filter, map, tap, switchMap, startWith} from 'rxjs/operators';

import {confGeohubId, confMAP, confPOIS, confPOISFilter} from 'src/app/store/conf/conf.selector';
import {setCurrentFilters} from 'src/app/store/map/map.actions';
import {currentFilters, mapCurrentLayer, padding} from 'src/app/store/map/map.selector';
import {loadPois} from 'src/app/store/pois/pois.actions';
import {beforeInit, setTransition, setTranslate} from '../poi/utils';

import {Browser} from '@capacitor/browser';
import {Store} from '@ngrx/store';
import {AuthService} from 'src/app/services/auth.service';
import {DeviceService} from 'src/app/services/base/device.service';
import {fromHEXToColor} from 'src/app/shared/map-core/utils';
import {pois} from 'src/app/store/pois/pois.selector';
import {BackgroundGeolocation} from '@awesome-cordova-plugins/background-geolocation/ngx';
import {GeolocationPage} from '../abstract/geolocation';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {GeohubService} from 'src/app/services/geohub.service';
import {MapTrackDetailsComponent} from './map-track-details/map-track-details.component';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-charts';
import {wmMapTrackRelatedPoisDirective} from 'src/app/shared/map-core/directives/track.related-pois.directive';
import {ActivatedRoute} from '@angular/router';
import {ShareService} from 'src/app/services/share.service';
import {WmMapComponent} from 'src/app/shared/map-core/components';
import {IGeojsonFeature} from 'src/app/shared/map-core/types/model';
export interface IDATALAYER {
  high: string;
  low: string;
}
@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapPage extends GeolocationPage implements OnDestroy {
  private _bboxLayer = null;
  private _flowLine$: BehaviorSubject<null | {
    flow_line_quote_orange: number;
    flow_line_quote_red: number;
  }> = new BehaviorSubject<null>(null);

  readonly trackid$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  @ViewChild('fab1') fab1: IonFab;
  @ViewChild('fab2') fab2: IonFab;
  @ViewChild('fab3') fab3: IonFab;
  @ViewChild('details') mapTrackDetailsCmp: MapTrackDetailsComponent;
  @ViewChild('gallery') slider: IonSlides;
  @ViewChild('wmap') wmMapComponent: WmMapComponent;
  @ViewChild(wmMapTrackRelatedPoisDirective)
  wmMapTrackRelatedPoisDirective: wmMapTrackRelatedPoisDirective;

  confMap$: Observable<any> = this._store.select(confMAP).pipe(
    tap(conf => {
      if (conf.flow_line_quote_show) {
        this._flowLine$.next({
          flow_line_quote_orange: conf.flow_line_quote_orange,
          flow_line_quote_red: conf.flow_line_quote_red,
        });
      }
    }),
    tap(c => {
      if (c != null && c.pois != null && c.pois.apppoisApiLayer == true) {
        this._store.dispatch(loadPois());
      }
      if (c != null && c.record_track_show) {
        this.isTrackRecordingEnable$.next(true);
      }
    }),
  );
  confPOIS$: Observable<any> = this._store.select(confPOIS);
  confPOISFilter$: Observable<any> = this._store.select(confPOISFilter).pipe(
    map(p => {
      if (p.poi_type != null) {
        let poi_type = p.poi_type.map(p => {
          if (p.icon != null && p.color != null) {
            const namedPoiColor = fromHEXToColor[p.color] || 'darkorange';
            return {...p, ...{icon: p.icon.replaceAll('darkorange', namedPoiColor)}};
          }
          return p;
        });
        return {where: p.where, poi_type};
      }
      return p;
    }),
  );
  currentFilters$: Observable<string[]> = this._store.select(currentFilters);
  currentLayer$ = this._store
    .select(mapCurrentLayer)
    .pipe(tap(l => (this._bboxLayer = l?.bbox ?? null)));
  currentPoi$: BehaviorSubject<IGeojsonFeature> = new BehaviorSubject<IGeojsonFeature | null>(null);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiNextID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiPrevID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentRelatedPoi$: BehaviorSubject<IGeojsonFeature> =
    new BehaviorSubject<IGeojsonFeature | null>(null);
  currentTrack$: Observable<CGeojsonLineStringFeature | null> = this.trackid$.pipe(
    switchMap(id => this._geohubSvc.getEcTrack(id)),
    startWith(null),
  );
  dataLayerUrls$: Observable<IDATALAYER>;
  enableOverLay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  flowPopoverText$: BehaviorSubject<string | null> = new BehaviorSubject<null>(null);
  geohubId$ = this._store.select(confGeohubId);
  imagePoiToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean>;
  isTrackRecordingEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerOpacity$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  modeFullMap = false;
  padding$: Observable<number[]> = this._store.select(padding);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  poiProperties = this.currentPoi$.pipe(map(p => p.properties));
  poiProperties$: Observable<any> = merge(
    this.currentPoi$.pipe(
      map(p => {
        if (p == null) return null;
        return p.properties;
      }),
    ),
    this.currentRelatedPoi$.pipe(
      map(p => {
        if (p == null) return null;
        return {...p.properties, ...{isRelated: true}};
      }),
    ),
  );
  pois: any[];
  pois$: Observable<any> = this._store
    .select(pois)
    .pipe(tap(p => (this.pois = (p && p.features) ?? null)));
  resetEvt$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  resetSelectedPoi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showDownload$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  slideOptions = {
    on: {
      beforeInit,
      setTranslate,
      setTransition,
    },
  };
  public sliderOptions: any;
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);

  constructor(
    private _store: Store,
    private _deviceSvc: DeviceService,
    private _authSvc: AuthService,
    private _geohubSvc: GeohubService,
    private _route: ActivatedRoute,
    private _shareSvc: ShareService,
    _backgroundGeolocation: BackgroundGeolocation,
  ) {
    super(_backgroundGeolocation);

    this.dataLayerUrls$ = this.geohubId$.pipe(
      filter(g => g != null),
      map(geohubId => {
        if (geohubId == 13) {
          this.enableOverLay$.next(true);
        }
        return {
          low: `https://jidotile.webmapp.it/?x={x}&y={y}&z={z}&index=geohub_app_low_${geohubId}`,
          high: `https://jidotile.webmapp.it/?x={x}&y={y}&z={z}&index=geohub_app_high_${geohubId}`,
        } as IDATALAYER;
      }),
    );
    this.sliderOptions = {
      initialSlide: 0,
      speed: 400,
      spaceBetween: 10,
      slidesOffsetAfter: 15,
      slidesOffsetBefore: 15,
      slidesPerView: this._deviceSvc.width / 235,
    };
    this.isLoggedIn$ = this._authSvc.isLoggedIn$;
  }

  close(): void {
    if (this.currentRelatedPoi$.value != null || this.currentPoi$.value != null) {
      const currentVal = this.trackid$.value;
      this.currentRelatedPoi$.next(null);
      this.currentPoi$.next(null);
      this.wmMapComponent.map.getView().animate({
        duration: 0,
        rotation: 0,
      });
      setTimeout(() => {
        this.goToTrack(currentVal);
      }, 300);
    } else if (this.trackid$ != null) {
      this.goToTrack(null);
    }
  }

  closeDownload(): void {
    this.showDownload$.next(false);
    setTimeout(() => {
      this.mapTrackDetailsCmp.open();
    }, 300);
  }

  email(_): void {}

  getFlowPopoverText(altitude = 0, orangeTreshold = 800, redTreshold = 1500) {
    const green = `<span class="green">Livello 1: tratti non interessati dall'alta quota (quota minore di ${orangeTreshold} metri)</span>`;
    const orange = `<span class="orange">Livello 2: tratti parzialmente in alta quota (quota compresa tra ${orangeTreshold} metri e ${redTreshold} metri)</span>`;
    const red = `<span class="red">Livello 3: in alta quota (quota superiore ${redTreshold} metri)</span>`;
    return altitude < orangeTreshold
      ? green
      : altitude > orangeTreshold && altitude < redTreshold
      ? orange
      : red;
  }

  goToTrack(id: number) {
    console.log(id);
    this._poiReset();
    this.wmMapComponent.map.getView().animate({
      duration: 0,
      rotation: 0,
    });
    this.trackid$.next(id);
    if (id != null && id !== -1) {
      this.layerOpacity$.next(true);
      this.mapTrackDetailsCmp.open();
    } else {
      this.layerOpacity$.next(false);
      this.mapTrackDetailsCmp.none();
    }
  }

  ionViewDidEnter(): void {
    this.resetEvt$.next(this.resetEvt$.value + 1);
  }

  ionViewWillEnter(): void {
    const id = this._route.snapshot.queryParams['track'];
    this._route.snapshot.queryParams = {};
    if (id != null) {
      this.goToTrack(id);
    }
  }

  ionViewWillLeave() {
    this._poiReset();
    this.resetEvt$.next(this.resetEvt$.value + 1);
    this.trackid$.next(null);
    this.mapTrackDetailsCmp.none();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  openTrackDownload(): void {
    this.mapTrackDetailsCmp.none();
    setTimeout(() => {
      this.showDownload$.next(true);
    }, 300);
  }

  openTrackShare(trackId: number): void {
    this._shareSvc.shareTrackByID(trackId);
  }

  phone(_): void {}

  poiNext(): void {
    this.wmMapTrackRelatedPoisDirective.poiNext();
  }

  poiPrev(): void {
    this.wmMapTrackRelatedPoisDirective.poiPrev();
  }

  setCurrentFilters(filters: string[]): void {
    this._store.dispatch(setCurrentFilters({currentFilters: filters}));
  }

  setCurrentPoi(poi: IGeojsonFeature) {
    this.currentRelatedPoi$.next(poi);
  }

  setPoi(poi: IGeojsonFeature): void {
    this.currentPoi$.next(poi);
    this.mapTrackDetailsCmp.open();
  }

  setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
      if (this._flowLine$.value != null) {
        this.flowPopoverText$.next(
          this.getFlowPopoverText(
            elements.location.altitude,
            this._flowLine$.value.flow_line_quote_orange,
            this._flowLine$.value.flow_line_quote_red,
          ),
        );
      }
    }
  }

  showPhoto(idx) {
    this.imagePoiToggle$.next(true);
    setTimeout(() => {
      this.slider.slideTo(idx);
    }, 300);
  }

  toogleFullMap() {
    this.modeFullMap = !this.mapTrackDetailsCmp.toggle();
  }

  async url(url) {
    await Browser.open({url});
  }

  private _poiReset(): void {
    this.currentRelatedPoi$.next(null);
    this.currentPoi$.next(null);
    this.resetSelectedPoi$.next(!this.resetSelectedPoi$.value);
  }
}
