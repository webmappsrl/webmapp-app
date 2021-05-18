import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonInput, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'webmapp-login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild('email') emailField: IonInput;
  @ViewChild('password') passwordField: IonInput;

  public showPassword: boolean = false;
  public logging: boolean = false;
  public isSubmitted: boolean = false;
  public loginForm: FormGroup;

  constructor(
    private _alertController: AlertController,
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _languagesService: LanguagesService,
    private _modalController: ModalController
  ) {
    this.loginForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  ngOnInit() {
    setTimeout(() => {
      this.setFocus();
    }, 1000);
  }

  setFocus() {
    this.emailField.setFocus();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      this.logging = true;
      this._authService
        .login(this.emailField.value + '', this.passwordField.value + '')
        .then(
          () => {
            this.logging = false;
            this.dismiss();
          },
          (loginError: HttpErrorResponse) => {
            this.logging = false;
            this.showErrorAlert(loginError);
          }
        );
    }
  }

  showErrorAlert(error: HttpErrorResponse): void {
    console.log(error);
    let errorMessage: string = 'modals.login.errors.generic';
    switch (error.status + '') {
      case '401':
        errorMessage = 'modals.login.errors.401';
        break;
      default:
        break;
    }
    this._alertController
      .create({
        mode: 'ios',
        header: this._languagesService.translate('generic.warning'),
        message: this._languagesService.translate(errorMessage),
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

  forgotPassword(): void {}

  dismiss(): void {
    this._modalController.dismiss('webmapp-login-modal');
  }
}
