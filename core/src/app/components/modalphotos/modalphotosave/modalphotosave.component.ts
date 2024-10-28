import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActionSheetController, AlertController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ModalPhotoSingleComponent} from '../modal-photo-single/modal-photo-single.component';
import {IPhotoItem, PhotoService} from 'wm-core/services/photo.service';
import {Feature, Point} from 'geojson';
@Component({
  selector: 'webmapp-modalphotosave',
  templateUrl: './modalphotosave.component.html',
  styleUrls: ['./modalphotosave.component.scss'],
})
export class ModalphotosaveComponent implements OnInit {
  public photos: Feature<Point>[];
  public showList = false;

  constructor(
    private modalController: ModalController,
    private _translate: TranslateService,
    private _alertController: AlertController,
    private _photoService: PhotoService,
    private _cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {}

  async addPhotos() {
    try {
      const photos = await this._photoService.addPhotos();
      this.photos = [...this.photos, ...photos];
    } catch {}
    this._cdr.detectChanges;
  }

  close() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  async edit(photo) {
    const modalSinglePhoto = await this.modalController.create({
      component: ModalPhotoSingleComponent,
      componentProps: {
        photo,
        photos: this.photos,
      },
    });
    await modalSinglePhoto.present();
    // const resPhoto = await modalSinglePhoto.onDidDismiss()
  }

  isValid() {
    return true;
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
          handler: () => {},
        },
        {
          text: translation['modals.photo.save.modalconfirm.confirm'],
          cssClass: 'webmapp-modalconfirm-btn',
          handler: () => {
            const idx = this.photos.findIndex(x => x.id == photo.id);
            if (idx >= 0) {
              this.photos.splice(idx, 1);
            }
          },
        },
      ],
    });
    this._cdr.detectChanges();
    await alert.present();
  }

  save() {
    if (!this.isValid()) {
      return;
    }

    this.modalController.dismiss({
      photos: this.photos,
    });
  }

  setShowModeList(isList: boolean) {
    this.showList = isList;
  }

  valChange(value, idx) {
    this.photos[idx].properties.description = value;
  }
}
