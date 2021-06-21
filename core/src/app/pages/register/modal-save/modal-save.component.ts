import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ModalSelectphotosComponent } from '../modal-selectphotos/modal-selectphotos.component';

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


  constructor(
    private modalController: ModalController,
    private translate: TranslateService,
    private alertController: AlertController
  ) { }

  ngOnInit() { }

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
    const photoUrls = [];
    this.photos.forEach(photo => {
      photoUrls.push(photo.photoURL);
    });
    this.modalController.dismiss({
      trackData: {
        photos: photoUrls,
        title: this.title,
        description: this.description,
        activity: this.activity
      },
      dismissed: false
    });

  }

  async addPhotos() {
    const modal = await this.modalController.create({
      component: ModalSelectphotosComponent,
      // cssClass: 'my-custom-class'
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    this.photos = res.data.photos;
  }

  remove(image) {
    const i = this.photos.findIndex(x => x.id === image.id);
    if (i > -1) {
      this.photos.splice(i, 1);
    }
  }

  isValid() {
    return !!this.title && !!this.activity;
  }

}
