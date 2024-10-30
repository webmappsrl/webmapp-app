import {Component, OnDestroy, ViewEncapsulation} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {Observable, Subject, Subscription} from 'rxjs';
import {SettingsComponent} from 'src/app/components/settings/settings.component';
import {select, Store} from '@ngrx/store';
import {confAUTHEnable} from 'wm-core/store/conf/conf.selector';
import {isLogged} from 'wm-core/store/auth/auth.selectors';
import {Router} from '@angular/router';
import {filter, skip} from 'rxjs/operators';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {from} from 'rxjs';
import {take} from 'rxjs/operators';
import {deleteUser} from 'wm-core/store/auth/auth.actions';
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

  constructor(
    private _modalController: ModalController,
    private _store: Store<any>,
    private _router: Router,
    private _alertCtrl: AlertController,
    private _tranlateSvc: TranslateService
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

  deleteUserAlert(): void {
    from(
      this._alertCtrl.create({
        header: this._tranlateSvc.instant('Attenzione'),
        subHeader: this._tranlateSvc.instant('Azione irreversibile'),
        message: this._tranlateSvc.instant('Vuoi veramente eliminare il tuo account? È obbligatorio scrivere "elimina account" per procedere.'),
        inputs: [
          {
            name: 'confirmationInput',
            type: 'text',
            placeholder: this._tranlateSvc.instant('Digita "elimina account"')
          }
        ],
        buttons: [
          {
            text: this._tranlateSvc.instant('Annulla'),
            role: 'cancel',
          },
          {
            text: this._tranlateSvc.instant('Conferma'),
            role: 'confirm',
            handler: async (alertData) => {
              if (alertData.confirmationInput === 'elimina account') {
                this._store.dispatch(deleteUser());
              } else {
                  const errorAlert = await this._alertCtrl.create({
                  header: this._tranlateSvc.instant('Attenzione'),
                  message: this._tranlateSvc.instant('La conferma non corrisponde. Digita "elimina account" per procedere.'),
                  buttons: [this._tranlateSvc.instant('generic.ok')]
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
}
