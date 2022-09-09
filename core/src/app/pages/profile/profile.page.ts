import {BehaviorSubject, Observable, Subject, from} from 'rxjs';
import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ModalController, NavController} from '@ionic/angular';
import {switchMap, take, takeUntil} from 'rxjs/operators';

import {AlertController} from '@ionic/angular';
import {AuthService} from 'src/app/services/auth.service';
import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {LanguagesService} from 'src/app/services/languages.service';
import {LoginComponent} from 'src/app/components/shared/login/login.component';
import {Router} from '@angular/router';
import {SettingsComponent} from 'src/app/components/settings/settings.component';
import {Store} from '@ngrx/store';
import {WmTransPipe} from 'src/app/pipes/wmtrans.pipe';
import {confAUTHEnable} from 'src/app/store/conf/conf.selector';

@Component({
  selector: 'webmapp-page-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfilePage implements OnInit, OnDestroy {
  loggedOutSliderOptions: any;
  isLoggedIn: boolean;
  name: string;
  email: string;
  avatarUrl: string;
  langForm: FormGroup;
  langs$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['it']);
  authEnable$: Observable<boolean> = this._storeConf.select(confAUTHEnable);

  private _destroyer: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _authService: AuthService,
    private _modalController: ModalController,
    private _router: Router,
    private _navController: NavController,
    private _langSvc: LanguagesService,
    private _fb: FormBuilder,
    private _storeConf: Store<IConfRootState>,
    private _alertCtrl: AlertController,
    private _wmTrans: WmTransPipe,
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

  private _initLang(): void {
    this.langs$.next(this._langSvc.langs());
    this.langForm = this._fb.group({
      lang: [this._langSvc.currentLang],
    });
    this.langForm.valueChanges.subscribe(lang => this._langSvc.changeLang(lang.lang));
  }

  ngOnInit() {
    this._authService.onStateChange.pipe(takeUntil(this._destroyer)).subscribe((user: IUser) => {
      this.isLoggedIn = this._authService.isLoggedIn;
      this.name = this._authService.name;
      this.email = this._authService.email;
    });
    this._initLang();
  }

  tabClick(event: Event, tab: string): void {
    event.stopImmediatePropagation();
    this._router.navigate(['/profile/' + tab]);
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
    if (this.isLoggedIn) {
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
  }

  signup(): void {
    this._navController.navigateForward('registeruser');
  }

  ngOnDestroy(): void {
    this._destroyer.next(true);
  }
  deleteUserAlert(): void {
    from(
      this._alertCtrl.create({
        header: this._wmTrans.transform('Attenzione'),
        subHeader: this._wmTrans.transform('Azione irreversibile'),
        message: this._wmTrans.transform('Vuoi veramente eliminare il tuo account?'),
        buttons: [
          {
            text: this._wmTrans.transform('Annulla'),
            role: 'cancel',
            handler: () => {
              window.alert('cancel');
            },
          },
          {
            text: this._wmTrans.transform('elimina'),
            role: 'confirm',
            handler: () => {
              this._authService
                .delete$()
                .pipe(
                  switchMap(res => {
                    return from(
                      this._alertCtrl.create({
                        message: this._wmTrans.transform(res.error || res.success),
                        buttons: [
                          {
                            text: this._wmTrans.transform('ok'),
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
}
