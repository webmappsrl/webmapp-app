import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';
import {Observable, Subject, from} from 'rxjs';
import {switchMap, take, takeUntil} from 'rxjs/operators';

import {AlertController} from '@ionic/angular';
import {AuthService} from 'src/app/services/auth.service';
import {LoginComponent} from 'src/app/components/shared/login/login.component';
import {Router} from '@angular/router';
import {SettingsComponent} from 'src/app/components/settings/settings.component';
import {Store} from '@ngrx/store';
import {LangService} from 'src/app/shared/wm-core/localization/lang.service';
import {confAUTHEnable} from 'src/app/shared/wm-core/store/conf/conf.selector';

@Component({
  selector: 'webmapp-page-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  providers: [LangService],
  encapsulation: ViewEncapsulation.None,
})
export class ProfilePage implements OnInit, OnDestroy {
  private _destroyer: Subject<boolean> = new Subject<boolean>();

  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  avatarUrl: string;
  email: string;
  isLoggedIn$: Observable<boolean>;
  loggedOutSliderOptions: any;
  name: string;

  constructor(
    private _authService: AuthService,
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
              this._authService
                .delete$()
                .pipe(
                  switchMap(res => {
                    return from(
                      this._alertCtrl.create({
                        message: this._translateService.instant(res.error || res.success),
                        buttons: [
                          {
                            text: this._translateService.instant('ok'),
                            role: 'ok',
                            handler: () => {
                              if (res.success != null) {
                                this._authService.logout();
                              }
                            },
                          },
                        ],
                      }),
                    );
                  }),
                )
                .subscribe(val => val.present());
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

  ngOnDestroy(): void {
    this._destroyer.next(true);
  }

  ngOnInit() {
    this._authService.onStateChange.pipe(takeUntil(this._destroyer)).subscribe((user: IUser) => {
      this.isLoggedIn$ = this._authService.isLoggedIn$;
      this.name = this._authService.name;
      this.email = this._authService.email;
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
