import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'webmapp-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(
    private _alertController: AlertController,
    private _authService: AuthService,
    private _languagesService: LanguagesService,
    private _modalController: ModalController
  ) {}

  ngOnInit() {}

  logout(): void {
    this._alertController
      .create({
        mode: 'ios',
        header: this._languagesService.translate('generic.warning'),
        message: this._languagesService.translate(
          'modals.settings.alert.logout'
        ),
        buttons: [
          {
            text: this._languagesService.translate('generic.cancel'),
          },
          {
            text: this._languagesService.translate('generic.confirm'),
            handler: () => {
              this._authService.logout();
              this.dismiss();
            },
          },
        ],
      })
      .then(
        (alert) => {
          alert.present();
        },
        (alertError) => {
          console.warn(alertError);
        }
      );
  }

  dismiss(): void {
    this._modalController.dismiss('webmapp-login-modal');
  }
}
