import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginComponent } from 'src/app/components/shared/login/login.component';

@Component({
  selector: 'webmapp-page-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public loggedIn: boolean;
  public loggedOutSliderOptions: any;

  constructor(private _modalController: ModalController) {
    this.loggedOutSliderOptions = {
      initialSlide: 0,
      speed: 400,
      spaceBetween: 10,
      slidesOffsetAfter: 0,
      slidesOffsetBefore: 0,
      slidesPerView: 1,
    };
  }

  ngOnInit() {}

  login(): void {
    this._modalController
      .create({
        component: LoginComponent,
        swipeToClose: true,
        mode: 'ios',
        id: 'webmapp-login-modal',
      })
      .then((modal) => {
        modal.present();
      });
  }

  signup(): void {}
}
