import {KeyValue} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';

import {CreditsPage} from 'src/app/pages/credits/credits.page';
import {DisclaimerPage} from 'src/app/pages/disclaimer/disclaimer.page';
import {ProjectPage} from 'src/app/pages/project/project.page';
import {AuthService} from 'src/app/services/auth.service';
import {ConfigService} from 'src/app/services/config.service';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {LangService} from 'src/app/shared/wm-core/localization/lang.service';
import {confLANGUAGES, confMAP} from 'src/app/shared/wm-core/store/conf/conf.selector';

@Component({
  selector: 'wm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [LangService],
})
export class SettingsComponent implements OnInit {
  confMap$: Observable<any> = this._store.select(confMAP);
  currentDistanceFilter = +localStorage.getItem('wm-distance-filter') || 10;
  gpsAccuracy = {
    5: 'massima precisione ogni 5 metri viene rilevata la posizione, consumo consistente della batteria',
    10: 'media precisione ogni 10 metri viene rilevata la posizione, consumo medio della batteria',
    20: 'minima precisione ogni 20 metri viene rilevata la posizione, consumo minore della batteria',
  };
  isLoggedIn: boolean;
  langs$ = this._store.select(confLANGUAGES);
  public version = '0.0.0';

  constructor(
    private _alertCtrl: AlertController,
    private _authSvc: AuthService,
    private _modalCtrl: ModalController,
    private _configSvc: ConfigService,
    private _langSvc: LangService,
    private _store: Store<any>,
    private _geolocationSvc: GeolocationService,
  ) {}

  changeDistanceFilter(event): void {
    this.currentDistanceFilter = event.detail.value;
    localStorage.setItem('wm-distance-filter', `${this.currentDistanceFilter}`);
  }

  async dismiss(): Promise<void> {
    this._geolocationSvc.reset();
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
              this._authSvc.logout();
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

  ngOnInit(): void {
    this.version = this._configSvc.version;
    this.isLoggedIn = this._authSvc.isLoggedIn;
  }

  async openCmp(nameCmp: string) {
    const cmp =
      nameCmp === 'project' ? ProjectPage : nameCmp === 'disclaimer' ? DisclaimerPage : CreditsPage;
    const pmodal = await this._modalCtrl.create({
      component: cmp,
      swipeToClose: true,
      mode: 'ios',
    });
    pmodal.present();
  }

  orderOriginal(a: KeyValue<string, string>, b: KeyValue<string, string>): number {
    return 0;
  }
}
