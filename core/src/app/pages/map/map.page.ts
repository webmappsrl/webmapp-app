import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Browser} from '@capacitor/browser';
import {IonFab, Platform} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {Feature} from 'ol';
import Geometry from 'ol/geom/Geometry';
import {BehaviorSubject, Observable, from} from 'rxjs';
import {filter, map, take, tap, switchMap} from 'rxjs/operators';
import {GeohubService} from 'src/app/services/geohub.service';
import {ShareService} from 'src/app/services/share.service';
import {IGeojsonFeature} from 'src/app/shared/map-core/src/types/model';
import {fromHEXToColor} from 'src/app/shared/map-core/src/utils';
import {beforeInit, setTransition, setTranslate} from '../poi/utils';
import {MapDetailsComponent} from 'src/app/pages/map/map-details/map-details.component';
import {LangService} from '@wm-core/localization/lang.service';
import {LineString, Point} from 'geojson';
import {
  confAPP,
  confAUTHEnable,
  confGeohubId,
  confJIDOUPDATETIME,
  confMAP,
  confOPTIONS,
  confPOIS,
  confPOISFilter,
  confPoisIcons,
  confRecordTrackShow,
} from '@wm-core/store/conf/conf.selector';
import {ISlopeChartHoverElements} from '@wm-core/types/slope-chart';
import {HomePage} from '../home/home.page';
import {IAPP} from '@wm-core/types/config';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {hitMapFeatureCollection} from 'src/app/shared/map-core/src/store/map-core.selector';
import {DeviceService} from '@wm-core/services/device.service';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {ecLayer, inputTyped} from '@wm-core/store/user-activity/user-activity.selector';
import {WmFeature} from '@wm-types/feature';
import {poi, track} from '@wm-core/store/features/features.selector';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {
  currentEcPoiId,
  currentEcTrackProperties,
  currentPoiProperties,
} from '@wm-core/store/features/ec/ec.selector';
import {currentUgcPoiProperties, currentUgcTrack} from '@wm-core/store/features/ugc/ugc.selector';
import {WmGeoboxMapComponent} from '@wm-core/geobox-map/geobox-map.component';
import {online} from '@wm-core/store/network/network.selector';
import {INetworkRootState} from '@wm-core/store/network/netwotk.reducer';

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
  private scrollPositions: {[key: string]: number} = {};

  readonly trackColor$: BehaviorSubject<string> = new BehaviorSubject<string>('#caaf15');

  @ViewChild('fab1') fab1: IonFab;
  @ViewChild('fab2') fab2: IonFab;
  @ViewChild('fab3') fab3: IonFab;
  @ViewChild(WmGeoboxMapComponent) geoboxMap: WmGeoboxMapComponent;
  @ViewChild(HomePage) homeCmp: HomePage;
  @ViewChild('details') mapDetailsCmp: MapDetailsComponent;

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
  currentEcPoiId$ = this._store.select(currentEcPoiId);
  currentEcTrackProperties$ = this._store.select(currentEcTrackProperties).pipe(
    tap(trackProperties => {
      if (trackProperties?.id) {
        from(this._geohubSvc.isFavouriteTrack(trackProperties?.id))
          .pipe(take(1))
          .subscribe(isFav => this.isFavourite$.next(isFav));
      }
    }),
  );
  currentLayer$ = this._store.select(ecLayer);
  currentPoi$: Observable<WmFeature<Point>> = this._store.select(poi);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiNextID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiPrevID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiProperties$ = this._store.select(currentPoiProperties);
  currentPosition$: Observable<any>;
  currentRelatedPoi$: BehaviorSubject<IGeojsonFeature> =
    new BehaviorSubject<IGeojsonFeature | null>(null);
  currentTrack$: Observable<WmFeature<LineString>> = this._store.select(track);
  currentUgcPoiProperties$ = this._store.select(currentUgcPoiProperties);
  dataLayerUrls$: Observable<IDATALAYER>;
  detailsIsOpen$: Observable<boolean>;
  flowPopoverText$: BehaviorSubject<string | null> = new BehaviorSubject<null>(null);
  geohubId$ = this._store.select(confGeohubId);
  imagePoiToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFavourite$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLogged$: Observable<boolean> = this._store.select(isLogged);
  isTrackRecordingEnable$: Observable<boolean> = this._store.select(confRecordTrackShow);
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
  ugcTrack$: Observable<WmFeature<LineString> | null> = this._store.select(currentUgcTrack);
  wmMapFeatureCollectionOverlay$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(
    null,
  );
  wmMapHitMapUrl$: Observable<string | null> = this.confMap$.pipe(map(conf => conf?.hitMapUrl));
  wmMapPositionfocus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private _store: Store,
    private _storeNetwork: Store<INetworkRootState>,
    private _cdr: ChangeDetectorRef,
    private _deviceSvc: DeviceService,
    private _geohubSvc: GeohubService,
    private _shareSvc: ShareService,
    private _geolocationSvc: GeolocationService,
    private _langSvc: LangService,
    private _urlHandlerSvc: UrlHandlerService,
    _platform: Platform,
  ) {
    this._geolocationSvc.startNavigation();
    this.currentPoiProperties$.subscribe(p => {
      if (p == null) {
        this.getPosition();
      }
    });
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
  }

  async favourite(trackID): Promise<void> {
    const isFav = await this._geohubSvc.setFavouriteTrack(trackID, !this.isFavourite$.value);
    this.isFavourite$.next(isFav);
  }

  getPosition(): void {
    const pos = this.scrollPositions['track'];
    setTimeout(() => {
      document.getElementsByTagName('ion-card-content')[0].scrollTo(0, pos);
    }, 0);
  }

  goToPage(page: string): void {
    this.close();
    this._urlHandlerSvc.changeURL(page, {});
  }

  ionViewWillEnter(): void {
    this.scrollPositions = {};
  }

  ionViewWillLeave(): void {
    this._poiReset();
    this.resetEvt$.next(this.resetEvt$.value + 1);
    this.resetSelectedPopup$.next(!this.resetSelectedPopup$.value);
    this.showDownload$.next(false);
  }

  navigation(): void {
    this._geolocationSvc.startNavigation();
    const isFocused = !this.wmMapPositionfocus$.value;
    this.wmMapPositionfocus$.next(isFocused);
    const isOpen = this.mapDetailsCmp.isOpen$.value;
    this.previewTrack$.next(false);
    if (isFocused && isOpen) {
      this.mapDetailsCmp.onlyTitle();
    }
  }

  openPoiShare(poiId: number): void {
    this._shareSvc.sharePoiByID(poiId);
  }

  openPopup(popup): void {
    this.popup$.next(popup);
    if (popup != null && popup != '') {
      this.mapDetailsCmp.open();
    } else {
      this.mapDetailsCmp.none();
    }
  }

  openTrackDownload(): void {
    this.mapDetailsCmp.background();
    setTimeout(() => {
      this.showDownload$.next(true);
    }, 300);
  }

  openTrackShare(trackId: number): void {
    this._shareSvc.shareTrackByID(trackId);
  }

  savePosition(key = 'track'): void {
    const currentScrollPosition = document.getElementsByTagName('ion-card-content')[0].scrollTop;
    this.scrollPositions[key] = currentScrollPosition;
  }

  setCurrentRelatedPoi(feature: number | WmFeature<Point> | null): void {
    if (feature == null) {
      return;
    } else if (typeof feature === 'number') {
      this._urlHandlerSvc.updateURL({ec_related_poi: feature});
    } else if (feature.properties != null && feature.properties.id != null) {
      const id = feature.properties.id;
      this._urlHandlerSvc.updateURL({ec_related_poi: id});
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

  toogleFullMap(): void {
    this.modeFullMap = !this.mapDetailsCmp.toggle();
  }

  updateEcTrack(track = undefined): void {
    const params = {ugc_track: undefined, track};
    if (track == null) {
      params['ec_related_poi'] = undefined;
    }

    this._urlHandlerSvc.updateURL(params);
  }

  async url(url) {
    await Browser.open({url});
  }

  private _poiReset(): void {
    this.currentRelatedPoi$.next(null);
    this.resetSelectedPoi$.next(!this.resetSelectedPoi$.value);
  }
}
