import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { PhotoItem, PhotoService } from 'src/app/services/photo.service';
import { SuccessType } from '../../types/success.enum';
import { ModalSuccessComponent } from '../modal-success/modal-success.component';
import { ModalphotosaveComponent } from './modalphotosave/modalphotosave.component';
import { PopoverphotoComponent } from './popoverphoto/popoverphoto.component';

@Component({
  selector: 'webmapp-modalphotos',
  templateUrl: './modalphotos.component.html',
  styleUrls: ['./modalphotos.component.scss'],
})
export class ModalphotosComponent implements OnInit {

  public photoCollection: PhotoItem[] = [];
  public photo: PhotoItem;

  sliderOptions: any = {
    slidesPerView: 5,
    distanceBetween: 2
  };

  constructor(
    private photoService: PhotoService,
    private modalController: ModalController,
    private popoverController: PopoverController

  ) { }

  ngOnInit() {
    if (this.photoCollection && this.photoCollection.length) {
      this.photo = this.photoCollection[this.photoCollection.length - 1];
    }
  }

  close() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  async add(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverphotoComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();
    const { role } = await popover.onDidDismiss();
    if (role === 'photo') {
      this.addPhoto();
    } else {
      this.addFromLibrary();
    }

  }

  async addPhoto() {
    const nextPhoto = await this.photoService.shotPhoto(false);
    if (nextPhoto) {
      this.photoCollection.push(nextPhoto);
      this.select(nextPhoto);
    }
  }

  async addFromLibrary() {
    const photos = await this.photoService.getPhotos();
    if (photos && photos.length) {
      photos.forEach(photo => {
        this.photoCollection.push(photo);
        this.select(photo);
      });
    }
  }

  select(photo) {
    this.photo = photo;
  }

  delete() {
    const idx = this.photoCollection.findIndex(x => x.data === this.photo.data);
    this.photoCollection.splice(idx, 1);
    if (this.photoCollection.length) {
      this.photo = this.photoCollection[Math.min(this.photoCollection.length - 1, idx)];
    } else {
      this.photo = null;
      this.addPhoto();
    }

  }

  async next() {
    this.modalController.dismiss();
    const modal = await this.modalController.create({
      component: ModalphotosaveComponent,
      componentProps: {
        photos: this.photoCollection
      }
    });
    await modal.present();
    const res = await modal.onDidDismiss();

    if (!res.data.dismissed) {
      await this.openModalSuccess(res.data.photos);
    }
  }

  async openModalSuccess(photos) {
    const modaSuccess = await this.modalController.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: SuccessType.PHOTOS,
        photos
      }
    });
    await modaSuccess.present();
    await modaSuccess.onDidDismiss();
  }


}
