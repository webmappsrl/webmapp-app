import { Component, Input, OnInit } from '@angular/core';
import { CameraPhoto } from '@capacitor/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { PhotoItem, PhotoService } from 'src/app/services/photo.service';
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
    this.photoCollection.push(this.photo);
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
    const nextPhoto = await this.photoService.shotPhoto();
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
    this.photo = this.photoCollection.length ? this.photoCollection[Math.min(this.photoCollection.length - 1, idx)] : null;
  }

  next() {

  }


}
