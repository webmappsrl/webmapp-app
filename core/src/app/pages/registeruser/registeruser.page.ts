import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { LoadingController, NavController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { GenericPopoverComponent } from 'src/app/components/shared/generic-popover/generic-popover.component';
import { AuthService } from 'src/app/services/auth.service';
import { CoinService } from 'src/app/services/coin.service';

@Component({
  selector: 'app-registeruser',
  templateUrl: './registeruser.page.html',
  styleUrls: ['./registeruser.page.scss'],
})
export class RegisteruserPage implements OnInit {

  public registerForm: FormGroup;
  public isSubmitted = false;
  public showError = false;
  public loadingString = '';

  private cfregex = '/^(?:[A-Z][AEIOU][AEIOUX]|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i'

  constructor(
    private coinService: CoinService,
    private _navController: NavController,
    private _formBuilder: FormBuilder,
    private _authservice: AuthService,
    public popoverController: PopoverController,
    public loadingController: LoadingController,
    private translate: TranslateService
  ) {
    this.registerForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cf: ['', [Validators.pattern(this.cfregex),]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.checkPasswords });
  }

  ngOnInit() {
    this.translate.get('pages.registeruser.loading').subscribe(t => this.loadingString = t);
  }

  get errorControl() {
    return this.registerForm.controls;
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value
    return pass === confirmPass ? null : { notSame: true }
  }

  async register() {
    this.isSubmitted = true;
    this.showError = false;

    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({
        message: this.loadingString
      });
      await loading.present();

      const registered = await this._authservice.register(
        this.registerForm.get('name').value,
        this.registerForm.get('email').value,
        this.registerForm.get('password').value,
        this.registerForm.get('cf').value,
      )

      loading.dismiss();

      console.log("------- ~ RegisteruserPage ~ register ~ registered", registered);
      if (registered) {
        this.coinService.openGiftModal();
        this._navController.navigateForward('home');
      } else {
        this.showError = true;
      }
    }
  }

  back() {
    this._navController.back();
  }

  async showCfInfo(ev) {
    const popover = await this.popoverController.create({
      component: GenericPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        title: 'pages.registeruser.cfpopovertitle',
        message: 'pages.registeruser.cfpopovermessage',
      }
    });
    return popover.present();

  }
}
