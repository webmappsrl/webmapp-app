import {Component, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {Observable, Subject, Subscription} from 'rxjs';
import {SettingsComponent} from 'src/app/components/settings/settings.component';
import {select, Store} from '@ngrx/store';
import {confAUTHEnable, confMAPHitMapUrl} from '@wm-core/store/conf/conf.selector';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {Router} from '@angular/router';
import {filter, skip} from 'rxjs/operators';
import {from} from 'rxjs';
import {WmFeature} from '@wm-types/feature';
import {MultiPolygon} from 'geojson';
import {getHitmapFeatures} from '@map-core/utils';
import {WmHomeHitMapComponent} from '@wm-core/home/home-hitmap/home-hitmap.component';

@Component({
  selector: 'webmapp-page-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfilePage implements OnDestroy {
  private _destroyer: Subject<boolean> = new Subject<boolean>();
  private _isLoggedSub: Subscription = Subscription.EMPTY;

  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  confMAPHitMapUrl$: Observable<string | null> = this._store.select(confMAPHitMapUrl);
  hitmapFeatures$: Observable<WmFeature<MultiPolygon>[]> = from(getHitmapFeatures());
  @ViewChild(WmHomeHitMapComponent) hitmapComp: WmHomeHitMapComponent;

  constructor(
    private _modalController: ModalController,
    private _store: Store<any>,
    private _router: Router,
  ) {
    this._isLoggedSub = this.isLogged$
      .pipe(
        skip(1),
        filter(f => !f),
      )
      .subscribe(() => this._router.navigate(['/profile/profile-data']));
  }

  ngOnDestroy(): void {
    this._isLoggedSub.unsubscribe();
    this._destroyer.next(true);
  }

  openSettings(): void {
    this._modalController
      .create({
        component: SettingsComponent,
        swipeToClose: true,
        mode: 'ios',
        id: 'webmapp-login-modal',
      })
      .then(modal => {
        modal.present();
      });
  }

  tabClick(event: Event, tab: string): void {
    event.stopImmediatePropagation();
    this._router.navigate([tab]);
  }

  ionViewWillEnter(): void {
    setTimeout(() => {
      this.hitmapComp?.refresh();
    }, 50);
  }
}
