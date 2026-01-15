import {KeyValue} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {KeepAwake} from '@capacitor-community/keep-awake';
import {WmInnerHtmlComponent} from '@wm-core/inner-html/inner-html.component';
import {LangService} from '@wm-core/localization/lang.service';
import {
  confCREDITS,
  confDISCLAIMER,
  confLANGUAGES,
  confMAP,
  confPAGES,
  confPROJECT,
} from '@wm-core/store/conf/conf.selector';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {loadSignOuts} from '@wm-core/store/auth/auth.actions';
import {APP_VERSION} from '@wm-core/store/conf/conf.token';

@Component({
  standalone: false,
  selector: 'wm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  confCredits$: Observable<any> = this._store.select(confCREDITS);
  confDisclaimer$: Observable<any> = this._store.select(confDISCLAIMER);
  confMap$: Observable<any> = this._store.select(confMAP);
  confPages$: Observable<any> = this._store.select(confPAGES);
  confProject$: Observable<any> = this._store.select(confPROJECT);
  currentDistanceFilter = +(localStorage.getItem('wm-distance-filter') || 10);
  gpsAccuracy = {
    5: 'massima precisione ogni 5 metri viene rilevata la posizione, consumo consistente della batteria',
    10: 'media precisione ogni 10 metri viene rilevata la posizione, consumo medio della batteria',
    20: 'minima precisione ogni 20 metri viene rilevata la posizione, consumo minore della batteria',
    100: 'precisione su mezzi di locomozione, consumo minimo della batteria',
  };
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  keepAwake =
    (localStorage.getItem('wm-keep-awake') != 'false' &&
      localStorage.getItem('wm-keep-awake') != null) ||
    false;
  langs$ = this._store.select(confLANGUAGES);

  constructor(
    private _alertCtrl: AlertController,
    private _modalCtrl: ModalController,
    private _langSvc: LangService,
    private _store: Store<any>,
    private _geolocationSvc: GeolocationService,
    @Inject(APP_VERSION) public APP_VERSION: string,
  ) {}

  changeDistanceFilter(event): void {
    this.currentDistanceFilter = event.detail.value;
    localStorage.setItem('wm-distance-filter', `${this.currentDistanceFilter}`);
  }

  changeKeepAwake(event): void {
    this.keepAwake = event.detail.checked;
    if (this.keepAwake) {
      KeepAwake.keepAwake();
    } else {
      KeepAwake.allowSleep();
    }
    localStorage.setItem('wm-keep-awake', `${this.keepAwake}`);
  }

  async clear() {
    this._alertCtrl
      .create({
        mode: 'ios',
        header: this._langSvc.instant('generic.warning'),
        message: this._langSvc.instant('sei sicuro di voler cancellare cache e dati  salvati?'),
        buttons: [
          {
            text: this._langSvc.instant('generic.cancel'),
          },
          {
            text: this._langSvc.instant('generic.confirm'),
            handler: async () => {
              await this.clearWebViewData();
            },
          },
        ],
      })
      .then(
        alert => {
          alert.present();
        },
        alertError => {
          console.warn(alertError);
        },
      );
  }

  async clearWebViewData(): Promise<void> {
    try {
      // Cancella Local Storage
      localStorage.clear();
      console.log('Local storage cleared');

      // Cancella Session Storage
      sessionStorage.clear();
      console.log('Session storage cleared');

      // Cancella IndexedDB
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
          console.log(`IndexedDB ${db.name} deleted`);
        }
      }

      // Cancella Cache Storage
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
          console.log(`Cache ${key} deleted`);
        }
      }

      // Cancella i Cookie
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        console.log(`Cookie ${name} deleted`);
      });

      console.log('WebView data cleared');
    } catch (error) {
      console.error('Error clearing WebView data', error);
    }
  }

  async dismiss(): Promise<void> {
    this._geolocationSvc.stopAll();
    this._modalCtrl.dismiss('webmapp-login-modal');
  }

  logout(): void {
    this._alertCtrl
      .create({
        mode: 'ios',
        header: this._langSvc.instant('generic.warning'),
        message: this._langSvc.instant('modals.settings.alert.logout'),
        buttons: [
          {
            text: this._langSvc.instant('generic.cancel'),
          },
          {
            text: this._langSvc.instant('generic.confirm'),
            handler: () => {
              this._store.dispatch(loadSignOuts());
              this.dismiss();
            },
          },
        ],
      })
      .then(
        alert => {
          alert.present();
        },
        alertError => {
          console.warn(alertError);
        },
      );
  }

  openAppSettings(): void {
    this._geolocationSvc.openAppSettings();
  }

  openCmp(nameCmp: string) {
    this.confPages$
      .pipe(
        take(1),
        switchMap(pages => {
          const conf =
            nameCmp === 'project'
              ? pages.PROJECT
              : nameCmp === 'disclaimer'
              ? pages.DISCLAIMER
              : nameCmp === 'credits'
              ? pages.CREDITS
              : pages.PRIVACY;
          return this._modalCtrl.create({
            component: WmInnerHtmlComponent,
            componentProps: {
              html: conf.html,
            },
            canDismiss: true,
            mode: 'ios',
          });
        }),
      )
      .subscribe(modal => {
        modal.present();
      });
  }

  orderOriginal(a: KeyValue<string, string>, b: KeyValue<string, string>): number {
    return 0;
  }
}
