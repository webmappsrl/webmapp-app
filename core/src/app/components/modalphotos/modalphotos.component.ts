import {Component, OnInit, ViewChild} from '@angular/core';
import {IonSlides, ModalController, PopoverController} from '@ionic/angular';
import {EPopoverPhotoType, ESuccessType} from '../../types/esuccess.enum';
import {ModalSuccessComponent} from '../modal-success/modal-success.component';
import {PopoverphotoComponent} from './popoverphoto/popoverphoto.component';
import {Md5} from 'ts-md5/dist/md5';
import {IPhotoItem, CameraService} from 'wm-core/services/camera.service';
import {Feature, Point} from 'geojson';
@Component({
  selector: 'webmapp-modalphotos',
  templateUrl: './modalphotos.component.html',
  styleUrls: ['./modalphotos.component.scss'],
})
export class ModalphotosComponent implements OnInit {
  @ViewChild('slider', {static: true}) slider: IonSlides;

  public photoCollection: Feature<Point>[] = [];
  public selectedPhoto: Feature<Point>;
  public sliderOptions: any = {
    slidesPerView: 5,
    // distanceBetween: 2,
    // centerInsufficientSlides : true
  };

  constructor(
    private _cameraSvc: CameraService,
    private _modalController: ModalController,
    private _popoverController: PopoverController,
  ) {}

  ngOnInit() {
    if (this.photoCollection && this.photoCollection.length) {
      this.selectedPhoto = this.photoCollection[this.photoCollection.length - 1];
    }
    // this.sliderUpdate();
  }

  async add(ev: any) {
    const popover = await this._popoverController.create({
      component: PopoverphotoComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    await popover.present();
    const {role} = await popover.onDidDismiss();
    if (role === EPopoverPhotoType.PHOTOS) {
      this.addPhoto();
    } else if (role === EPopoverPhotoType.LIBRARY) {
      this.addFromLibrary();
    }
  }

  async addFromLibrary() {
    const photos = await this._cameraSvc.getPhotos();
    if (photos && photos.length) {
      photos.forEach(async photo => {
        const photoData = await this._cameraSvc.getPhotoData(photo.properties.photoURL);
        const md5 = Md5.hashStr(JSON.stringify(photoData));
        let exists: boolean = false;
        for (let p of this.photoCollection) {
          const pData = p.properties.datasrc
            ? await this._cameraSvc.getPhotoData(p.properties.datasrc)
            : await this._cameraSvc.getPhotoData(p.properties.photoURL);
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

  async addPhoto() {
    const nextPhoto = await this._cameraSvc.shotPhoto();
    if (nextPhoto) {
      this.photoCollection.push(nextPhoto);
      this.select(nextPhoto);
    }
  }

  close() {
    this._modalController.dismiss({
      dismissed: true,
    });
  }

  delete() {
    const idx = this.photoCollection.findIndex(
      x => x.properties.datasrc === this.selectedPhoto.properties.datasrc,
    );
    this.photoCollection.splice(idx, 1);
    if (this.photoCollection.length) {
      this.selectedPhoto = this.photoCollection[Math.min(this.photoCollection.length - 1, idx)];
    } else {
      this.selectedPhoto = null;
      this.addPhoto();
    }
  }

  async next() {
    this._modalController.dismiss({photos: this.photoCollection});
  }

  select(photo) {
    this.selectedPhoto = photo;
  }

  sliderUpdate() {
    setTimeout(() => {
      this.slider.options = this.sliderOptions;
      this.slider.update();
    }, 10);
  }
}
