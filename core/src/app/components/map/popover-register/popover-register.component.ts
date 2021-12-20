import { Component, OnInit } from '@angular/core';
import {
  ModalController,
  NavController,
  PopoverController,
} from '@ionic/angular';
import { DEF_MAP_LOCATION_ZOOM } from 'src/app/constants/map';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { PhotoService } from 'src/app/services/photo.service';
import { ILocation } from 'src/app/types/location';
import { EPopoverPhotoType, ESuccessType } from 'src/app/types/esuccess.enum';
// import { ModalphotosComponent } from '../../modalphotos/modalphotos.component';
import { PopoverphotoComponent } from '../../modalphotos/popoverphoto/popoverphoto.component';
import { ModalphotosaveComponent } from '../../modalphotos/modalphotosave/modalphotosave.component';
import { SaveService } from 'src/app/services/save.service';
import { ModalSuccessComponent } from '../../modal-success/modal-success.component';

@Component({
  selector: 'webmapp-popover-register',
  templateUrl: './popover-register.component.html',
  styleUrls: ['./popover-register.component.scss'],
})
export class PopoverRegisterComponent implements OnInit {
  public registering: boolean;

  constructor(
    private _geolocationService: GeolocationService,
    private _modalController: ModalController,
    private _navCtrl: NavController,
    private _photoService: PhotoService,
    private _popoverController: PopoverController,
    private _saveService: SaveService
  ) { }

  ngOnInit() { }

  track() {
    const location: ILocation = this._geolocationService.location;
    let state: any = {};

    if (location && location.latitude && location.longitude) {
      state = {
        startView: [
          location.longitude,
          location.latitude,
          DEF_MAP_LOCATION_ZOOM,
        ],
      };
    }

    this._navCtrl.navigateForward('register');
    this.dismiss();
  }

  async photo(ev) {
    this.dismiss();

    // let photos = [];

    // const popover = await this._popoverController.create({
    //   component: PopoverphotoComponent,
    //   event: null, //ev,
    //   translucent: true,
    // });
    // await popover.present();
    // const { role } = await popover.onDidDismiss();
    // if (role === EPopoverPhotoType.PHOTOS) {
    //   const image = await this._photoService.shotPhoto(false);
    //   photos = [image];
    // } else if (role === EPopoverPhotoType.LIBRARY) {
    //    photos = await this._photoService.getPhotos();
    // }

    let photoCollection = await this._photoService.addPhotos();

    // if (photos.length) {
    //   const modalPhotos = await this._modalController.create({
    //     component: ModalphotosComponent,
    //     componentProps: {
    //       photoCollection: photos,
    //     },
    //   });
    //   await modalPhotos.present();
    //   const resPhoto = await modalPhotos.onDidDismiss()
    //   photoCollection = resPhoto.data.photos;
    // }

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



    // Can be set to the src of an image now
    // imageElement.src = imageUrl;
  }

  waypoint() {
    this._navCtrl.navigateForward('waypoint');
    this.dismiss();
  }

  vocal() {
    console.log(
      '---- ~ file: popover-register.component.ts ~ line 30 ~ PopoverRegisterComponent ~ vocal ~ vocal'
    );
    this.dismiss();
  }

  dismiss() {
    this._popoverController.dismiss();
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
}
