import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NavController, PopoverController } from '@ionic/angular';
import { GenericPopoverComponent } from 'src/app/components/shared/generic-popover/generic-popover.component';
import { CoinService } from 'src/app/services/coin.service';

@Component({
  selector: 'app-registeruser',
  templateUrl: './registeruser.page.html',
  styleUrls: ['./registeruser.page.scss'],
})
export class RegisteruserPage implements OnInit {

  public registerForm: FormGroup;
  public isSubmitted = false;

  private cfregex = '/^(?:[A-Z][AEIOU][AEIOUX]|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i'

  constructor(
    private coinService: CoinService,
    private _navController: NavController,
    private _formBuilder: FormBuilder,
    public popoverController: PopoverController
  ) {
    this.registerForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      cf: ['', [Validators.pattern(this.cfregex),]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.checkPasswords });
  }

  ngOnInit() {
  }

  get errorControl() {
    return this.registerForm.controls;
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value
    return pass === confirmPass ? null : { notSame: true }
  }

  register() {
    this.isSubmitted = true;
    
    if (this.registerForm.valid) {

      //TODO register user

      this.coinService.openGiftModal();
      this._navController.navigateForward('home');
    }
  }

  back() {
    this._navController.back();
  }

  async showCfInfo(ev){
    const popover = await this.popoverController.create({
      component: GenericPopoverComponent,
      event: ev,
      translucent: true,
      componentProps:{
        title:'pages.registeruser.cfpopovertitle',
        message:'pages.registeruser.cfpopovermessage',
      }
    });
    return popover.present();

  }
}
