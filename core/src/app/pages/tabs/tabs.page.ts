import {setCurrentLayer, setCurrentTrackId} from 'src/app/store/map/map.actions';

import {AuthService} from 'src/app/services/auth.service';
import {Component} from '@angular/core';
import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IMapRootState} from 'src/app/store/map/map';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {Observable} from 'rxjs';
import {StatusService} from 'src/app/services/status.service';
import {Store} from '@ngrx/store';
import {confAUTHEnable} from 'src/app/store/conf/conf.selector';
import {online} from 'src/app/store/network/network.selector';

@Component({
  selector: 'webmapp-page-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  authEnable$: Observable<boolean> = this._storeConf.select(confAUTHEnable);
  isLoggedIn$: Observable<boolean>;
  online$: Observable<boolean> = this._storeNetwork.select(online);

  constructor(
    private _statusService: StatusService,
    private _storeMap: Store<IMapRootState>,
    private _storeConf: Store<IConfRootState>,
    private _storeNetwork: Store<INetworkRootState>,
    private _authSvc: AuthService,
  ) {
    this.isLoggedIn$ = this._authSvc.isLoggedIn$;
  }

  isBarHidden() {
    return this._statusService.isSelectedMapTrack;
  }

  reset() {
    // this._storeMap.dispatch(setCurrentLayer({currentLayer: null}));
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: null}));
  }
}
