import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BackgroundGeolocation} from '@awesome-cordova-plugins/background-geolocation/ngx';
import {Browser} from '@capacitor/browser';
import {IonFab, IonSlides} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {Feature} from 'ol';
import Geometry from 'ol/geom/Geometry';
import {BehaviorSubject, merge, Observable, of, Subscription} from 'rxjs';
import {
  filter,
  map,
  startWith,
  switchMap,
  tap,
  distinctUntilChanged,
  catchError,
  share,
  take,
} from 'rxjs/operators';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {AuthService} from 'src/app/services/auth.service';
import {DeviceService} from 'src/app/services/base/device.service';
import {GeohubService} from 'src/app/services/geohub.service';
import {ShareService} from 'src/app/services/share.service';
import {WmMapComponent} from 'src/app/shared/map-core/components';
import {wmMapTrackRelatedPoisDirective} from 'src/app/shared/map-core/directives/track.related-pois.directive';
import {WmMapPoisDirective} from 'src/app/shared/map-core/directives';
import {IGeojsonFeature} from 'src/app/shared/map-core/types/model';
import {fromHEXToColor} from 'src/app/shared/map-core/utils';
import {
  confGeohubId,
  confMAP,
  confPOIS,
  confPOISFilter,
  confJIDOUPDATETIME,
} from 'src/app/store/conf/conf.selector';
import {setCurrentFilters} from 'src/app/store/map/map.actions';
import {currentFilters, mapCurrentLayer, padding} from 'src/app/store/map/map.selector';
import {loadPois} from 'src/app/store/pois/pois.actions';
import {pois} from 'src/app/store/pois/pois.selector';

import {GeolocationPage} from '../abstract/geolocation';
import {beforeInit, setTransition, setTranslate} from '../poi/utils';

import {MapTrackDetailsComponent} from './map-track-details/map-track-details.component';
import {ISlopeChartHoverElements} from 'src/app/shared/wm-core/types/slope-chart';
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
export class MapPage extends GeolocationPage implements OnInit, OnDestroy {
  private _bboxLayer = null;
  private _flowLine$: BehaviorSubject<null | {
    flow_line_quote_orange: number;
    flow_line_quote_red: number;
  }> = new BehaviorSubject<null>(null);
  private _routerSub: Subscription = Subscription.EMPTY;

  readonly trackColor$: BehaviorSubject<string> = new BehaviorSubject<string>('#caaf15');
  readonly trackid$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  previewTrack$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  @ViewChild('fab1') fab1: IonFab;
  @ViewChild('fab2') fab2: IonFab;
  @ViewChild('fab3') fab3: IonFab;
  @ViewChild('details') mapTrackDetailsCmp: MapTrackDetailsComponent;
  @ViewChild('gallery') slider: IonSlides;
  @ViewChild('wmap') wmMapComponent: WmMapComponent;
  @ViewChild(WmMapPoisDirective) wmMapPoisDirective: WmMapPoisDirective;
  @ViewChild(wmMapTrackRelatedPoisDirective)
  wmMapTrackRelatedPoisDirective: wmMapTrackRelatedPoisDirective;

  confJIDOUPDATETIME$: Observable<any> = this._store.select(confJIDOUPDATETIME);
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
  detailsIsOpen$: Observable<boolean>;
  enableOverLay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  flowPopoverText$: BehaviorSubject<string | null> = new BehaviorSubject<null>(null);
  geohubId$ = this._store.select(confGeohubId);
  imagePoiToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean>;
  isTrackRecordingEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  lang = localStorage.getItem('wm-lang') || 'it';
  layerOpacity$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  modeFullMap = false;
  nearestPoi$: BehaviorSubject<Feature<Geometry> | null> =
    new BehaviorSubject<Feature<Geometry> | null>(null);
  padding$: Observable<number[]> = this._store.select(padding);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  poiProperties = this.currentPoi$.pipe(map(p => p.properties));
  poiProperties$: Observable<any> = merge(
    this.currentPoi$.pipe(
      distinctUntilChanged(),
      map(p => {
        if (p == null) return null;
        return p.properties;
      }),
      share(),
      tap(() => {
        this.trackid$.next(null);
        this.layerOpacity$.next(false);
      }),
    ),
    this.currentRelatedPoi$.pipe(
      distinctUntilChanged(),
      map(p => {
        if (p == null) return null;
        return {...p.properties, ...{isRelated: true}};
      }),
      share(),
      tap(() => {
        this.currentPoi$.next(null);
      }),
    ),
  ).pipe(share());
  pois: any[];
  pois$: Observable<any> = this._store.select(pois).pipe(
    tap(p => (this.pois = (p && p.features) ?? null)),
    take(1),
  );
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
  trackElevationChartHoverElements$: BehaviorSubject<ISlopeChartHoverElements | null> =
    new BehaviorSubject<ISlopeChartHoverElements | null>(null);
  wmMapPositionfocus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private _store: Store,
    private _deviceSvc: DeviceService,
    private _authSvc: AuthService,
    private _geohubSvc: GeohubService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _shareSvc: ShareService,
    private _cdr: ChangeDetectorRef,
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
    this.showDownload$.next(false);
    this.wmMapPositionfocus$.next(false);
    const isCurrentPoi = this.currentRelatedPoi$.value != null || this.currentPoi$.value != null;
    if (isCurrentPoi) {
      this.currentRelatedPoi$.next(null);
      this.currentPoi$.next(null);
      this.wmMapComponent.resetRotation();
      if (this.wmMapTrackRelatedPoisDirective != null) {
        this.wmMapTrackRelatedPoisDirective.setPoi = -1;
      }

      if (this.trackid$.value == null) {
        this.goToTrack(null);
      }
    } else if (this.trackid$.value != null) {
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

  goToPage(page: String): void {
    this.close();
    this._router.navigate([page]);
  }
  togglePreviewTrack(): void {
    this.previewTrack$.next(!this.previewTrack$.value);
    this._cdr.detectChanges();
  }
  goToTrack(id: number) {
    this._poiReset();
    this.wmMapComponent.resetRotation();
    this.previewTrack$.next(true);
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
    this.detailsIsOpen$ = this.mapTrackDetailsCmp.isOpen$.pipe(
      startWith(false),
      catchError(() => of(false)),
    );
  }

  ionViewWillLeave() {
    this._poiReset();
    this.resetEvt$.next(this.resetEvt$.value + 1);
    this.goToTrack(null);
    this.mapTrackDetailsCmp.none();
    this.showDownload$.next(false);
  }

  navigation(): void {
    const open = !this.wmMapPositionfocus$.value;
    this.wmMapPositionfocus$.next(open);
    if (open) {
      this.mapTrackDetailsCmp.none();
    } else {
      this.mapTrackDetailsCmp.close();
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._routerSub.unsubscribe();
  }

  ngOnInit(): void {
    this._routerSub = this._route.queryParams.subscribe(queryParams => {
      setTimeout(() => {
        const trackId = queryParams['track'];
        const poiId = queryParams['poi'];
        if (trackId != null) {
          this.goToTrack(trackId);
        }
        if (poiId != null) {
          this.wmMapPoisDirective.setPoi(+poiId);
        }
        this._route.snapshot.queryParams = {};
      }, 300);
    });
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

  setCurrentPoi(poi: IGeojsonFeature | null) {
    if (poi != null) {
      this.currentRelatedPoi$.next(poi);
    }
  }

  setNearestPoi(nearestPoi: Feature<Geometry>): void {
    const id = +nearestPoi.getId();
    this.wmMapTrackRelatedPoisDirective.setPoi = id;
  }

  setPoi(poi: IGeojsonFeature): void {
    this.currentPoi$.next(poi);
    this.mapTrackDetailsCmp.open();
  }

  setTrackElevationChartHoverElements(elements?: ISlopeChartHoverElements): void {
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
