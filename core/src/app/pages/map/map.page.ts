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

import {Browser} from '@capacitor/browser';
import {IonFab, IonSlides, Platform} from '@ionic/angular';
import {Store} from '@ngrx/store';

import {Feature} from 'ol';
import Geometry from 'ol/geom/Geometry';
import {BehaviorSubject, Observable, Subscription, merge, of} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  share,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {AuthService} from 'src/app/services/auth.service';
import {DeviceService} from 'src/app/services/base/device.service';
import {GeohubService} from 'src/app/services/geohub.service';
import {ShareService} from 'src/app/services/share.service';
import {WmMapComponent} from 'src/app/shared/map-core/src/components';
import {WmMapPoisDirective} from 'src/app/shared/map-core/src/directives';
import {WmMapTrackRelatedPoisDirective} from 'src/app/shared/map-core/src/directives/track.related-pois.directive';
import {IGeojsonFeature} from 'src/app/shared/map-core/src/types/model';
import {fromHEXToColor} from 'src/app/shared/map-core/src/utils';

import {setCurrentFilters} from 'src/app/store/map/map.actions';
import {currentFilters, padding} from 'src/app/store/map/map.selector';

import {beforeInit, setTransition, setTranslate} from '../poi/utils';

import {MapTrackDetailsComponent} from 'src/app/pages/map/map-track-details/map-track-details.component';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {ISlopeChartHoverElements} from 'src/app/shared/wm-core/types/slope-chart';
import {online} from 'src/app/store/network/network.selector';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {
  confAUTHEnable,
  confGeohubId,
  confJIDOUPDATETIME,
  confMAP,
  confPOIS,
  confPOISFilter,
  confPoisIcons,
} from 'src/app/shared/wm-core/store/conf/conf.selector';
import {
  applyWhere,
  loadPois,
  resetPoiFilters,
  resetTrackFilters,
  setLayer,
  togglePoiFilter,
  toggleTrackFilter,
  updateTrackFilter,
} from 'src/app/shared/wm-core/store/api/api.actions';
import {
  apiElasticState,
  apiElasticStateLayer,
  apiSearchInputTyped,
  countSelectedFilters,
  poiFilterIdentifiers,
  pois,
  poisInitFeatureCollection,
} from 'src/app/shared/wm-core/store/api/api.selector';
import {HomePage} from '../home/home.page';
import {LangService} from 'src/app/shared/wm-core/localization/lang.service';
import {WmLoadingService} from 'src/app/shared/wm-core/services/loading.service';
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
export class MapPage implements OnInit, OnDestroy {
  private _bboxLayer = null;
  private _flowLine$: BehaviorSubject<null | {
    flow_line_quote_orange: number;
    flow_line_quote_red: number;
  }> = new BehaviorSubject<null>(null);
  private _routerSub: Subscription = Subscription.EMPTY;

  readonly trackColor$: BehaviorSubject<string> = new BehaviorSubject<string>('#caaf15');
  readonly trackid$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  @ViewChild('fab1') fab1: IonFab;
  @ViewChild('fab2') fab2: IonFab;
  @ViewChild('fab3') fab3: IonFab;
  @ViewChild(HomePage) homeCmp: HomePage;
  @ViewChild('details') mapTrackDetailsCmp: MapTrackDetailsComponent;
  @ViewChild('gallery') slider: IonSlides;
  @ViewChild('wmap') wmMapComponent: WmMapComponent;
  @ViewChild(WmMapPoisDirective) wmMapPoisDirective: WmMapPoisDirective;
  @ViewChild(WmMapTrackRelatedPoisDirective)
  wmMapTrackRelatedPoisDirective: WmMapTrackRelatedPoisDirective;

  apiElasticState$: Observable<any> = this._store.select(apiElasticState);
  apiSearchInputTyped$: Observable<string> = this._store.select(apiSearchInputTyped);
  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  centerPositionEvt$: BehaviorSubject<boolean> = new BehaviorSubject<boolean | null>(null);
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
            return {
              ...p,
              ...{icon: p.icon.replaceAll('darkorange', namedPoiColor)},
            };
          }
          return p;
        });
        return {where: p.where, poi_type};
      }
      return p;
    }),
  );
  confPoiIcons$: Observable<{[identifier: string]: any} | null> = this._store.select(confPoisIcons);
  currentFilters$: Observable<string[]> = this._store.select(currentFilters);
  currentLayer$ = this._store
    .select(apiElasticStateLayer)
    .pipe(tap(l => (this._bboxLayer = l?.bbox ?? null)));
  currentPoi$: BehaviorSubject<IGeojsonFeature> = new BehaviorSubject<IGeojsonFeature | null>(null);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiNextID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiPrevID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPosition$: Observable<any>;
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
  isFavourite$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean>;
  isTrackRecordingEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  lang = localStorage.getItem('wm-lang') || 'it';
  layerOpacity$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  modeFullMap = false;
  nearestPoi$: BehaviorSubject<Feature<Geometry> | null> =
    new BehaviorSubject<Feature<Geometry> | null>(null);
  onLine$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  online$: Observable<boolean> = this._storeNetwork.select(online).pipe(
    tap(() => {
      this._cdr.detectChanges();
    }),
  );
  padding$: Observable<number[]> = this._store.select(padding);
  poiFilterIdentifiers$: Observable<string[]> = this._store.select(poiFilterIdentifiers);
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
  pois$: Observable<any> = this._store.select(pois).pipe(distinctUntilChanged());
  previewTrack$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  refreshLayer$: Observable<any> = this._store.select(countSelectedFilters);
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
  startRecording$: BehaviorSubject<string> = new BehaviorSubject<string | null>(null);
  trackElevationChartHoverElements$: BehaviorSubject<ISlopeChartHoverElements | null> =
    new BehaviorSubject<ISlopeChartHoverElements | null>(null);
  translationCallback: (any) => string = value => {
    if (value == null) return '';
    return this._langSvc.instant(value);
  };
  wmMapFeatureCollectionOverlay$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(
    null,
  );
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
    private _storeNetwork: Store<INetworkRootState>,
    private _geolocationSvc: GeolocationService,
    private _langSvc: LangService,
    private _loadingSvc: WmLoadingService,
    _platform: Platform,
  ) {
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
    this.currentPosition$ = this._geolocationSvc.onLocationChange;
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

  ngOnDestroy(): void {
    this._routerSub.unsubscribe();
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
      } else {
        this.mapTrackDetailsCmp.open();
      }
    } else if (this.trackid$.value != null) {
      this.goToTrack(null);
    }

    if (!navigator.onLine) {
      this._router.navigate(['home']);
    }
  }

  closeDownload(): void {
    this.showDownload$.next(false);
    setTimeout(() => {
      this.mapTrackDetailsCmp.open();
    }, 300);
  }

  email(_): void {}

  async favourite(trackID): Promise<void> {
    const isFav = await this._geohubSvc.setFavouriteTrack(trackID, !this.isFavourite$.value);
    this.isFavourite$.next(isFav);
  }

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

  async goToTrack(id: number): Promise<void> {
    this._poiReset();
    this.wmMapComponent.resetRotation();
    this.previewTrack$.next(true);
    this.trackid$.next(id);
    const isFav = await this._geohubSvc.isFavouriteTrack(id);
    this.isFavourite$.next(isFav);
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
    this.onLine$.next(navigator.onLine);
    this._geolocationSvc.start();
    this._cdr.detectChanges();
    this.wmMapComponent.map.updateSize();
  }

  ionViewWillEnter(): void {
    this.detailsIsOpen$ = this.mapTrackDetailsCmp.isOpen$.pipe(
      startWith(false),
      catchError(() => of(false)),
    );
  }

  ionViewWillLeave(): void {
    this._poiReset();
    this.resetEvt$.next(this.resetEvt$.value + 1);
    this.goToTrack(null);
    this.mapTrackDetailsCmp.none();
    this.showDownload$.next(false);
  }

  navigation(): void {
    const isFocused = !this.wmMapPositionfocus$.value;
    this.wmMapPositionfocus$.next(isFocused);
    this.previewTrack$.next(false);
    if (isFocused) {
      this.mapTrackDetailsCmp.onlyTitle();
    }
  }

  openTrackDownload(): void {
    this.mapTrackDetailsCmp.background();
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

  resetFilters(): void {
    this._store.dispatch(resetPoiFilters());
    this._store.dispatch(resetTrackFilters());
    this._store.dispatch(setLayer(null));
    this._store.dispatch(applyWhere({where: null}));
  }

  selectedLayer(layer: any): void {
    this._store.dispatch(setLayer({layer}));
  }

  setCurrentFilters(filters: string[]): void {
    this._store.dispatch(setCurrentFilters({currentFilters: filters}));
  }

  setCurrentPoi(poi: IGeojsonFeature | null) {
    if (poi != null) {
      this.currentRelatedPoi$.next(poi);
    }
  }

  setLoader(event: string): void {
    console.log(event);
    switch (event) {
      case 'rendering:layer_start':
        this._loadingSvc.show('Rendering Layer');
        break;
      case 'rendering:layer_done':
        this._loadingSvc.close('Rendering Layer');
        break;
      case 'rendering:pois_start':
        this._loadingSvc.show('Rendering Pois');
        break;
      case 'rendering:pois_done':
        this._loadingSvc.close('Rendering Pois');
        break;
      default:
        this._loadingSvc.close();
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

  setWmMapFeatureCollection(overlay: any): void {
    this.wmMapFeatureCollectionOverlay$.next(overlay);
  }

  showPhoto(idx) {
    this.imagePoiToggle$.next(true);
    setTimeout(() => {
      this.slider.slideTo(idx);
    }, 300);
  }

  togglePreviewTrack(): void {
    this.previewTrack$.next(!this.previewTrack$.value);
    this._cdr.detectChanges();
  }

  toogleFullMap() {
    this.modeFullMap = !this.mapTrackDetailsCmp.toggle();
  }

  updatePoiFilter(filter: SelectFilterOption | SliderFilter | Filter): void {
    this._store.dispatch(togglePoiFilter({filterIdentifier: filter.identifier}));
  }

  updateTrackFilter(filterGeneric: SelectFilterOption | SliderFilter | Filter): void {
    let filter = filterGeneric as Filter;
    if (filter.type === 'slider') {
      this._store.dispatch(updateTrackFilter({filter}));
    } else {
      this._store.dispatch(toggleTrackFilter({filter}));
    }
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
