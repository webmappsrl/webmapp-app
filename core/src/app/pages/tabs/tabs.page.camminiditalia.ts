import {ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {Observable} from 'rxjs';
import {StatusService} from 'src/app/services/status.service';
import {select, Store} from '@ngrx/store';
import {IonTabs} from '@ionic/angular';
import {confAUTHEnable} from '@wm-core/store/conf/conf.selector';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {
  goToHome,
  resetMap,
  wmMapHitMapChangeFeatureById,
} from '@wm-core/store/user-activity/user-activity.action';
import {online} from '@wm-core/store/network/network.selector';
import {DiaryOutboxService} from '@wm-core/diaries/diary-outbox.service';
import {ActiveRouteService} from '@wm-core/diaries/active-route.service';
import {RouteCompletedNoticeService} from '@wm-core/passport/route-completed-notice/route-completed-notice.service';
import {INetworkRootState} from '@wm-core/store/network/netwotk.reducer';
import {enableRecorderPanel} from '@wm-core/store/user-activity/user-activity.selector';

// Variante camminiditalia della pagina dei tab (oc:8703), attivata con `fileReplacements`: copia
// di `tabs.page.ts` con il proprio template, che aggiunge la voce Passaporto. Una correzione al
// file condiviso va riportata a mano anche qui.
@Component({
  standalone: false,
  selector: 'webmapp-page-tabs',
  templateUrl: 'tabs.page.camminiditalia.html',
  styleUrls: ['tabs.page.scss', 'tabs.page.camminiditalia.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {
  @ViewChild('tabs', {static: false}) tabs: IonTabs;

  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  online$: Observable<boolean> = this._storeNetwork.select(online);
  enableRecorderPanel$: Observable<boolean> = this._store.select(enableRecorderPanel);

  constructor(
    private _statusService: StatusService,
    private _store: Store<any>,
    private _storeNetwork: Store<INetworkRootState>,
    private _urlHandlerSvc: UrlHandlerService,
    private _diaryOutbox: DiaryOutboxService,
    private _activeRoute: ActiveRouteService,
    private _routeCompletedNotice: RouteCompletedNoticeService,
  ) {
    // coda dei diari scritti senza rete (oc:8169): parte solo in camminiditalia, vive con i tab
    void this._diaryOutbox.start();
    // pulsante del diario solo vicino al cammino (oc:8169): ascolto della posizione, solo camminiditalia
    void this._activeRoute.start();
    // avviso di cammino completato al posto dell'email (oc:8169, ciclo 2), solo camminiditalia
    this._routeCompletedNotice.start();
  }

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
      const {layer, search} = this._urlHandlerSvc.getCurrentQueryParams();
      const queryParams = {
        layer,
        search,
      };
      this._store.dispatch(wmMapHitMapChangeFeatureById({id: null}));
      this._urlHandlerSvc.changeURL(tab, queryParams);
    }
  }
}
