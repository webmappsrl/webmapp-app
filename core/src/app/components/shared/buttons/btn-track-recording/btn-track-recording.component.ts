import {ModalController, NavController} from '@ionic/angular';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import {DEF_MAP_LOCATION_ZOOM} from 'src/app/constants/map';
import {ESuccessType} from 'src/app/types/esuccess.enum';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {ModalSuccessComponent} from 'src/app/components/modal-success/modal-success.component';
import {ModalphotosaveComponent} from 'src/app/components/modalphotos/modalphotosave/modalphotosave.component';
import {PhotoService} from 'src/app/services/photo.service';
import {SaveService} from 'src/app/services/save.service';
import {LoginComponent} from '../../login/login.component';
import {Location} from 'src/app/types/location';

@Component({
  selector: 'wm-btn-track-recording',
  templateUrl: './btn-track-recording.component.html',
  styleUrls: ['./btn-track-recording.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BtnTrackRecordingComponent {
  @Input() isLogged = false;
  @Output('start-recording') startRecording: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private _navCtrl: NavController,
    private _geolocationSvc: GeolocationService,
    private _modalController: ModalController,
    private _photoService: PhotoService,
    private _saveService: SaveService,
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
        await this._saveService.savePhotos(res.data.photos);
        await this.openModalSuccess(res.data.photos);
      }
    } else {
      this.openModalLogin();
    }
  }

  track(): void {
    if (this.isLogged) {
      const location: Location = this._geolocationSvc.location;
      let state: any = {};

      if (location && location.latitude && location.longitude) {
        state = {
          startView: [location.longitude, location.latitude, DEF_MAP_LOCATION_ZOOM],
        };
      }

      this._navCtrl.navigateForward('register');
    } else {
      this.openModalLogin();
    }
  }

  waypoint() {
    if (this.isLogged) {
      this._navCtrl.navigateForward('waypoint');
    } else {
      this.openModalLogin();
    }
  }
}
