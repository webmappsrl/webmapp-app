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
import {select, Store} from '@ngrx/store';
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
  take,
  tap,
} from 'rxjs/operators';
import {GeohubService} from 'src/app/services/geohub.service';
import {ShareService} from 'src/app/services/share.service';
import {WmMapComponent} from 'src/app/shared/map-core/src/components';
import {WmMapPoisDirective} from 'src/app/shared/map-core/src/directives';
import {WmMapTrackRelatedPoisDirective} from 'src/app/shared/map-core/src/directives/track.related-pois.directive';
import {IGeojsonFeature} from 'src/app/shared/map-core/src/types/model';
import {fromHEXToColor} from 'src/app/shared/map-core/src/utils';
import {beforeInit, setTransition, setTranslate} from '../poi/utils';
import {MapTrackDetailsComponent} from 'src/app/pages/map/map-track-details/map-track-details.component';
import {LangService} from '@wm-core/localization/lang.service';
import {FeatureCollection, LineString} from 'geojson';
import {WmLoadingService} from '@wm-core/services/loading.service';
import {
  confAPP,
  confAUTHEnable,
  confGeohubId,
  confJIDOUPDATETIME,
  confMAP,
  confMAPLAYERS,
  confOPTIONS,
  confPOIS,
  confPOISFilter,
  confPoisIcons,
} from '@wm-core/store/conf/conf.selector';
import {ISlopeChartHoverElements} from '@wm-core/types/slope-chart';
import {online} from 'src/app/store/network/network.selector';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {HomePage} from '../home/home.page';
import {ILAYER, IAPP} from '@wm-core/types/config';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {hitMapFeatureCollection} from 'src/app/shared/map-core/src/store/map-core.selector';
import {Location} from '@angular/common';
import {DeviceService} from '@wm-core/services/device.service';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {ecLayer, inputTyped} from '@wm-core/store/user-activity/user-activity.selector';
import {WmFeature} from '@wm-types/feature';
import {track} from '@wm-core/store/features/features.selector';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {currentEcTrack} from '@wm-core/store/features/ec/ec.selector';

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
export class MapPage {
  private _bboxLayer = null;
  private _confMAPLAYERS$: Observable<ILAYER[]> = this._store.select(confMAPLAYERS);
  private _flowLine$: BehaviorSubject<null | {
    flow_line_quote_orange: number;
    flow_line_quote_red: number;
  }> = new BehaviorSubject<null>(null);

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

  apiSearchInputTyped$: Observable<string> = this._store.select(inputTyped);
  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  centerPositionEvt$: BehaviorSubject<boolean> = new BehaviorSubject<boolean | null>(null);
  confAPP$: Observable<IAPP> = this._store.select(confAPP);
  confJIDOUPDATETIME$: Observable<any> = this._store.select(confJIDOUPDATETIME);
  confMap$: Observable<any> = this._store.select(confMAP);
  confOPTIONS$: Observable<any> = this._store.select(confOPTIONS);
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
  currentLayer$ = this._store.select(ecLayer).pipe(tap(l => (this._bboxLayer = l?.bbox ?? null)));
  currentPoi$: BehaviorSubject<IGeojsonFeature> = new BehaviorSubject<IGeojsonFeature | null>(null);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiNextID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiPrevID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPosition$: Observable<any>;
  currentRelatedPoi$: BehaviorSubject<IGeojsonFeature> =
    new BehaviorSubject<IGeojsonFeature | null>(null);
  currentTrack$: Observable<WmFeature<LineString>> = this._store.select(currentEcTrack);
  dataLayerUrls$: Observable<IDATALAYER>;
  detailsIsOpen$: Observable<boolean>;
  flowPopoverText$: BehaviorSubject<string | null> = new BehaviorSubject<null>(null);
  geohubId$ = this._store.select(confGeohubId);
  imagePoiToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFavourite$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
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
  overlayFeatureCollections$ = this._store.select(hitMapFeatureCollection);
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
  popup$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  previewTrack$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  resetEvt$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  resetSelectedPoi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  resetSelectedPopup$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
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
  toggleLayerDirective$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  togglePoisDirective$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  trackElevationChartHoverElements$: BehaviorSubject<ISlopeChartHoverElements | null> =
    new BehaviorSubject<ISlopeChartHoverElements | null>(null);
  translationCallback: (any) => string = value => {
    if (value == null) return '';
    return this._langSvc.instant(value);
  };
  wmMapFeatureCollectionOverlay$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(
    null,
  );
  wmMapHitMapUrl$: Observable<string | null> = this.confMap$.pipe(map(conf => conf?.hitMapUrl));
  wmMapPositionfocus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private _store: Store,
    private _deviceSvc: DeviceService,
    private _geohubSvc: GeohubService,
    private _route: ActivatedRoute,
    private _location: Location,
    private _shareSvc: ShareService,
    private _cdr: ChangeDetectorRef,
    private _storeNetwork: Store<INetworkRootState>,
    private _geolocationSvc: GeolocationService,
    private _langSvc: LangService,
    private _loadingSvc: WmLoadingService,
    private _urlHandlerSvc: UrlHandlerService,
    _platform: Platform,
  ) {
    this.dataLayerUrls$ = this.geohubId$.pipe(
      filter(g => g != null),
      map(geohubId => {
        return {
          low: `https://wmpbf.s3.eu-central-1.amazonaws.com/${geohubId}/{z}/{x}/{y}.pbf`,
          high: `https://wmpbf.s3.eu-central-1.amazonaws.com/${geohubId}/{z}/{x}/{y}.pbf`,
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
    this.currentPosition$ = this._geolocationSvc.onLocationChange;
  }

  close(): void {
    this.showDownload$.next(false);
    this.wmMapPositionfocus$.next(false);
    this.resetSelectedPopup$.next(!this.resetSelectedPopup$.value);
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

  goToPage(page: string): void {
    this.close();
    this._urlHandlerSvc.changeURL(page);
  }

  async goToTrack(track: number): Promise<void> {
    const params = {ugc_track: undefined, track};
    if (track == null) {
      params['ec_related_poi'] = undefined;
    }
    this._urlHandlerSvc.updateURL(params);
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
    this.resetSelectedPopup$.next(!this.resetSelectedPopup$.value);
    this.goToTrack(null);
    this.mapTrackDetailsCmp.none();
    this.showDownload$.next(false);
  }

  navigation(): void {
    const isFocused = !this.wmMapPositionfocus$.value;
    this.wmMapPositionfocus$.next(isFocused);
    const isOpen = this.mapTrackDetailsCmp.isOpen$.value;
    this.previewTrack$.next(false);
    if (isFocused && isOpen) {
      this.mapTrackDetailsCmp.onlyTitle();
    }
  }

  openPoiShare(poiId: number): void {
    this._shareSvc.sharePoiByID(poiId);
  }

  openPopup(popup): void {
    this.popup$.next(popup);
    if (popup != null && popup != '') {
      this.mapTrackDetailsCmp.open();
    } else {
      this.mapTrackDetailsCmp.none();
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

  setNearestPoi(nearestPoi: Feature<Geometry>): void {
    const id = +nearestPoi.getId();
    this.wmMapTrackRelatedPoisDirective.setPoi = id;
  }

  setPoi(poi: IGeojsonFeature): void {
    const queryParams = {...this._route.snapshot.queryParams, poi: poi.properties.id};
    //  const url = this._router.createUrlTree([], {relativeTo: this._route, queryParams}).toString();
    //   this._location.replaceState(url);
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
    this.overlayFeatureCollections$.pipe(take(1)).subscribe(feature => {
      if (overlay['featureType'] != null && feature[overlay['featureType']] != null) {
        this.wmMapFeatureCollectionOverlay$.next({
          ...overlay,
          ...{url: feature[overlay['featureType']]},
        });
      }
    });
  }

  showPhoto(idx) {
    this.imagePoiToggle$.next(true);
    setTimeout(() => {
      this.slider.slideTo(idx);
    }, 300);
  }

  toggleDirective(data: {type: 'layers' | 'pois'; toggle: boolean}): void {
    switch (data.type) {
      case 'layers':
        this.toggleLayerDirective$.next(data.toggle);
        break;
      case 'pois':
        this.togglePoisDirective$.next(data.toggle);
        break;
    }
    console.log(data);
  }

  togglePreviewTrack(): void {
    this.previewTrack$.next(!this.previewTrack$.value);
    this._cdr.detectChanges();
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
