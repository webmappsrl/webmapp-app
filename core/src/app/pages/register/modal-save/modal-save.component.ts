import {LineString} from 'geojson';
import {Observable, from} from 'rxjs';
import {Md5} from 'ts-md5';

import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {Photo} from '@capacitor/camera';
import {ActionSheetController, AlertController, ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {CameraService} from '@wm-core/services/camera.service';
import {DeviceService} from '@wm-core/services/device.service';
import {ConfService} from '@wm-core/store/conf/conf.service';
import {syncUgcTracks} from '@wm-core/store/features/ugc/ugc.actions';
import {generateUUID, saveUgcTrack} from '@wm-core/utils/localForage';
import {Media, WmFeature} from '@wm-types/feature';
import {switchMap, take} from 'rxjs/operators';
import {ModalSuccessComponent} from 'src/app/components/modal-success/modal-success.component';
import {activities} from 'src/app/constants/activities';
import {ESuccessType} from 'src/app/types/esuccess.enum';
import {LangService} from '@wm-core/localization/lang.service';

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
  public fg: UntypedFormGroup;
  public isValidArray: boolean[] = [false, false];
  public photos: Photo[] = [];
  public recordedFeature: WmFeature<LineString>;
  public title: string;
  public track: WmFeature<LineString>;
  public validate = false;

  constructor(
    private _modalCtrl: ModalController,
    private _configSvc: ConfService,
    private _deviceSvc: DeviceService,
    private _langSvc: LangService,
    private _alertController: AlertController,
    private _cameraSvc: CameraService,
    private _cdr: ChangeDetectorRef,
    private _actionSheetCtrl: ActionSheetController,
    private _store: Store<any>,
  ) {}

  async addPhotos(): Promise<void> {
    const library = await this._cameraSvc.getPhotos();
    library.forEach(async libraryItem => {
      const libraryItemCopy = Object.assign({selected: false}, libraryItem);
      const photoData = await this._cameraSvc.getPhotoData(libraryItemCopy.webPath);
      const md5 = Md5.hashStr(JSON.stringify(photoData));
      let exists: boolean = false;
      for (let p of this.photos) {
        const pData = await this._cameraSvc.getPhotoData(p.webPath),
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

  remove(index: number): void {
    if (index > -1) {
      this.photos.splice(index, 1);
    }
    this._cdr.detectChanges();
  }

  backToRecording(): void {
    this._modalCtrl.dismiss({
      dismissed: true,
    });
  }

  backToSuccess(): Promise<boolean> {
    return this._modalCtrl.dismiss({
      dismissed: false,
      save: true,
    });
  }

  async close(): Promise<void> {
    const translation = await this._langSvc
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
    const translation = await this._langSvc
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

  ngOnInit() {
    if (this.track && this.track.properties) {
      const properties = this.track.properties;
      this.title = properties.name ?? '';
      this.description = properties.form?.description ?? '';
      this.activity = properties.form?.activity ?? '';
    }
  }

  async openModalSuccess(track: WmFeature<LineString>): Promise<any> {
    const modaSuccess = await this._modalCtrl.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: ESuccessType.TRACK,
        track,
      },
    });
    await modaSuccess.present();
    return modaSuccess.onDidDismiss();
  }

  async save(): Promise<void> {
    if (this.fg.invalid) {
      return;
    }

    const distanceFilter = +localStorage.getItem('wm-distance-filter') || 10;
    const device = await this._deviceSvc.getInfo();
    const dateNow = new Date();

    this.recordedFeature.properties = {
      ...this.recordedFeature.properties,
      name: this.fg.value.title,
      form: this.fg.value,
      media: this.photos,
      uuid: generateUUID(),
      distanceFilter,
      app_id: `${this._configSvc.geohubAppId}`,
      createdAt: dateNow,
      updatedAt: dateNow,
      device,
    };

    from(saveUgcTrack(this.recordedFeature))
      .pipe(
        take(1),
        switchMap(_ => this.backToSuccess()),
        switchMap(_ => this.openModalSuccess(this.recordedFeature)),
      )
      .subscribe(async dismiss => {
        await dismiss;
        this._store.dispatch(syncUgcTracks());
      });
  }

  setIsValid(idx: number, isValid: boolean): void {
    this.isValidArray[idx] = isValid;
  }
}
