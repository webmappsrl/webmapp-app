import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Platform} from '@ionic/angular';
import {App} from '@capacitor/app';
import {Observable, Subscription} from 'rxjs';
import {startWith, tap} from 'rxjs/operators';

import {loadConf} from '@wm-core/store/conf/conf.actions';
import {online} from '@wm-core/store/network/network.selector';

@Component({
  selector: 'wm-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private _backBtnSub$: Subscription = Subscription.EMPTY;

  online$: Observable<boolean> = this._store.select(online).pipe(
    startWith(false),
    tap(online => {
      if (online) {
        this._store.dispatch(loadConf());
      }
    }),
  );

  constructor(private _store: Store<any>, private _platform: Platform) {}

  ionViewDidEnter(): void {
    this._backBtnSub$ = this._platform.backButton.subscribeWithPriority(99999, () => {
      App.exitApp();
    });
  }

  ionViewWillLeave(): void {
    this._backBtnSub$.unsubscribe();
  }
}
