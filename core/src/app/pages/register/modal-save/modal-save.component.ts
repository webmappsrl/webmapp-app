import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Track } from 'src/app/types/track.d.';
// import { ModalSelectphotosComponent } from '../modal-selectphotos/modal-selectphotos.component';
import { PhotoItem, PhotoService } from 'src/app/services/photo.service';

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

  public track: Track;


  constructor(
    private modalController: ModalController,
    private translate: TranslateService,
    private alertController: AlertController,
    private photoService: PhotoService
  ) { }

  ngOnInit() {
    if (this.track) {
      this.title = this.track.title;
      this.description = this.track.description;
      this.activity = this.track.activity;
    }
  }

  async close() {

    const translation = await this.translate.get([
      'pages.register.modalexit.title',
      'pages.register.modalexit.text',
      'pages.register.modalexit.confirm',
      'pages.register.modalexit.cancel',
    ]).toPromise();

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: translation['pages.register.modalexit.title'],
      message: translation['pages.register.modalexit.text'],
      buttons: [
        {
          text: translation['pages.register.modalexit.cancel'],
          cssClass: 'webmapp-modalconfirm-btn',
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: translation['pages.register.modalexit.confirm'],
          cssClass: 'webmapp-modalconfirm-btn',
          handler: () => {
            this.modalController.dismiss({
              dismissed: true
            });
          }
        }
      ]
    });

    await alert.present();
  }

  save() {

    const trackData: Track = {
      photos: this.photos,
      photoKeys: null,
      title: this.title,
      description: this.description,
      activity: this.activity,
      date: new Date(),
    };
    this.modalController.dismiss({
      trackData,
      dismissed: false
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
    const library = await this.photoService.getPhotos();
    library.forEach((libraryItem) => {
      const libraryItemCopy = Object.assign({ selected: false }, libraryItem);
      console.log('------- ~ file: modal-save.component.ts ~ line 100 ~ ModalSaveComponent ~ library.forEach ~ libraryItemCopy', libraryItemCopy);
      this.photos.push(libraryItemCopy);
    });
    console.log('------- ~ file: modal-save.component.ts ~ line 101 ~ ModalSaveComponent ~ library.forEach ~ this.photos', this.photos);
  }

  remove(image) {
    const i = this.photos.findIndex(x => x.id === image.id || x.key === image.key);
    if (i > -1) {
      this.photos.splice(i, 1);
    }
  }

  isValid() {
    return !!this.title && !!this.activity;
  }

}
