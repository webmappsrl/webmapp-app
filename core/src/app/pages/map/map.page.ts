import {ChangeDetectionStrategy, Component, EventEmitter, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {confMAP} from 'src/app/store/conf/conf.selector';
import {setCurrentTrackId} from 'src/app/store/map/map.actions';
import {mapCurrentLayer} from 'src/app/store/map/map.selector';
@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapPage {
  confMap$: Observable<any> = this._store.select(confMAP);
  currentLayer$ = this._store.select(mapCurrentLayer);
  resetEvt$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  constructor(private _store: Store) {}

  goToTrack(id: number) {
    this._store.dispatch(setCurrentTrackId({currentTrackId: +id}));
  }

  ionViewWillLeave() {
    this.resetEvt$.next(this.resetEvt$.value + 1);
  }
}
