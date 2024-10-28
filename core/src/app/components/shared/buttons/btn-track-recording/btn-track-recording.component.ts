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
import {ModalphotosaveComponent} from 'src/app/components/modalphotos/modalphotosave/modalphotosave.component';
import {NavigationExtras} from '@angular/router';
import {PhotoService} from 'wm-core/services/photo.service';
import {LoginComponent} from 'wm-core/login/login.component';
import {UgcService} from 'wm-core/services/ugc.service';

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
    private _modalController: ModalController,
    private _photoService: PhotoService,
    private _ugcSvc: UgcService,
  ) {}

  openModalLogin() {
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

  async openModalSuccess(photos) {
    const modaSuccess = await this._modalController.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: ESuccessType.PHOTOS,
        photos,
      },
    });
    await modaSuccess.present();
    await modaSuccess.onDidDismiss();
  }

  async photo() {
    if (this.isLogged) {
      let photoCollection = await this._photoService.addPhotos();

      const modal = await this._modalController.create({
        component: ModalphotosaveComponent,
        componentProps: {
          photos: photoCollection,
        },
      });
      await modal.present();
      const res = await modal.onDidDismiss();

      if (!res.data.dismissed) {
        await this._ugcSvc.savePhotos(res.data.photos);
        await this.openModalSuccess(res.data.photos);
      }
    } else {
      this.openModalLogin();
    }
  }

  track(): void {
    if (this.isLogged) {
      let navigationExtras: NavigationExtras = {state: {currentTrack: this.currentTrack}};
      this._navCtrl.navigateForward('register', navigationExtras);
    } else {
      this.openModalLogin();
    }
  }

  waypoint() {
    if (this.isLogged) {
      let navigationExtras: NavigationExtras = {state: {currentTrack: this.currentTrack}};
      this._navCtrl.navigateForward('waypoint', navigationExtras);
    } else {
      this.openModalLogin();
    }
  }
}
