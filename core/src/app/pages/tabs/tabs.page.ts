import {ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {Observable} from 'rxjs';
import {StatusService} from 'src/app/services/status.service';
import {select, Store} from '@ngrx/store';
import {online} from 'src/app/store/network/network.selector';
import {IonTabs} from '@ionic/angular';
import {confAUTHEnable} from '@wm-core/store/conf/conf.selector';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

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
  currentTab = 'home';
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  online$: Observable<boolean> = this._storeNetwork.select(online);

  constructor(
    private _statusService: StatusService,
    private _store: Store<any>,
    private _storeNetwork: Store<INetworkRootState>,
    private _urlHandlerService: UrlHandlerService,
  ) {}

  isBarHidden(): boolean {
    return this._statusService.isSelectedMapTrack;
  }

  setCurrentTab(tab: string): void {
    this.currentTab = tab;
    if (tab === 'home' || tab === 'map') {
      this._urlHandlerService.changeURL(tab);
    }
  }
}
