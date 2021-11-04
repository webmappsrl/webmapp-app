import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ITrack } from 'src/app/types/track';
import { IPhotoItem, PhotoService } from 'src/app/services/photo.service';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'webmapp-modal-save',
  templateUrl: './modal-save.component.html',
  styleUrls: ['./modal-save.component.scss'],
})
export class ModalSaveComponent implements OnInit {
  public title: string;
  public description: string;
  public activity: string;

  public photos: any[] = [];

  public track: ITrack;

  constructor(
    private _modalController: ModalController,
    private _translate: TranslateService,
    private _alertController: AlertController,
    private _photoService: PhotoService
  ) {}

  ngOnInit() {
    if (this.track) {
      this.title = this.track.title;
      this.description = this.track.description;
      this.activity = this.track.activity;
    }
  }

  async close() {
    const translation = await this._translate
      .get([
        'pages.register.modalexit.title',
        'pages.register.modalexit.text',
        'pages.register.modalexit.confirm',
        'pages.register.modalexit.cancel',
      ])
      .toPromise();

    const alert = await this._alertController.create({
      cssClass: 'my-custom-class',
      header: translation['pages.register.modalexit.title'],
      message: translation['pages.register.modalexit.text'],
      buttons: [
        {
          text: translation['pages.register.modalexit.cancel'],
          cssClass: 'webmapp-modalconfirm-btn',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: translation['pages.register.modalexit.confirm'],
          cssClass: 'webmapp-modalconfirm-btn',
          handler: () => {
            this._modalController.dismiss({
              dismissed: true,
            });
          },
        },
      ],
    });

    await alert.present();
  }

  save() {
    const trackData: ITrack = {
      photos: this.photos,
      photoKeys: null,
      title: this.title,
      description: this.description,
      activity: this.activity,
      date: new Date(),
    };
    this._modalController.dismiss({
      trackData,
      dismissed: false,
    });
  }

  // async addPhotos() {
  //   const modal = await this.modalController.create({
  //     component: ModalSelectphotosComponent,
  //     // cssClass: 'my-custom-class'
  //   });
  //   await modal.present();
  //   const res = await modal.onDidDismiss();
  //   if (res.data && res.data.photos) {
  //     this.photos = res.data.photos;
  //   }
  // }

  async addPhotos() {
    const library = await this._photoService.getPhotos();
    library.forEach(async (libraryItem) => {
      const libraryItemCopy = Object.assign({ selected: false }, libraryItem);
      const photoData = await this._photoService.getPhotoData(
          libraryItemCopy.photoURL
        ),
        md5 = Md5.hashStr(JSON.stringify(photoData));
      let exists: boolean = false;
      for (let p of this.photos) {
        const pData = await this._photoService.getPhotoData(p.photoURL),
          pictureMd5 = Md5.hashStr(JSON.stringify(pData));
        if (md5 === pictureMd5) {
          exists = true;
          break;
        }
      }
      if (!exists) this.photos.push(libraryItemCopy);
    });
  }

  remove(image: IPhotoItem) {
    const i = this.photos.findIndex(
      (x) =>
        x.photoURL === image.photoURL ||
        (!!x.key && !!image.key && x.key === image.key)
    );
    if (i > -1) {
      this.photos.splice(i, 1);
    }
  }

  isValid() {
    return !!this.title && !!this.activity;
  }
}
