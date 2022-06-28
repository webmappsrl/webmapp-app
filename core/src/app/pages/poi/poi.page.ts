import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {NavController, IonModal, IonSlides} from '@ionic/angular';
import {IGeojsonFeature, IGeojsonPoi, IGeojsonPoiDetailed} from 'src/app/types/model';
import {Browser} from '@capacitor/browser';
import {DownloadService} from 'src/app/services/download.service';
import {Store} from '@ngrx/store';
import {IMapRootState} from 'src/app/store/map/map';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {
  mapCurrentPoi,
  mapCurrentRelatedPoi,
  mapCurrentTrack,
  nextPoiID,
  prevPoiID,
} from 'src/app/store/map/map.selector';
import {filter, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {setCurrentPoiId} from 'src/app/store/map/map.actions';

@Component({
  selector: 'app-poi',
  templateUrl: './poi.page.html',
  styleUrls: ['./poi.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoiPage implements OnInit, OnDestroy {
  private _changePoiEVT$: EventEmitter<'prev' | 'next'> = new EventEmitter<'prev' | 'next'>();
  imagePoiToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _changePoiSub: Subscription = Subscription.EMPTY;
  @ViewChild(IonModal) modal: IonModal;
  @ViewChild('gallery') slider: IonSlides;

  currentPoi$: Observable<IGeojsonPoiDetailed> = this._storeMap.select(mapCurrentPoi);
  currentTrack$: Observable<CGeojsonLineStringFeature> = this._storeMap.select(mapCurrentTrack);
  nextPoiID$: Observable<number> = this._storeMap.select(nextPoiID);
  poiIdx: number;
  pois: Array<IGeojsonPoiDetailed> = [];
  prevPoiID$: Observable<number> = this._storeMap.select(prevPoiID);
  relatedPoi$: Observable<IGeojsonPoiDetailed[]> = this._storeMap.select(mapCurrentRelatedPoi);
  route: IGeojsonFeature;
  selectedPoi: IGeojsonPoiDetailed;
  sliderOptions: any = {
    slidesPerView: 1.3,
  };
  track;
  useAnimation = false;
  useCache = false;
  slideOptions = {
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.params = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const {slides} = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          let tx = -offset$$1;
          if (!swiper.params.virtualTranslate) tx -= swiper.translate;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const {slides, $wrapperEl} = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    },
  };

  constructor(
    private _navController: NavController,
    private downloadService: DownloadService,
    private _storeMap: Store<IMapRootState>,
  ) {
    this._changePoiSub = this._changePoiEVT$
      .pipe(withLatestFrom(this.prevPoiID$, this.nextPoiID$))
      .subscribe(([evt, prev, next]) => {
        this._storeMap.dispatch(setCurrentPoiId({currentPoiId: evt === 'prev' ? prev : next}));
      });
  }

  back() {
    this._navController.back();
  }

  clickPoi(poi: IGeojsonPoi) {
    if (poi != null) {
      this._storeMap.dispatch(setCurrentPoiId({currentPoiId: +poi.properties.id}));
    }
  }

  email(_): void {}

  nextPoi() {
    this._changePoiEVT$.emit('next');
  }

  ngOnDestroy(): void {
    this._changePoiSub.unsubscribe();
  }

  ngOnInit() {
    this.currentTrack$
      .pipe(
        take(1),
        tap(t => (this.route = t)),
        filter(g => g != null),
        switchMap(f => this.downloadService.isDownloadedTrack(f.properties.id)),
      )
      .subscribe(d => {
        this.useCache = d;
      });
    this.relatedPoi$.pipe(take(1)).subscribe(r => (this.pois = r));

    setTimeout(() => {
      this.useAnimation = true;
    }, 1000);
  }

  phone(_): void {}

  prevPoi() {
    this._changePoiEVT$.emit('prev');
  }

  selectPoi(poi: IGeojsonPoi) {
    this.selectedPoi = this.pois.find(p => p.properties.id == poi.properties.id);
    this.poiIdx = this.pois.findIndex(p => p.properties.id == poi.properties.id);
  }

  selectPoiById(id: number) {
    const selectedPoi = this.pois.find(p => p.properties.id == id);
    this.selectPoi(selectedPoi);
  }

  showPhoto(idx) {
    this.imagePoiToggle$.next(true);
    setTimeout(() => {
      this.slider.slideTo(idx);
    }, 50);
  }

  async url(url) {
    await Browser.open({url});
  }
}
