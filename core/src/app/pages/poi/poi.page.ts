import {Observable, Subscription} from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {IGeojsonPoi, IGeojsonPoiDetailed} from 'src/app/types/model';
import {NavController} from '@ionic/angular';
import {beforeInit, setTransition, setTranslate} from './utils';
import {filter, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {Browser} from '@capacitor/browser';
import {Store} from '@ngrx/store';
import {Feature, LineString} from 'geojson';
import {getEcTrack} from '@wm-core/utils/localForage';
import {poi, track} from '@wm-core/store/features/features.selector';
@Component({
  standalone: false,
  selector: 'app-poi',
  templateUrl: './poi.page.html',
  styleUrls: ['./poi.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoiPage implements OnInit, OnDestroy {
  private _changePoiEVT$: EventEmitter<'prev' | 'next'> = new EventEmitter<'prev' | 'next'>();
  private _changePoiSub: Subscription = Subscription.EMPTY;

  currentPoi$ = this._store.select(poi);
  currentTrack$: Observable<Feature<LineString>> = this._store.select(track);
  nextPoiID$: Observable<number>;
  poiIdx: number;
  pois: Array<IGeojsonPoiDetailed> = [];
  prevPoiID$: Observable<number>;
  route: Feature;
  selectedPoi: IGeojsonPoiDetailed;
  slideOptions = {
    on: {
      beforeInit,
      setTranslate,
      setTransition,
    },
  };
  sliderOptions: any = {
    slidesPerView: 1.3,
  };
  track;
  useAnimation = false;
  useCache = false;

  constructor(private _navController: NavController, private _store: Store) {
    this._changePoiSub = this._changePoiEVT$
      .pipe(withLatestFrom(this.prevPoiID$, this.nextPoiID$))
      .subscribe(([evt, prev, next]) => {});
  }

  ngOnInit() {
    this.currentTrack$
      .pipe(
        take(1),
        tap(t => (this.route = t)),
        filter(g => g != null),
        switchMap(f => getEcTrack(`${f.properties.id}`)),
      )
      .subscribe(d => {
        this.useCache = d != null;
      });

    setTimeout(() => {
      this.useAnimation = true;
    }, 1000);
  }

  ngOnDestroy(): void {
    this._changePoiSub.unsubscribe();
  }

  back() {
    this._navController.back();
  }

  clickPoi(poi: IGeojsonPoi) {}

  email(_): void {}

  nextPoi() {
    this._changePoiEVT$.emit('next');
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

  async url(url) {
    await Browser.open({url});
  }
}
