import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {NavController} from '@ionic/angular';
import {IGeojsonFeature, IGeojsonPoi, IGeojsonPoiDetailed} from 'src/app/types/model';
import {Browser} from '@capacitor/browser';
import {DownloadService} from 'src/app/services/download.service';
import {Store} from '@ngrx/store';
import {IMapRootState} from 'src/app/store/map/map';
import {Observable, Subscription} from 'rxjs';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {
  mapCurrentPoi,
  mapCurrentRelatedPoi,
  mapCurrentTrack,
  nextPoiID,
  prevPoiID,
} from 'src/app/store/map/map.selector';
import {filter, mergeMap, shareReplay, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {setCurrentPoiId} from 'src/app/store/map/map.actions';

@Component({
  selector: 'app-poi',
  templateUrl: './poi.page.html',
  styleUrls: ['./poi.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoiPage implements OnInit, OnDestroy {
  public route: IGeojsonFeature;
  public pois: Array<IGeojsonPoiDetailed>;
  public selectedPoi: IGeojsonPoiDetailed;
  public track;

  public useCache = false;

  public useAnimation = false;

  public poiIdx: number;

  public sliderOptions: any = {
    slidesPerView: 1.3,
  };
  currentTrack$: Observable<CGeojsonLineStringFeature> = this._storeMap.select(mapCurrentTrack);
  relatedPoi$: Observable<IGeojsonPoiDetailed[]> = this._storeMap.select(mapCurrentRelatedPoi);
  currentPoi$: Observable<IGeojsonPoiDetailed> = this._storeMap.select(mapCurrentPoi);
  nextPoiID$: Observable<number> = this._storeMap.select(nextPoiID);
  prevPoiID$: Observable<number> = this._storeMap.select(prevPoiID);
  private _changePoiEVT$: EventEmitter<'prev' | 'next'> = new EventEmitter<'prev' | 'next'>();
  private _changePoiSub: Subscription = Subscription.EMPTY;
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

  async ngOnInit() {
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
      this.updatePoiMarkers();
    }, 0);

    setTimeout(() => {
      this.useAnimation = true;
    }, 1000);
  }

  back() {
    this._navController.back();
  }

  private updatePoiMarkers() {
    const res = [];
    this.pois.forEach(poi => {
      // poi.isSmall = true; // poi != this.selectedPoi;
      res.push(poi);
    });
    this.pois = res;
  }

  async clickPoi(poi: IGeojsonPoi) {
    if (poi != null) {
      this._storeMap.dispatch(setCurrentPoiId({currentPoiId: +poi.properties.id}));
    }
    // this.updatePoiMarkers();
  }

  prevPoi() {
    this._changePoiEVT$.emit('prev');
  }

  nextPoi() {
    this._changePoiEVT$.emit('next');
  }

  selectPoiById(id: number) {
    const selectedPoi = this.pois.find(p => p.properties.id == id);
    this.selectPoi(selectedPoi);
  }

  selectPoi(poi: IGeojsonPoi) {
    this.selectedPoi = this.pois.find(p => p.properties.id == poi.properties.id);
    this.poiIdx = this.pois.findIndex(p => p.properties.id == poi.properties.id);
    // this.updatePoiMarkers();
  }

  phone(phoneNumber) {
    console.log('------- ~ file: poi.page.ts ~ line 75 ~ PoiPage ~ phone ~ phone', phoneNumber);
  }

  email(email) {
    console.log('------- ~ file: poi.page.ts ~ line 80 ~ PoiPage ~ email ~ email');
  }

  async url(url) {
    console.log('------- ~ file: poi.page.ts ~ line 85 ~ PoiPage ~ url ~ url', url);
    await Browser.open({url});
  }

  showPhoto(idx) {
    // this._statusService.showPhoto(true, this.selectedPoi.properties.images, idx);
  }

  ngOnDestroy(): void {
    this._changePoiSub.unsubscribe();
  }
}
