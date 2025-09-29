import {Component, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {Observable, Subject, Subscription} from 'rxjs';
import {SettingsComponent} from 'src/app/components/settings/settings.component';
import {select, Store} from '@ngrx/store';
import {confAUTHEnable, confMAPHitMapUrl, confAPP} from '@wm-core/store/conf/conf.selector';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {Router} from '@angular/router';
import {filter, skip, take} from 'rxjs/operators';
import {AlertController} from '@ionic/angular';
import {from} from 'rxjs';
import {deleteUser} from '@wm-core/store/auth/auth.actions';
import {LangService} from '@wm-core/localization/lang.service';
import {WmFeature} from '@wm-types/feature';
import {MultiPolygon} from 'geojson';
import {getHitmapFeatures} from '@map-core/utils';
import {WmHomeHitMapComponent} from '@wm-core/home/home-hitmap/home-hitmap.component';
import {DataConsentService} from '@wm-core/services/data-consent.service';
import {IAPP} from '@wm-core/types/config';

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
  confAPP$: Observable<IAPP> = this._store.select(confAPP);
  hitmapFeatures$: Observable<WmFeature<MultiPolygon>[]> = from(getHitmapFeatures());
  @ViewChild(WmHomeHitMapComponent) hitmapComp: WmHomeHitMapComponent;

  constructor(
    private _modalController: ModalController,
    private _store: Store<any>,
    private _router: Router,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
    private _dataConsentSvc: DataConsentService,
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

  deleteUserAlert(): void {
    from(
      this._alertCtrl.create({
        header: this._langSvc.instant('Attenzione'),
        subHeader: this._langSvc.instant('Azione irreversibile'),
        message: this._langSvc.instant(
          'Vuoi veramente eliminare il tuo account? È obbligatorio scrivere "delete account" per procedere.',
        ),
        inputs: [
          {
            name: 'confirmationInput',
            type: 'text',
            placeholder: this._langSvc.instant('Digita "delete account"'),
          },
        ],
        buttons: [
          {
            text: this._langSvc.instant('Annulla'),
            role: 'cancel',
          },
          {
            text: this._langSvc.instant('Conferma'),
            role: 'confirm',
            handler: async alertData => {
              if (alertData.confirmationInput === 'delete account') {
                this._store.dispatch(deleteUser());
              } else {
                const errorAlert = await this._alertCtrl.create({
                  header: this._langSvc.instant('Attenzione'),
                  message: this._langSvc.instant(
                    'La conferma non corrisponde. Digita "delete account" per procedere.',
                  ),
                  buttons: [this._langSvc.instant('generic.ok')],
                });
                await errorAlert.present();
              }
            },
          },
        ],
      }),
    )
      .pipe(take(1))
      .subscribe(l => {
        l.present();
      });
  }

  /**
   * Open data consent alert to allow user to modify consent
   */
  openDataConsentAlert(): void {
    this.isLogged$.pipe(take(1)).subscribe(isLogged => {
      this._dataConsentSvc.showDataConsentAlert(isLogged, this.confAPP$).subscribe(result => {
        console.log('Data consent result:', result);
        // Optionally show a success message or update UI
      });
    });
  }
}
