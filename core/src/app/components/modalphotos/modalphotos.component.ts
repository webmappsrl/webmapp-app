import { Component, Input, OnInit } from '@angular/core';
import { CameraPhoto } from '@capacitor/core';
import { ModalController } from '@ionic/angular';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'webmapp-modalphotos',
  templateUrl: './modalphotos.component.html',
  styleUrls: ['./modalphotos.component.scss'],
})
export class ModalphotosComponent implements OnInit {

  public photoCollection: CameraPhoto[] = [];
  public photo: CameraPhoto;

  sliderOptions: any = {
    slidesPerView: 5,
    distanceBetween: 2
  };

  constructor(
    private photoService: PhotoService,
    private modalController: ModalController

  ) { }

  ngOnInit() {
    this.photoCollection.push(this.photo);
  }

  close() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  async add() {
    const nextPhoto = await this.photoService.shotPhoto();
    if (nextPhoto) {
      this.photoCollection.push(nextPhoto);
      this.select(nextPhoto);
    }
  }

  select(photo) {
    this.photo = photo;
  }

  delete() {
    const idx = this.photoCollection.findIndex(x => x.webPath === this.photo.webPath);
    this.photoCollection.splice(idx, 1);
    this.photo = this.photoCollection.length ? this.photoCollection[Math.min(this.photoCollection.length - 1, idx)] : null;
  }

  next() {

  }


}
