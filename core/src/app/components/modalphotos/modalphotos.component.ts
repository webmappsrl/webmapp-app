import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { IPhotoItem, PhotoService } from 'src/app/services/photo.service';
import { SaveService } from 'src/app/services/save.service';
import { EPopoverPhotoType, ESuccessType } from '../../types/esuccess.enum';
import { ModalSuccessComponent } from '../modal-success/modal-success.component';
import { ModalphotosaveComponent } from './modalphotosave/modalphotosave.component';
import { PopoverphotoComponent } from './popoverphoto/popoverphoto.component';

@Component({
  selector: 'webmapp-modalphotos',
  templateUrl: './modalphotos.component.html',
  styleUrls: ['./modalphotos.component.scss'],
})
export class ModalphotosComponent implements OnInit {
  public photoCollection: IPhotoItem[] = [];
  public photo: IPhotoItem;

  sliderOptions: any = {
    slidesPerView: 5,
    distanceBetween: 2,
  };

  constructor(
    private _photoService: PhotoService,
    private _modalController: ModalController,
    private _popoverController: PopoverController,
    private _saveService: SaveService
  ) {}

  ngOnInit() {
    if (this.photoCollection && this.photoCollection.length) {
      this.photo = this.photoCollection[this.photoCollection.length - 1];
    }
  }

  close() {
    this._modalController.dismiss({
      dismissed: true,
    });
  }

  async add(ev: any) {
    const popover = await this._popoverController.create({
      component: PopoverphotoComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    await popover.present();
    const { role } = await popover.onDidDismiss();
    if (role === EPopoverPhotoType.PHOTOS) {
      this.addPhoto();
    } else if (role === EPopoverPhotoType.LIBRARY) {
      this.addFromLibrary();
    }
  }

  async addPhoto() {
    const nextPhoto = await this._photoService.shotPhoto(false);
    if (nextPhoto) {
      this.photoCollection.push(nextPhoto);
      this.select(nextPhoto);
    }
  }

  async addFromLibrary() {
    const photos = await this._photoService.getPhotos();
    if (photos && photos.length) {
      photos.forEach((photo) => {
        this.photoCollection.push(photo);
        this.select(photo);
      });
    }
  }

  select(photo) {
    this.photo = photo;
  }

  delete() {
    const idx = this.photoCollection.findIndex(
      (x) => x.data === this.photo.data
    );
    this.photoCollection.splice(idx, 1);
    if (this.photoCollection.length) {
      this.photo =
        this.photoCollection[Math.min(this.photoCollection.length - 1, idx)];
    } else {
      this.photo = null;
      this.addPhoto();
    }
  }

  async next() {
    this._modalController.dismiss();
    const modal = await this._modalController.create({
      component: ModalphotosaveComponent,
      componentProps: {
        photos: this.photoCollection,
      },
    });
    await modal.present();
    const res = await modal.onDidDismiss();

    if (!res.data.dismissed) {
      for (const photo of res.data.photos) {
        await this._saveService.savePhoto(photo);
      }

      await this.openModalSuccess(res.data.photos);
    }
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
