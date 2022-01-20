import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { IPhotoItem, PhotoService } from 'src/app/services/photo.service';
import { ModalPhotoSingleComponent } from '../modal-photo-single/modal-photo-single.component';

@Component({
  selector: 'webmapp-modalphotosave',
  templateUrl: './modalphotosave.component.html',
  styleUrls: ['./modalphotosave.component.scss'],
})
export class ModalphotosaveComponent implements OnInit {
  public photos: IPhotoItem[];
  public showList = false;


  constructor(
    private modalController: ModalController,
    private _translate: TranslateService,
    private _alertController: AlertController,
    // public actionSheetController: ActionSheetController,
    private _photoService:PhotoService
  ) { }

  ngOnInit() { }

  close() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  valChange(value, idx) {
    this.photos[idx].description = value;
  }

  async remove(photo) {

    const translation = await this._translate
      .get([
        'modals.photo.save.modalconfirm.title',
        'modals.photo.save.modalconfirm.text',
        'modals.photo.save.modalconfirm.confirm',
        'modals.photo.save.modalconfirm.cancel',
      ])
      .toPromise();

    const alert = await this._alertController.create({
      cssClass: 'webmapp-modalconfirm',
      header: translation['modals.photo.save.modalconfirm.title'],
      message: translation['modals.photo.save.modalconfirm.text'],
      buttons: [
        {
          text: translation['modals.photo.save.modalconfirm.cancel'],
          cssClass: 'webmapp-modalconfirm-btn',
          role: 'cancel',
          handler: () => { },
        },
        {
          text: translation['modals.photo.save.modalconfirm.confirm'],
          cssClass: 'webmapp-modalconfirm-btn',
          handler: () => {
            const idx = this.photos.findIndex(x => x.id == photo.id);
            if (idx >= 0) { this.photos.splice(idx, 1); }
          },
        },
      ],
    });

    await alert.present();

  }
  
  async addPhotos() {
    try{
    const photos = await this._photoService.addPhotos();
    this.photos = [...this.photos,...photos]
    }
    catch{}
  }

  // async addPhotos() {
  //   const modalPhotos = await this.modalController.create({
  //     component: ModalphotosComponent,
  //     componentProps: {
  //       photoCollection: this.photos,
  //     },
  //   });
  //   await modalPhotos.present();
  //   const resPhoto = await modalPhotos.onDidDismiss();
  //   if (!resPhoto.data.dismissed && resPhoto.data.photos) {
  //     this.photos = resPhoto.data.photos;
  //   }
  //   // const photoCollection = resPhoto.data.photos;
  //   // this.photos = [...this.photos,...photoCollection]
  // }

  

  async edit(photo) {
    const modalSinglePhoto = await this.modalController.create({
      component: ModalPhotoSingleComponent,
      componentProps: {
        photo,
        photos: this.photos
      },
    });
    await modalSinglePhoto.present();
    // const resPhoto = await modalSinglePhoto.onDidDismiss()    
  }

  save() {
    if (!this.isValid()) {
      return;
    }

    this.modalController.dismiss({
      photos: this.photos,
    });
  }

  isValid() {
    return true;
  }

  setShowModeList(isList: boolean) {
    this.showList = isList;
  }
}
