import {ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {Observable} from 'rxjs';
import {StatusService} from 'src/app/services/status.service';
import {select, Store} from '@ngrx/store';
import {IonTabs} from '@ionic/angular';
import {confAUTHEnable} from '@wm-core/store/conf/conf.selector';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {goToHome, resetMap} from '@wm-core/store/user-activity/user-activity.action';
import {online} from '@wm-core/store/network/network.selector';
import {INetworkRootState} from '@wm-core/store/network/netwotk.reducer';

@Component({
  selector: 'webmapp-page-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {
  @ViewChild('tabs', {static: false}) tabs: IonTabs;

  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  online$: Observable<boolean> = this._storeNetwork.select(online);

  constructor(
    private _statusService: StatusService,
    private _store: Store<any>,
    private _storeNetwork: Store<INetworkRootState>,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  isBarHidden(): boolean {
    return this._statusService.isSelectedMapTrack;
  }

  setCurrentTab(tab: string): void {
    const currentTab = this._urlHandlerSvc.getCurrentPath();

    if (currentTab === tab) {
      if (tab === 'home') {
        this._store.dispatch(goToHome());
      }
      if (tab === 'map') {
        this._store.dispatch(resetMap());
      }
      return;
    }
    if (tab === 'map') {
      this._urlHandlerSvc.changeURL(tab);
    }
    if (tab === 'home') {
      const {layer} = this._urlHandlerSvc.getCurrentQueryParams();
      const queryParams = {
        layer,
      };
      this._urlHandlerSvc.changeURL(tab, queryParams);
    }
  }
}
