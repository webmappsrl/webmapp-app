import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActionSheetController, AlertController, ModalController, Platform} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Md5} from 'ts-md5';
import {activities} from 'src/app/constants/activities';
import {Observable} from 'rxjs';
import {UntypedFormGroup} from '@angular/forms';
import {CameraService} from 'wm-core/services/camera.service';
import {Media, MediaProperties, WmFeature} from '@wm-types/feature';
import {LineString} from 'geojson';
import { generateUUID } from 'wm-core/utils/localForage';
import { UgcService } from 'wm-core/services/ugc.service';
import {ConfService} from 'wm-core/store/conf/conf.service';
import packageJson from 'package.json';
import { ModalSuccessComponent } from 'src/app/components/modal-success/modal-success.component';
import { ESuccessType } from 'src/app/types/esuccess.enum';
@Component({
  selector: 'webmapp-modal-save',
  templateUrl: './modal-save.component.html',
  styleUrls: ['./modal-save.component.scss'],
})
export class ModalSaveComponent implements OnInit {
  acquisitionFORM$: Observable<any[]>;
  public activities = activities;
  public activity: string;
  public description: string;
  fg: UntypedFormGroup;
  public isValidArray: boolean[] = [false, false];
  public photos: WmFeature<Media, MediaProperties>[] = [];
  recordedFeature: WmFeature<LineString>;
  public title: string;
  track: WmFeature<LineString>;
  public validate = false;

  constructor(
    private _modalCtrl: ModalController,
    private _ugcSvc: UgcService,
    private _configSvc: ConfService,
    private _platform: Platform,
    private _translate: TranslateService,
    private _alertController: AlertController,
    private _cameraSvc: CameraService,
    private _cdr: ChangeDetectorRef,
    private _actionSheetCtrl: ActionSheetController,
  ) {}

  ngOnInit() {
    if (this.track && this.track.properties) {
      const properties = this.track.properties;
      this.title = properties.name ?? '';
      this.description = properties.form?.description ?? '';
      this.activity = properties.form?.activity ?? '';
    }
  }

  async addPhotos(): Promise<void> {
    const library = await this._cameraSvc.getPhotos();
    library.forEach(async libraryItem => {
      const libraryItemCopy = Object.assign({selected: false}, libraryItem);
      const photoData = await this._cameraSvc.getPhotoData(libraryItemCopy.properties.photo.webPath);
      const md5 = Md5.hashStr(JSON.stringify(photoData));
      let exists: boolean = false;
      for (let p of this.photos) {
        const pData = await this._cameraSvc.getPhotoData(p.properties.photo.webPath),
          pictureMd5 = Md5.hashStr(JSON.stringify(pData));
        if (md5 === pictureMd5) {
          exists = true;
          break;
        }
      }
      if (!exists) this.photos.push(libraryItemCopy);
      this._cdr.detectChanges();
    });
  }

  backToMap(): void {
    this._modalCtrl.dismiss({
      dismissed: false,
      save: false,
    });
  }

  backToRecording(): void {
    this._modalCtrl.dismiss({
      dismissed: true,
    });
  }

  backToSuccess(): void {
    this._modalCtrl.dismiss({
      dismissed: false,
      save: true,
    });
  }

  async close(): Promise<void> {
    const translation = await this._translate
      .get([
        'pages.register.modalsave.closemodal.title',
        'pages.register.modalsave.closemodal.back',
        'pages.register.modalsave.closemodal.delete',
        'pages.register.modalsave.closemodal.cancel',
      ])
      .toPromise();

    this._actionSheetCtrl
      .create({
        // header: translation['pages.register.modalsave.closemodal.title'],
        buttons: [
          {
            text: translation['pages.register.modalsave.closemodal.back'],
            handler: () => {
              this.backToRecording();
            },
          },
          {
            text: translation['pages.register.modalsave.closemodal.delete'],
            role: 'destructive',
            handler: () => {
              this.exit();
            },
          },
          {
            text: translation['pages.register.modalsave.closemodal.cancel'],
            role: 'cancel',
            handler: () => {},
          },
        ],
      })
      .then(actionSheet => {
        actionSheet.present();
      });
  }

  async exit(): Promise<void> {
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
          text: translation['pages.register.modalexit.confirm'],
          cssClass: 'webmapp-modalconfirm-btn',
          role: 'destructive',
          handler: () => {
            this.backToMap();
          },
        },
        {
          text: translation['pages.register.modalexit.cancel'],
          cssClass: 'webmapp-modalconfirm-btn',
          role: 'cancel',
          handler: () => {},
        },
      ],
    });

    await alert.present();
  }

  isValid(): boolean {
    this.validate = true;
    const allValid = this.isValidArray.reduce((x, curr) => {
      return curr && x;
    }, true);
    return allValid;
  }

  async openModalSuccess(track: WmFeature<LineString>): Promise<void> {
    const modaSuccess = await this._modalCtrl.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: ESuccessType.TRACK,
        track,
      },
    });
    await modaSuccess.present();
  }

  remove(image: WmFeature<Media, MediaProperties>): void {
    const i = this.photos.findIndex(
      x => x.properties?.uuid === image.properties?.uuid
    );
    if (i > -1) {
      this.photos.splice(i, 1);
    }
    this._cdr.detectChanges();
  }

  async save(): Promise<void> {
    if (this.fg.invalid) {
      return;
    }

    const distanceFilter = +localStorage.getItem('wm-distance-filter') || 10;
    const device = {
      os: this._platform.is('android') ? 'android' : this._platform.is('ios') ? 'ios' : 'other',
    };

    this.recordedFeature.properties = {
      ...this.recordedFeature.properties,
      name: this.fg.value.title,
      form: this.fg.value,
      photos: this.photos,
      uuid: generateUUID(),
      distanceFilter,
      device,
      app_id: `${this._configSvc.geohubAppId}`,
      appVersion: packageJson.version,
    };
/*     console.log('recordedFeature:', this.recordedFeature); */

    await this._ugcSvc.saveTrack(this.recordedFeature);
    this.backToSuccess();
    await this.openModalSuccess(this.recordedFeature);
  }

  setIsValid(idx: number, isValid: boolean): void {
    this.isValidArray[idx] = isValid;
  }
}
