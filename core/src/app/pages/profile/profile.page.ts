import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';
import {Observable, Subject, from} from 'rxjs';
import {switchMap, take, takeUntil} from 'rxjs/operators';

import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {SettingsComponent} from 'src/app/components/settings/settings.component';
import {select, Store} from '@ngrx/store';
import {LangService} from 'wm-core/localization/lang.service';
import {confAUTHEnable} from 'wm-core/store/conf/conf.selector';
import { isLogged, user } from 'wm-core/store/auth/auth.selectors';
import { LoginComponent } from 'wm-core/login/login.component';
import { IUser } from 'wm-core/store/auth/auth.model';
import { deleteUser } from 'wm-core/store/auth/auth.actions';


@Component({
  selector: 'webmapp-page-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfilePage implements OnDestroy {
  private _destroyer: Subject<boolean> = new Subject<boolean>();

  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  avatarUrl: string;
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  user$: Observable<IUser> = this._store.pipe(select(user));
  loggedOutSliderOptions: any;

  constructor(
    private _modalController: ModalController,
    private _navController: NavController,
    private _store: Store<any>,
    private _alertCtrl: AlertController,
    private _translateService: LangService,
    private _router: Router,
  ) {
    this.loggedOutSliderOptions = {
      initialSlide: 0,
      speed: 400,
      spaceBetween: 10,
      slidesOffsetAfter: 0,
      slidesOffsetBefore: 0,
      slidesPerView: 1,
    };
  }

  ngOnDestroy(): void {
    this._destroyer.next(true);
  }

  deleteUserAlert(): void {
    from(
      this._alertCtrl.create({
        header: this._translateService.instant('Attenzione'),
        subHeader: this._translateService.instant('Azione irreversibile'),
        message: this._translateService.instant('Vuoi veramente eliminare il tuo account?'),
        buttons: [
          {
            text: this._translateService.instant('Annulla'),
            role: 'cancel',
            handler: () => {
              window.alert('cancel');
            },
          },
          {
            text: this._translateService.instant('elimina'),
            role: 'confirm',
            handler: () => {
              this._store.dispatch(deleteUser());
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

  login(): void {
    this._modalController
      .create({
        component: LoginComponent,
        swipeToClose: true,
        mode: 'ios',
        id: 'webmapp-login-modal',
      })
      .then(modal => {
        modal.present();
      });
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

  signup(): void {
    this._navController.navigateForward('registeruser');
  }

  tabClick(event: Event, tab: string): void {
    event.stopImmediatePropagation();
    this._router.navigate([tab]);
  }
}
