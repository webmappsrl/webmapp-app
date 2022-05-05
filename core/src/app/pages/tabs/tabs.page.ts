import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {StatusService} from 'src/app/services/status.service';
import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {confAUTHEnable} from 'src/app/store/conf/conf.selector';
import {IMapRootState} from 'src/app/store/map/map';
import {setCurrentLayer, setCurrentTrackId} from 'src/app/store/map/map.actions';

@Component({
  selector: 'webmapp-page-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  authEnable$: Observable<boolean> = this._storeConf.select(confAUTHEnable);
  constructor(
    private _statusService: StatusService,
    private _storeMap: Store<IMapRootState>,
    private _storeConf: Store<IConfRootState>,
  ) {}

  isBarHidden() {
    return this._statusService.isSelectedMapTrack;
  }

  reset() {
    this._storeMap.dispatch(setCurrentLayer({currentLayer: null}));
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: null}));
  }
}
