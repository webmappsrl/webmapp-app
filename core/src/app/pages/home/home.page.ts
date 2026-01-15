import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Platform} from '@ionic/angular';
import {App} from '@capacitor/app';
import {Observable, Subscription, merge} from 'rxjs';
import {filter, startWith, tap} from 'rxjs/operators';

import {loadConf} from '@wm-core/store/conf/conf.actions';
import {online} from '@wm-core/store/network/network.selector';
import {currentEcLayer, ugcOpened} from '@wm-core/store/user-activity/user-activity.selector';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

@Component({
  standalone: false,
  selector: 'wm-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private _backBtnSub$: Subscription = Subscription.EMPTY;
  private _currentLayer$ = this._store.select(currentEcLayer);
  private _ugcOpened$ = this._store.select(ugcOpened);

  online$: Observable<boolean> = this._store.select(online).pipe(
    startWith(false),
    tap(online => {
      if (online) {
        this._store.dispatch(loadConf());
      }
    }),
  );

  constructor(
    private _store: Store<any>,
    private _platform: Platform,
    private _urlHandlerSvc: UrlHandlerService,
  ) {
    // TODO: creare uno store della app e gestire questo caso come effect del repo app
    merge(
      this._currentLayer$.pipe(filter(l => l != null)),
      this._ugcOpened$.pipe(filter(ugcOpened => ugcOpened != null && ugcOpened)),
    ).subscribe(_ => {
      this._urlHandlerSvc.changeURL('map');
    });
  }

  ionViewDidEnter(): void {
    this._backBtnSub$ = this._platform.backButton.subscribeWithPriority(99999, () => {
      App.exitApp();
    });
  }

  ionViewWillLeave(): void {
    this._backBtnSub$.unsubscribe();
  }
}
