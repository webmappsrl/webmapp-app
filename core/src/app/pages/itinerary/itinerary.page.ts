import {BackgroundGeolocation} from '@awesome-cordova-plugins/background-geolocation/ngx';
import {GeolocationPage} from 'src/app/pages/abstract/geolocation';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AlertController,
  Animation,
  AnimationController,
  Gesture,
  GestureController,
  IonTabs,
  MenuController,
  NavController,
  Platform,
} from '@ionic/angular';
import {Store} from '@ngrx/store';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {auditTime, switchMap, take, tap, map} from 'rxjs/operators';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {OldMapComponent} from 'src/app/components/map/old-map/map.component';
import {AuthService} from 'src/app/services/auth.service';
import {CoinService} from 'src/app/services/coin.service';
import {GeohubService} from 'src/app/services/geohub.service';
import {ShareService} from 'src/app/services/share.service';
import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {confAUTHEnable, confMAP} from 'src/app/store/conf/conf.selector';
import {IMapRootState} from 'src/app/store/map/map';
import {setCurrentPoiId, setCurrentTrackId} from 'src/app/store/map/map.actions';
import {mapCurrentTrack, mapCurrentTrackProperties, padding} from 'src/app/store/map/map.selector';
import {downloadPanelStatus} from 'src/app/types/downloadpanel.enum';
import {
  IGeojsonFeature,
  IGeojsonFeatureDownloaded,
  IGeojsonPoi,
  IGeojsonProperties,
} from 'src/app/types/model';
import {ISlopeChartHoverElements} from 'src/app/types/slope-chart';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-charts';
import {LangService} from 'src/app/shared/wm-core/localization/lang.service';

@Component({
  selector: 'webmapp-itinerary',
  templateUrl: './itinerary.page.html',
  styleUrls: ['./itinerary.page.scss'],
  providers: [LangService],
  encapsulation: ViewEncapsulation.None,
})
export class ItineraryPage extends GeolocationPage implements AfterViewInit, OnDestroy {
  private _flowLine$: BehaviorSubject<null | {
    flow_line_quote_orange: number;
    flow_line_quote_red: number;
  }> = new BehaviorSubject<null>(null);
  private _tabChildEventSubscriptions: Array<Subscription> = [];
  private _trackID: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  private actualDownloadStatus: downloadPanelStatus;
  private animation?: Animation;
  private gesture?: Gesture;
  private initialStep: number = 0;
  private started: boolean = false;

  @ViewChild('dragHandleContainer') dragHandleContainer: ElementRef;
  @ViewChild('dragHandleIcon') dragHandleIcon: ElementRef;
  @ViewChild('header') header: ElementRef;
  @ViewChild('headerPageItinerary') headerControl: ElementRef;
  @ViewChild('itineraryTabs') itineraryTabs: IonTabs;
  @ViewChild('lessdetails') lessDetails: ElementRef;
  @ViewChild('map') mapComponent: OldMapComponent;
  @ViewChild('mapcontainer') mapControl: ElementRef;
  @ViewChild('moredetails') moreDetails: ElementRef;

  authEnable$: Observable<boolean> = this._storeConf.select(confAUTHEnable);
  currentTrack$: Observable<CGeojsonLineStringFeature | IGeojsonFeatureDownloaded> =
    this._storeMap.select(mapCurrentTrack);
  currentTrackProperties$: Observable<IGeojsonProperties> = this._storeMap
    .select(mapCurrentTrackProperties)
    .pipe(
      tap(p => {
        if (p != null && p.id != null) {
          this._trackID.next(p.id);
        }
      }),
    );
  flowPopoverText$: BehaviorSubject<string | null> = new BehaviorSubject<null>(null);
  focus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public headerHeight = 105;
  public height = 700;
  public hideToolBarOver = false;
  public isFavourite: boolean = false;
  isFavourite$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean>;
  public itinerary: IGeojsonFeature;
  public lastScroll = 0;
  mapConf$: Observable<any> = this._storeConf.select(confMAP).pipe(
    tap(conf => {
      if (conf.flow_line_quote_show) {
        this._flowLine$.next({
          flow_line_quote_orange: conf.flow_line_quote_orange,
          flow_line_quote_red: conf.flow_line_quote_red,
        });
      }
    }),
  );
  public mapDegrees = 0;
  //will be updated by real screen height
  public maxInfoHeigtDifference = 80;
  public maxInfoheight = 850;
  //from CCS????
  public minInfoheight = 350;
  public modeFullMap = false;
  nearestPoi$: BehaviorSubject<Feature<Geometry> | null> =
    new BehaviorSubject<Feature<Geometry> | null>(null);
  public opacity = 1;
  padding$: Observable<number[]> = this._storeMap.select(padding);
  public pois: Array<IGeojsonPoi> = null;
  public scrollShowButtonThreshold = 450;
  public scrollThreshold = 50;
  //from CCS????
  public showDownload = false;
  public showToolBarOver = false;
  public slideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 5,
    slidesOffsetAfter: 5,
    slidesOffsetBefore: 5,
    slidesPerView: 3.5,
  };
  public slopeChartHoverElements: ISlopeChartHoverElements;
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);
  public useAnimation = false;
  public useCache = false;

  constructor(
    private _navController: NavController,
    private _menuController: MenuController,
    private _platform: Platform,
    private animationCtrl: AnimationController,
    private gestureCtrl: GestureController,
    private _alertController: AlertController,
    private _translate: LangService,
    private _storeMap: Store<IMapRootState>,
    private _shareService: ShareService,
    private _geohubService: GeohubService,
    private _coinService: CoinService,
    private _storeConf: Store<IConfRootState>,
    private _authSvc: AuthService,
    backgroundGeolocation: BackgroundGeolocation,
  ) {
    super(backgroundGeolocation);
    this.isLoggedIn$ = this._authSvc.isLoggedIn$;
    this.currentTrackProperties$
      .pipe(
        switchMap(t => {
          const trackId = t != null ? t.id ?? null : null;
          if (trackId != null) {
            return this._geohubService.isFavouriteTrack(trackId);
          }
          return of(false);
        }),
        take(1),
      )
      .subscribe(initFav => {
        this.isFavourite$.next(initFav);
      });
  }

  back() {
    this._navController.back();
  }

  clickPoi(poi: IGeojsonPoi | Feature<Geometry> | number) {
    console.log(poi);
    let id = poi;
    this._navController.navigateForward(['poi']);
    setTimeout(() => {
      id = typeof id === 'number' ? id : poi && (poi as any)?.getId();
      if (id == undefined) {
        const prop = (poi as Feature<Geometry>).getProperties();
        if (prop != null && prop.id != null) {
          id = prop.id;
        }
      }
      this._storeMap.dispatch(setCurrentPoiId({currentPoiId: +id}));
    }, 500);
  }

  closeMenu() {
    this._menuController.close('optionMenu');
  }

  public async download() {
    /*  const modalres = await this._coinService.openModal();
    if (modalres) {
      this.showDownload = true;
    }
    */
    this.showDownload = true;
  }

  public downloadStatus(status: downloadPanelStatus) {
    this.actualDownloadStatus = status;
  }

  public async endDownload(requireConfirm = false) {
    if (requireConfirm && this.actualDownloadStatus == downloadPanelStatus.DOWNLOADING) {
      const translation = await this._translate
        .get([
          'pages.itinerary.modalconfirm.title',
          'pages.itinerary.modalconfirm.text',
          'pages.itinerary.modalconfirm.confirm',
          'pages.itinerary.modalconfirm.cancel',
        ])
        .toPromise();

      const alert = await this._alertController.create({
        cssClass: 'my-custom-class',
        header: translation['pages.itinerary.modalconfirm.title'],
        message: translation['pages.itinerary.modalconfirm.text'],
        buttons: [
          {
            text: translation['pages.itinerary.modalconfirm.cancel'],
            cssClass: 'webmapp-modalconfirm-btn',
            role: 'cancel',
            handler: () => {},
          },
          {
            text: translation['pages.itinerary.modalconfirm.confirm'],
            cssClass: 'webmapp-modalconfirm-btn',
            handler: () => {
              this.showDownload = false;
            },
          },
        ],
      });

      await alert.present();
    } else {
      this.showDownload = false;
    }
  }

  async favourite() {
    this.isFavourite = await this._geohubService.setFavouriteTrack(
      this._trackID.value,
      !this.isFavourite$.value,
    );

    this.isFavourite$.next(!this.isFavourite$.value);
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

  handleClick() {
    const shouldComplete = this.opacity >= 1;
    this.endAnimation(shouldComplete, this.opacity ? 0 : 1);
  }

  mapHeigth() {
    const mapHeight = this.height - (this.headerHeight + this.maxInfoheight) * (1 - this.opacity);
    const mapPaddingTop = this.headerHeight * (1 - this.opacity);
    const mapPaddingBottom =
      this.maxInfoheight * (1 - this.opacity) + this.minInfoheight * this.opacity;
    let ret = [mapHeight, mapPaddingTop, mapPaddingBottom];
    return ret;
  }

  mapRotation(deg) {
    this.mapDegrees = deg;
  }

  navigate() {
    this.closeMenu();
    this.focus$.next(true);
    this.modeFullMap = true;
  }

  ngAfterViewInit(): void {
    // this.setAnimations();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: null}));
  }

  orientNorth() {
    this.mapComponent.orientNorth();
  }

  resetFocus(): void {
    if (this.focus$.value === true) {
      this.modeFullMap = false;
    }
    this.focus$.next(false);
  }

  public scroll(ev) {
    const scrolled = ev.detail.currentY;
    if (
      scrolled > this.scrollThreshold &&
      this.lastScroll <= this.scrollThreshold &&
      this.opacity == 1
    ) {
      this.endAnimation(true, 0.5);
    }
    if (scrolled <= 0 && this.lastScroll > 0 && this.opacity == 0) {
      this.endAnimation(false, 0.5);
    }

    this.hideToolBarOver = scrolled > this.scrollShowButtonThreshold / 2;

    this.showToolBarOver = scrolled > this.scrollShowButtonThreshold;

    this.lastScroll = scrolled;
  }

  async setAnimations() {
    await this._platform.ready();
    this.height = this._platform.height();
    this.maxInfoheight = this.height - this.maxInfoHeigtDifference;
    if (this.dragHandleContainer != null && this.dragHandleContainer.nativeElement != null) {
      const animationPanel = this.animationCtrl
        .create()
        .addElement(this.dragHandleContainer.nativeElement)
        .fromTo(
          'transform',
          'translateY(0)',
          `translateY(-${this.maxInfoheight - this.minInfoheight}px)`,
        );

      this.animation = this.animationCtrl.create().duration(500).addAnimation([animationPanel]);
    }
    this.gesture = this.gestureCtrl.create({
      el: this.lessDetails.nativeElement,
      threshold: 0,
      gestureName: 'handler-drag',
      onMove: ev => this.onMove(ev),
      onEnd: ev => this.onEnd(ev),
    });

    this.gesture.enable(true);
  }

  public setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
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

  share() {
    this._shareService.shareTrackByID(this._trackID.value);
  }

  public toogleFullMap() {
    this.modeFullMap = !this.modeFullMap;
    if (this.modeFullMap === false) {
      this.focus$.next(false);
    }
  }

  private _subscribeToTabsEvents() {
    // Delete previous subscription
    for (let i in this._tabChildEventSubscriptions) {
      if (this._tabChildEventSubscriptions[i]?.unsubscribe)
        this._tabChildEventSubscriptions[i].unsubscribe();
    }
    this._tabChildEventSubscriptions = [];

    // Subscribe to tab change event
    if (this.itineraryTabs) {
      this._tabChildEventSubscriptions.push(
        this.itineraryTabs.ionTabsDidChange.subscribe(() => {
          this._subscribeToTabsEvents();
        }),
      );

      // Subscribe to event if available
      if ((<any>this.itineraryTabs?.outlet)?.activated?.instance?.slopeChartHover?.subscribe) {
        this._tabChildEventSubscriptions.push(
          (<any>this.itineraryTabs.outlet).activated.instance.slopeChartHover
            .pipe(auditTime(100))
            .subscribe((elements: ISlopeChartHoverElements) => {
              this.slopeChartHoverElements = elements;
            }),
        );
      }
    } else this.slopeChartHoverElements = undefined;
  }

  private clamp(min: number, n: number, max: number) {
    const val = Math.max(min, Math.min(n, max));
    this.opacity = 1 - val;
    return val;
  }

  private endAnimation(shouldComplete: boolean, step: number) {
    console.log(
      '------- ~ ItineraryPage ~ endAnimation ~ this.maxInfoheight - this.minInfoheight',
      this.maxInfoheight,
      this.minInfoheight,
    );
    this.animation.progressEnd(shouldComplete ? 1 : 0, step);
    this.animation.onFinish(() => {
      this.gesture.enable(true);
      this._subscribeToTabsEvents();
      setTimeout(() => {
        this._subscribeToTabsEvents();
      }, 1000);
    });
    // this.animationMapTop.onFinish(() => { this.gesture.enable(true); });
    // this.animationMapHeight.onFinish(() => { this.gesture.enable(true); });

    this.opacity = shouldComplete ? 0 : 1;

    this.initialStep = shouldComplete ? this.maxInfoheight - this.minInfoheight : 0;
    this.started = false;
  }

  private getStep(ev) {
    const delta = this.initialStep - ev.deltaY;
    return this.clamp(0, delta / (this.maxInfoheight - this.minInfoheight), 1);
  }

  private onEnd(ev) {
    if (!this.started) {
      return;
    }

    this.gesture.enable(false);

    const step = this.getStep(ev);
    const shouldComplete = step > 0.5;

    this.endAnimation(shouldComplete, step);
  }

  private onMove(ev) {
    if (!this.started) {
      this.animation.progressStart(false);
      this.started = true;
    }
    const step = this.getStep(ev);
    this.animation.progressStep(step);
  }
}
