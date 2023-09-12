import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AlertController, IonInput, ModalController} from '@ionic/angular';
import {AuthService} from 'src/app/services/auth.service';
import {LangService} from 'src/app/shared/wm-core/localization/lang.service';

@Component({
  selector: 'webmapp-login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LangService],
})
export class LoginComponent implements OnInit {
  get errorControl() {
    return this.loginForm.controls;
  }

  @ViewChild('email') emailField: IonInput;
  @ViewChild('password') passwordField: IonInput;

  public isSubmitted: boolean = false;
  public logging: boolean = false;
  public loginForm: UntypedFormGroup;
  public showPassword: boolean = false;

  constructor(
    private _alertController: AlertController,
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
    private _languagesService: LangService,
    private _modalController: ModalController,
  ) {
    this.loginForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  dismiss(): void {
    this._modalController.dismiss(this.logging);
  }

  forgotPassword(): void {}

  login(): void {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      this.logging = true;
      this._authService.login(this.emailField.value + '', this.passwordField.value + '').then(
        res => {
          this.logging = res;
          this.dismiss();
        },
        (loginError: HttpErrorResponse) => {
          this.logging = false;
          this.showErrorAlert(loginError);
        },
      );
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.setFocus();
    }, 1000);
  }

  openUrl(url: string): void {
    window.open(url, '_blank');
  }

  setFocus() {
    this.emailField.setFocus();
  }

  showErrorAlert(error: HttpErrorResponse): void {
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
        header: this._languagesService.instant('generic.warning'),
        message: this._languagesService.instant(errorMessage),
        buttons: [
          {
            text: this._languagesService.instant('generic.ok'),
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
