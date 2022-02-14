import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { auditTime, map, take } from 'rxjs/operators';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { CoinService } from 'src/app/services/coin.service';
import { DownloadService } from 'src/app/services/download.service';
import { GeohubService } from 'src/app/services/geohub.service';
import { ShareService } from 'src/app/services/share.service';
import { StatusService } from 'src/app/services/status.service';
import { downloadPanelStatus } from 'src/app/types/downloadpanel.enum';
import {
  IGeojsonFeature,
  IGeojsonPoi,
  IGeojsonPoiDetailed,
} from 'src/app/types/model';
import { ISlopeChartHoverElements } from 'src/app/types/slope-chart';

@Component({
  selector: 'webmapp-route',
  templateUrl: './route.page.html',
  styleUrls: ['./route.page.scss'],
})
export class RoutePage implements OnInit {
  @ViewChild('routeTabs') routeTabs: IonTabs;

  public route: IGeojsonFeature;
  public isFavourite: boolean = false;
  public useAnimation = false;
  public useCache = false;

  public track;
  public pois: Array<IGeojsonPoi> = null;

  public modeFullMap = false;
  public showToolBarOver = false;
  public hideToolBarOver = false;
  public scrollThreshold = 50;
  public scrollShowButtonThreshold = 450;

  public opacity = 1;
  public headerHeight = 105;
  public height = 700; //will be updated by real screen height
  public maxInfoHeigtDifference = 80;
  public maxInfoheight = 850; //from CCS????
  public minInfoheight = 350; //from CCS????

  public showDownload = false;

  public slopeChartHoverElements: ISlopeChartHoverElements;

  private _tabChildEventSubscriptions: Array<Subscription> = [];

  public mapDegrees = 0;

  public slideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 5,
    slidesOffsetAfter: 5,
    slidesOffsetBefore: 5,
    slidesPerView: 3.5,
  };

  @ViewChild('dragHandleIcon') dragHandleIcon: ElementRef;
  @ViewChild('dragHandleContainer') dragHandleContainer: ElementRef;
  @ViewChild('mapcontainer') mapControl: ElementRef;
  @ViewChild('map') mapComponent: MapComponent;
  @ViewChild('headerPageRoute') headerControl: ElementRef;
  @ViewChild('header') header: ElementRef;
  @ViewChild('lessdetails') lessDetails: ElementRef;
  @ViewChild('moredetails') moreDetails: ElementRef;
  private animation?: Animation;
  private gesture?: Gesture;

  private started: boolean = false;
  private initialStep: number = 0;

  private actualDownloadStatus: downloadPanelStatus;

  private relatedPois: IGeojsonPoiDetailed[] = null;

  constructor(
    private _actRoute: ActivatedRoute,
    private _geohubService: GeohubService,
    private _navController: NavController,
    private _menuController: MenuController,
    private _statusService: StatusService,
    private _platform: Platform,
    private animationCtrl: AnimationController,
    private gestureCtrl: GestureController,
    private _shareService: ShareService,
    private _coinService: CoinService,
    private downloadService: DownloadService,
    private _alertController: AlertController,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    // this._actRoute.queryParams.subscribe(async (params) => {
    //   const id = params.id;
    //   this.route = await this._geohubService.getEcRoute(id);
    //   console.log('------- ~ file: route.page.ts ~ line 44 ~ RoutePage ~ this._actRoute.queryParams.subscribe ~ this.route', this.route);
    //   this._statusService.route = this.route;
    //   this.track = this.route.geometry;
    // });

    this.route = this._statusService.route;

    if (!this.route) {
      const params = await this._actRoute.queryParams.pipe(take(1)).toPromise();
      const id = params.id ? params.id : 4; //TODO only for debug
      this.route = await this._geohubService.getEcTrack(id);
      this._statusService.route = this.route;
    }

    this.isFavourite = await this._geohubService.isFavouriteTrack(
      this.route.properties.id
    );

    this.pois = await this._geohubService.getPoiForTrack(
      this.route.properties.id
    );
    // this.updatePoiMarkers(false);

    await this.setAnimations();

    this.getRelatedPois();

    this.useCache = await this.downloadService.isDownloadedTrack(
      this.route.properties.id
    );

    setTimeout(() => {
      this.updatePoiMarkers(false);
    }, 300);
    setTimeout(() => {
      this.track = this.route.geometry;
    }, 400);
    setTimeout(() => {
      this.useAnimation = true;
    }, 500);
  }

  async setAnimations() {
    await this._platform.ready();
    this.height = this._platform.height();
    this.maxInfoheight = this.height - this.maxInfoHeigtDifference;
    const animationPanel = this.animationCtrl
      .create()
      .addElement(this.dragHandleContainer.nativeElement)
      .fromTo(
        'transform',
        'translateY(0)',
        `translateY(-${this.maxInfoheight - this.minInfoheight}px)`
      );

    // const animationHeader = this.animationCtrl
    //   .create()
    //   .addElement(this.header.nativeElement)
    //   .fromTo('opacity', '0', '1');

    // const animationDetails = this.animationCtrl
    //   .create()
    //   .addElement(this.lessDetails.nativeElement)
    //   .fromTo('opacity', '1', '0');
    // const animationMoreDetails = this.animationCtrl
    //   .create()
    //   .addElement(this.moreDetails.nativeElement)
    //   .fromTo('opacity', '0', '1');

    this.animation = this.animationCtrl
      .create()
      .duration(500)
      .addAnimation([
        // animationHeader,
        animationPanel,
        // animationDetails,
        // animationMoreDetails,
      ]);

    // this.gesture = this.gestureCtrl.create({
    //   el: this.dragHandleIcon.nativeElement,
    //   threshold: 0,
    //   gestureName: 'handler-drag',
    //   onMove: (ev) => this.onMove(ev),
    //   onEnd: (ev) => this.onEnd(ev),
    // });
    this.gesture = this.gestureCtrl.create({
      el: this.lessDetails.nativeElement,
      threshold: 0,
      gestureName: 'handler-drag',
      onMove: (ev) => this.onMove(ev),
      onEnd: (ev) => this.onEnd(ev),
    });

    this.gesture.enable(true);
  }

  async getRelatedPois() {
    this.relatedPois = await this._geohubService.getDetailsPoisForTrack(
      this.route.properties.id
    );
    this._statusService.setPois(this.relatedPois, 0);
  }

  mapRotation(deg) {
    this.mapDegrees = deg;
  }

  orientNorth() {
    this.mapComponent.orientNorth();
  }

  handleClick() {
    const shouldComplete = this.opacity >= 1;
    this.endAnimation(shouldComplete, this.opacity ? 0 : 1);
  }

  menu() {
    this._menuController.enable(true, 'optionMenu');
    this._menuController.open('optionMenu');
  }

  closeMenu() {
    this._menuController.close('optionMenu');
  }

  share() {
    this._shareService.shareRoute(this.route);
  }

  async favourite() {
    console.log(
      '------- ~ file: route.page.ts ~ line 38 ~ RoutePage ~ favourite ~ favourite',
      this.isFavourite
    );
    this.isFavourite = await this._geohubService.setFavouriteTrack(
      this.route.properties.id,
      !this.isFavourite
    );
    console.log(
      '------- ~ file: route.page.ts ~ line 38 ~ RoutePage ~ favourite ~ favourite',
      this.isFavourite
    );
  }

  navigate() {
    console.log('navigate function not implemented');
  }

  back() {
    this._navController.back();
  }

  mapHeigth() {
    const mapHeight =
      this.height -
      (this.headerHeight + this.maxInfoheight) * (1 - this.opacity);
    const mapPaddingTop = this.headerHeight * (1 - this.opacity);
    const mapPaddingBottom =
      this.maxInfoheight * (1 - this.opacity) +
      this.minInfoheight * this.opacity;
    let ret = [mapHeight, mapPaddingTop, mapPaddingBottom];
    return ret;
  }

  private onMove(ev) {
    if (!this.started) {
      this.animation.progressStart(false);
      this.started = true;
    }
    const step = this.getStep(ev);
    this.animation.progressStep(step);
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

  private updatePoiMarkers(isSmall) {
    const res = [];
    this.pois.forEach((poi) => {
      poi.isSmall = isSmall;
      res.push(poi);
    });
    this.pois = res;
  }

  async clickPoi(poi: IGeojsonPoi) {
    this._statusService.setPois(this.relatedPois, poi.properties.id);
    this._navController.navigateForward(['poi']);
  }

  private endAnimation(shouldComplete: boolean, step: number) {
    console.log("------- ~ RoutePage ~ endAnimation ~ this.maxInfoheight - this.minInfoheight", this.maxInfoheight, this.minInfoheight);
      this.animation.progressEnd(shouldComplete ? 1 : 0, step);
    this.animation.onFinish(() => {
      this.gesture.enable(true);
      this.updatePoiMarkers(this.opacity < 0.5);
      this._subscribeToTabsEvents();
      setTimeout(() => {
        this._subscribeToTabsEvents();
      }, 1000);
    });
    // this.animationMapTop.onFinish(() => { this.gesture.enable(true); });
    // this.animationMapHeight.onFinish(() => { this.gesture.enable(true); });

    this.opacity = shouldComplete ? 0 : 1;

    this._statusService.showingRouteDetails = shouldComplete;

    this.initialStep = shouldComplete
      ? this.maxInfoheight - this.minInfoheight
      : 0;
    this.started = false;
  }

  private _subscribeToTabsEvents() {
    // Delete previous subscription
    for (let i in this._tabChildEventSubscriptions) {
      if (this._tabChildEventSubscriptions[i]?.unsubscribe)
        this._tabChildEventSubscriptions[i].unsubscribe();
    }
    this._tabChildEventSubscriptions = [];

    // Subscribe to tab change event
    if (this.routeTabs) {
      this._tabChildEventSubscriptions.push(
        this.routeTabs.ionTabsDidChange.subscribe(() => {
          this._subscribeToTabsEvents();
        })
      );

      // Subscribe to event if available
      if (
        (<any>this.routeTabs?.outlet)?.activated?.instance?.slopeChartHover
          ?.subscribe
      ) {
        this._tabChildEventSubscriptions.push(
          (<any>this.routeTabs.outlet).activated.instance.slopeChartHover
            .pipe(auditTime(100))
            .subscribe((elements: ISlopeChartHoverElements) => {
              this.slopeChartHoverElements = elements;
            })
        );
      }
    } else this.slopeChartHoverElements = undefined;
  }

  private clamp(min: number, n: number, max: number) {
    const val = Math.max(min, Math.min(n, max));
    this.opacity = 1 - val;
    return val;
  }

  private getStep(ev) {
    const delta = this.initialStep - ev.deltaY;
    return this.clamp(0, delta / (this.maxInfoheight - this.minInfoheight), 1);
  }

  public async download() {
    const modalres = await this._coinService.openModal();

    if (modalres) {
      this.showDownload = true;
    }
  }

  public downloadStatus(status: downloadPanelStatus) {
    this.actualDownloadStatus = status;
  }

  public async endDownload(requireConfirm = false) {
    if (
      requireConfirm &&
      this.actualDownloadStatus == downloadPanelStatus.DOWNLOADING
    ) {
      const translation = await this.translate
        .get([
          'pages.route.modalconfirm.title',
          'pages.route.modalconfirm.text',
          'pages.route.modalconfirm.confirm',
          'pages.route.modalconfirm.cancel',
        ])
        .toPromise();

      const alert = await this._alertController.create({
        cssClass: 'my-custom-class',
        header: translation['pages.route.modalconfirm.title'],
        message: translation['pages.route.modalconfirm.text'],
        buttons: [
          {
            text: translation['pages.route.modalconfirm.cancel'],
            cssClass: 'webmapp-modalconfirm-btn',
            role: 'cancel',
            handler: () => { },
          },
          {
            text: translation['pages.route.modalconfirm.confirm'],
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

  public toogleFullMap() {
    this.modeFullMap = !this.modeFullMap;
  }

  public lastScroll = 0;
  public scroll(ev) {
    const scrolled = ev.detail.currentY;
    if(scrolled > this.scrollThreshold && this.lastScroll <= this.scrollThreshold && this.opacity == 1){
      this.endAnimation(true,0.5);
    }
    if(scrolled <= 0 && this.lastScroll > 0 && this.opacity == 0){
      this.endAnimation(false,0.5);
    }
    
    this.hideToolBarOver = scrolled > this.scrollShowButtonThreshold/2;

    this.showToolBarOver = scrolled > this.scrollShowButtonThreshold;

    

    this.lastScroll = scrolled;

  }
}
