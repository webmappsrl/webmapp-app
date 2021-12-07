import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController, PopoverController } from '@ionic/angular';
import { IPhotoItem, PhotoService } from 'src/app/services/photo.service';
import { SaveService } from 'src/app/services/save.service';
import { EPopoverPhotoType, ESuccessType } from '../../types/esuccess.enum';
import { ModalSuccessComponent } from '../modal-success/modal-success.component';
import { ModalphotosaveComponent } from './modalphotosave/modalphotosave.component';
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
    distanceBetween: 2,
  };
  @ViewChild('slider', { static: true }) slider: IonSlides;

  constructor(
    private _photoService: PhotoService,
    private _modalController: ModalController,
    private _popoverController: PopoverController,
    private _saveService: SaveService
  ) {}

  ngOnInit() {
    if (this.photoCollection && this.photoCollection.length) {
      this.selectedPhoto =
        this.photoCollection[this.photoCollection.length - 1];
    }
    setTimeout(() => {
      this.slider.options = this.sliderOptions;
      this.slider.update();
    }, 0);
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
      photos.forEach(async (photo) => {
        const photoData = await this._photoService.getPhotoData(photo.photoURL),
          md5 = Md5.hashStr(JSON.stringify(photoData));
        let exists: boolean = false;
        for (let p of this.photoCollection) {
          const pData = await this._photoService.getPhotoData(p.photoURL),
            pictureMd5 = Md5.hashStr(JSON.stringify(pData));
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
      await this._saveService.savePhotos(res.data.photos);

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
