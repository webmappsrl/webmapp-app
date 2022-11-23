import {BehaviorSubject, Observable} from 'rxjs';
import {ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {IonSlides} from '@ionic/angular';
import {beforeInit, setTransition, setTranslate} from '../poi/utils';
import {confGeohubId, confMAP, confPOIS} from 'src/app/store/conf/conf.selector';
import {
  currentFilters,
  currentPoiID,
  mapCurrentLayer,
  padding,
} from 'src/app/store/map/map.selector';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {openDetails, setCurrentFilters, setCurrentTrackId} from 'src/app/store/map/map.actions';

import {AuthService} from 'src/app/services/auth.service';
import {Browser} from '@capacitor/browser';
import {DeviceService} from 'src/app/services/base/device.service';
import {Store} from '@ngrx/store';
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
        // this._store.dispatch(loadPois());
      }
    }),
  );
  confPOIS$: Observable<any> = this._store.select(confPOIS);
  currentFilters$: Observable<string[]> = this._store.select(currentFilters);
  currentLayer$ = this._store.select(mapCurrentLayer);
  currentPoi$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPosition$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  enableOverLay$: Observable<boolean> = this._store
    .select(confGeohubId)
    .pipe(map(gid => gid === 13));
  imagePoiToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean>;
  padding$: Observable<number[]> = this._store.select(padding);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  pois: any[];
  pois$: Observable<any> = this._store
    .select(pois)
    .pipe(tap(p => (this.pois = (p && p.features) ?? null)));
  resetEvt$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  setCurrentPosition$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  slideOptions = {
    on: {
      beforeInit,
      setTranslate,
      setTransition,
    },
  };
  public sliderOptions: any;

  constructor(
    private _store: Store,
    private _deviceService: DeviceService,
    private _authSvc: AuthService,
  ) {
    this.sliderOptions = {
      initialSlide: 0,
      speed: 400,
      spaceBetween: 10,
      slidesOffsetAfter: 15,
      slidesOffsetBefore: 15,
      slidesPerView: this._deviceService.width / 235,
    };
    this.isLoggedIn$ = this._authSvc.isLoggedIn$;
    this._store
      .select(currentPoiID)
      .pipe(withLatestFrom(this.pois$))
      .subscribe(([id, pois]) => {
        if (id != null && pois != null) this.openPoi(id);
      });
  }

  email(_): void {}

  goToTrack(id: number) {
    this.resetPoi();
    this._store.dispatch(setCurrentTrackId({currentTrackId: +id}));
  }

  ionViewWillLeave() {
    this.resetPoi();
    this.resetEvt$.next(this.resetEvt$.value + 1);
  }

  openPoi(poiID: number) {
    this._store.dispatch(openDetails({openDetails: true}));
    this.currentPoiID$.next(poiID);
    const currentPoi = this.pois.filter(p => +p.properties.id === poiID)[0] ?? null;
    this.currentPoi$.next(currentPoi);
  }

  setPoi(poi:any): void {
    console.log(poi.properties)
    this.currentPoi$.next(poi);
  }

  phone(_): void {}

  resetPoi(): void {
    this._store.dispatch(openDetails({openDetails: false}));
    this.currentPoi$.next(null);
    this.currentPoiID$.next(-1);
  }

  setCurrentFilters(filters: string[]): void {
    this._store.dispatch(setCurrentFilters({currentFilters: filters}));
  }

  setCurrentLocation(event): void {
    this.currentPosition$.next(event);
  }

  showPhoto(idx) {
    this.imagePoiToggle$.next(true);
    setTimeout(() => {
      this.slider.slideTo(idx);
    }, 300);
  }

  async url(url) {
    await Browser.open({url});
  }
}
