import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController, PopoverController } from '@ionic/angular';
import { IPhotoItem, PhotoService } from 'src/app/services/photo.service';
import { EPopoverPhotoType, ESuccessType } from '../../types/esuccess.enum';
import { ModalSuccessComponent } from '../modal-success/modal-success.component';
import { PopoverphotoComponent } from './popoverphoto/popoverphoto.component';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'webmapp-modalphotos',
  templateUrl: './modalphotos.component.html',
  styleUrls: ['./modalphotos.component.scss'],
})
export class ModalphotosComponent implements OnInit {
  public photoCollection: IPhotoItem[] = [];
  public selectedPhoto: IPhotoItem;

  public sliderOptions: any = {
    slidesPerView: 5,
    // distanceBetween: 2,
    // centerInsufficientSlides : true
  };
  @ViewChild('slider', { static: true }) slider: IonSlides;

  constructor(
    private _photoService: PhotoService,
    private _modalController: ModalController,
    private _popoverController: PopoverController
  ) { }

  ngOnInit() {
    if (this.photoCollection && this.photoCollection.length) {
      this.selectedPhoto =
        this.photoCollection[this.photoCollection.length - 1];
      
    }
    // this.sliderUpdate();
  }

  close() {
    this._modalController.dismiss({
      dismissed: true,
    });
  }

  sliderUpdate() {
    setTimeout(() => {
      this.slider.options = this.sliderOptions;
      this.slider.update();
    }, 10);
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
    const photos = await this._photoService.getPhotos(); if (photos && photos.length) {
      photos.forEach(async (photo) => {
        const photoData = await this._photoService.getPhotoData(photo.photoURL);
        const md5 = Md5.hashStr(JSON.stringify(photoData));
        let exists: boolean = false;
        for (let p of this.photoCollection) {
          const pData = p.datasrc ? await this._photoService.getPhotoData(p.datasrc) : await this._photoService.getPhotoData(p.photoURL);
          const pictureMd5 = Md5.hashStr(JSON.stringify(pData));
          if (md5 === pictureMd5) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          this.photoCollection.push(photo);
          this.select(photo);
        }
      });
    }
    // this.sliderUpdate();
  }

  select(photo) {
    this.selectedPhoto = photo;
  }

  delete() {
    const idx = this.photoCollection.findIndex(
      (x) => x.datasrc === this.selectedPhoto.datasrc
    );
    this.photoCollection.splice(idx, 1);
    if (this.photoCollection.length) {
      this.selectedPhoto =
        this.photoCollection[Math.min(this.photoCollection.length - 1, idx)];
    } else {
      this.selectedPhoto = null;
      this.addPhoto();
    }
  }

  async next() {
    this._modalController.dismiss(
      {photos:this.photoCollection}
    );
    
  }

  
}
