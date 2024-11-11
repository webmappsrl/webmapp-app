import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActionSheetController, AlertController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Md5} from 'ts-md5';
import {activities} from 'src/app/constants/activities';
import {Observable} from 'rxjs';
import {UntypedFormGroup} from '@angular/forms';
import {IPhotoItem, CameraService} from 'wm-core/services/camera.service';
import {WmFeature} from '@wm-types/feature';
import {LineString} from 'geojson';

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
  public photos: any[] = [];
  public title: string;
  public track: WmFeature<LineString>;
  public validate = false;

  constructor(
    private _modalController: ModalController,
    private _translate: TranslateService,
    private _alertController: AlertController,
    private _cameraSvc: CameraService,
    private _cdr: ChangeDetectorRef,
    private _actionSheetCtrl: ActionSheetController,
  ) {}

  ngOnInit() {
    if (this.track) {
      this.title = this.track.properties.name;
      this.description = this.track.properties.form.description;
      this.activity = this.track.properties.form.activity;
    }
  }

  async addPhotos() {
    const library = await this._cameraSvc.getPhotos();
    library.forEach(async libraryItem => {
      const libraryItemCopy = Object.assign({selected: false}, libraryItem);
      const photoData = await this._cameraSvc.getPhotoData(libraryItemCopy.properties.photoURL),
        md5 = Md5.hashStr(JSON.stringify(photoData));
      let exists: boolean = false;
      for (let p of this.photos) {
        const pData = await this._cameraSvc.getPhotoData(p.photoURL),
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

  backToMap() {
    this._modalController.dismiss({
      dismissed: false,
      save: false,
    });
  }

  backToRecording() {
    this._modalController.dismiss({
      dismissed: true,
    });
  }

  backToSuccess(trackData) {
    this._modalController.dismiss({
      trackData,
      dismissed: false,
      save: true,
    });
  }

  async close() {
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

  async exit() {
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

  isValid() {
    this.validate = true;
    const allValid = this.isValidArray.reduce((x, curr) => {
      return curr && x;
    }, true);
    return allValid;
  }

  remove(image: IPhotoItem) {
    const i = this.photos.findIndex(
      x => x.photoURL === image.photoURL || (!!x.key && !!image.key && x.key === image.key),
    );
    if (i > -1) {
      this.photos.splice(i, 1);
    }
    this._cdr.detectChanges();
  }

  save() {
    if (this.fg.invalid) {
      return;
    }
    const trackData: WmFeature<LineString> = {
      type: 'Feature',
      geometry:{
        type: 'LineString',
        coordinates: []
      },
      properties: {
        name: this.fg.value.title,
        photos: this.photos,
        photoKeys: null,
        date: new Date(),
        form: this.fg.value,
      },
    };
    this.backToSuccess(trackData);
  }

  setIsValid(idx: number, isValid: boolean) {
    this.isValidArray[idx] = isValid;
  }
}
