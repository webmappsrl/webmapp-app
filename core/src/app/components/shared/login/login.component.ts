import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonInput, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'webmapp-login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild('username') usernameField: IonInput;
  @ViewChild('password') passwordField: IonInput;

  public showPassword: boolean = false;
  public logging: boolean = false;

  constructor(
    private _alertController: AlertController,
    private _authService: AuthService,
    private _languagesService: LanguagesService,
    private _modalController: ModalController
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.setFocus();
    }, 1000);
  }

  setFocus() {
    this.usernameField.setFocus();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.logging = true;
    this._authService
      .login(this.usernameField.value + '', this.passwordField.value + '')
      .then(
        () => {
          this.logging = false;
          this.dismiss();
        },
        (loginError) => {
          console.log(loginError);
          this.logging = false;
          this._alertController
            .create({
              mode: 'ios',
              header: this._languagesService.translate('generic.warning'),
              message: this._languagesService.translate('generic.error'),
              buttons: [
                {
                  text: this._languagesService.translate('generic.ok'),
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
      );
  }

  forgotPassword(): void {}

  dismiss(): void {
    this._modalController.dismiss('webmapp-login-modal');
  }
}
