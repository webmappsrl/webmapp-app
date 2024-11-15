import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ModalPhotoSingleComponent} from '../modal-photo-single/modal-photo-single.component';
import {CameraService} from 'wm-core/services/camera.service';
import {Media, MediaProperties, WmFeature} from '@wm-types/feature';
import {removeImg} from 'wm-core/utils/localForage';
@Component({
  selector: 'webmapp-modalphotosave',
  templateUrl: './modalphotosave.component.html',
  styleUrls: ['./modalphotosave.component.scss'],
})
export class ModalphotosaveComponent implements OnInit {
  public photos: WmFeature<Media, MediaProperties>[];
  public showList = false;

  constructor(
    private modalController: ModalController,
    private _translate: TranslateService,
    private _alertController: AlertController,
    private _cameraSvc: CameraService,
    private _cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {}

  async addPhotos(): Promise<void> {
    try {
      const photos = await this._cameraSvc.addPhotos();
      this.photos = [...this.photos, ...photos];
    } catch {}
    this._cdr.detectChanges;
  }

  close(): void  {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  async edit(photo: WmFeature<Media, MediaProperties>): Promise<void> {
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

  isValid(): boolean {
    return true;
  }

  async remove(photo: WmFeature<Media, MediaProperties>): Promise<void> {
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
            const idx = this.photos.findIndex(x => x.properties.uuid == photo.properties.uuid);
            if (idx >= 0) {
              this.photos.splice(idx, 1);
              removeImg(photo.properties.photo.webPath);
            }
          },
        },
      ],
    });
    this._cdr.detectChanges();
    await alert.present();
  }

  save(): void {
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

  valChange(value: string, idx: number): void {
    this.photos[idx].properties.description = value;
  }
}
