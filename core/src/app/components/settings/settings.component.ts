import {AlertController, ModalController} from '@ionic/angular';
import {Component, OnInit} from '@angular/core';
import {confLANGUAGES, confMAP} from 'src/app/store/conf/conf.selector';
import {AuthService} from 'src/app/services/auth.service';
import {ConfigService} from 'src/app/services/config.service';
import {CreditsPage} from 'src/app/pages/credits/credits.page';
import {DisclaimerPage} from 'src/app/pages/disclaimer/disclaimer.page';
import {ProjectPage} from 'src/app/pages/project/project.page';
import {LangService} from 'src/app/shared/wm-core/localization/lang.service';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {GeolocationService} from 'src/app/services/geolocation.service';

@Component({
  selector: 'webmapp-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [LangService],
})
export class SettingsComponent implements OnInit {
  distanceFilters = [5, 10, 20];
  isLoggedIn: boolean;
  langs$ = this._store.select(confLANGUAGES);
  confMap$: Observable<any> = this._store.select(confMAP);
  public version = '0.0.0';
  currentDistanceFilter = +localStorage.getItem('wm-distance-filter') || 10;

  constructor(
    private _alertController: AlertController,
    private _authService: AuthService,
    private _modalController: ModalController,
    private _configService: ConfigService,
    private _langSvc: LangService,
    private _store: Store<any>,
    private _geolocationSvc: GeolocationService,
  ) {}

  dismiss(): void {
    this._modalController.dismiss('webmapp-login-modal');
  }

  logout(): void {
    this._alertController
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
              this._authService.logout();
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

  ngOnInit() {
    this.version = this._configService.version;
    this.isLoggedIn = this._authService.isLoggedIn;
  }

  async openCmp(nameCmp: string) {
    const cmp =
      nameCmp === 'project' ? ProjectPage : nameCmp === 'disclaimer' ? DisclaimerPage : CreditsPage;
    const pmodal = await this._modalController.create({
      component: cmp,
      swipeToClose: true,
      mode: 'ios',
    });
    pmodal.present();
  }

  changeDistanceFilter(event) {
    this.currentDistanceFilter = event.detail.value;
    console.log('DISTANCE FILTER ', this.currentDistanceFilter);
    localStorage.setItem('wm-distance-filter', `${this.currentDistanceFilter}`);
    this._geolocationSvc.reset();
  }
}
