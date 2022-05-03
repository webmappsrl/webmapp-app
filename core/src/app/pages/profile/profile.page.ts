import { Component, OnDestroy, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {ModalController, NavController} from '@ionic/angular';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SettingsComponent} from 'src/app/components/settings/settings.component';
import {LoginComponent} from 'src/app/components/shared/login/login.component';
import {AuthService} from 'src/app/services/auth.service';
import {LanguagesService} from 'src/app/services/languages.service';

@Component({
  selector: 'webmapp-page-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  public loggedOutSliderOptions: any;
  public isLoggedIn: boolean;
  public name: string;
  public email: string;
  public avatarUrl: string;
  public langForm: FormGroup;
  langs$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['it']);
  private _destroyer: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _authService: AuthService,
    private _modalController: ModalController,
    private _router: Router,
    private _navController: NavController,
    private _langSvc: LanguagesService,
    private _fb: FormBuilder,
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
}
