import {BehaviorSubject, Observable, combineLatest} from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {IonSlides, NavController} from '@ionic/angular';
import {beforeInit, setTransition, setTranslate} from '../poi/utils';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {setCurrentPoiId, setCurrentTrackId} from 'src/app/store/map/map.actions';

import {Browser} from '@capacitor/browser';
import {DeviceService} from 'src/app/services/base/device.service';
import {IGeojsonPoiDetailed} from 'src/app/types/model';
import {Store} from '@ngrx/store';
import {confMAP} from 'src/app/store/conf/conf.selector';
import {loadPois} from 'src/app/store/pois/pois.actions';
import {mapCurrentLayer} from 'src/app/store/map/map.selector';
import {pois} from 'src/app/store/pois/pois.selector';

@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapPage {
  @ViewChild('gallery') slider: IonSlides;
  confMap$: Observable<any> = this._store.select(confMAP).pipe(
    tap(c => {
      if (c != null && c.pois != null && c.pois.apppoisApiLayer == true) {
        this._store.dispatch(loadPois());
      }
    }),
  );
  currentLayer$ = this._store.select(mapCurrentLayer);
  currentPoi$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  pois$: Observable<any> = this._store
    .select(pois)
    .pipe(tap(p => (this.pois = (p && p.features) ?? null)));
  pois: any[];
  public sliderOptions: any;
  slideOptions = {
    on: {
      beforeInit,
      setTranslate,
      setTransition,
    },
  };
  resetEvt$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  imagePoiToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private _store: Store, private _deviceService: DeviceService) {
    this.sliderOptions = {
      initialSlide: 0,
      speed: 400,
      spaceBetween: 10,
      slidesOffsetAfter: 15,
      slidesOffsetBefore: 15,
      slidesPerView: this._deviceService.width / 235,
    };
  }

  goToTrack(id: number) {
    this.resetPoi();
    this._store.dispatch(setCurrentTrackId({currentTrackId: +id}));
  }

  ionViewWillLeave() {
    this.resetEvt$.next(this.resetEvt$.value + 1);
  }

  resetPoi(): void {
    this.currentPoi$.next(null);
    this.currentPoiID$.next(-1);
  }

  showPhoto(idx) {
    this.imagePoiToggle$.next(true);
    setTimeout(() => {
      this.slider.slideTo(idx);
    }, 300);
  }
  email(_): void {}
  phone(_): void {}
  openPoi(poiID: number) {
    this.currentPoiID$.next(poiID);
    const currentPoi = this.pois.filter(p => +p.properties.id === poiID)[0] ?? null;
    this.currentPoi$.next(currentPoi);
  }
  async url(url) {
    await Browser.open({url});
  }
}
