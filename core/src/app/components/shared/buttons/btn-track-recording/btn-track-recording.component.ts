import {ModalController, NavController} from '@ionic/angular';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import {ESuccessType} from 'src/app/types/esuccess.enum';
import {ModalSuccessComponent} from 'src/app/components/modal-success/modal-success.component';
import {NavigationExtras} from '@angular/router';
import {LoginComponent} from '@wm-core/login/login.component';

@Component({
  selector: 'wm-btn-track-recording',
  templateUrl: './btn-track-recording.component.html',
  styleUrls: ['./btn-track-recording.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BtnTrackRecordingComponent {
  @Input() currentTrack: any;
  @Input() isLogged = false;
  @Output('start-recording') startRecording: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private _navCtrl: NavController,
    private _modalController: ModalController
  ) {}

  openModalLogin(): void {
    this._modalController
      .create({
        component: LoginComponent,
        swipeToClose: true,
        mode: 'ios',
        id: 'webmapp-login-modal',
      })
      .then(modal => {
        modal.present();
        modal.onWillDismiss().then(res => {
          this.isLogged = res.data as boolean;
        });
      });
  }

  track(): void {
    if (this.isLogged) {
      let navigationExtras: NavigationExtras = {state: {currentTrack: this.currentTrack}};
      this._navCtrl.navigateForward('register', navigationExtras);
    } else {
      this.openModalLogin();
    }
  }

  waypoint(): void {
    if (this.isLogged) {
      let navigationExtras: NavigationExtras = {state: {currentTrack: this.currentTrack}};
      this._navCtrl.navigateForward('waypoint', navigationExtras);
    } else {
      this.openModalLogin();
    }
  }
}
