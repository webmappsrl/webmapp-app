import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {ModalController, LoadingController} from '@ionic/angular';
import {ModalSuccessComponent} from 'src/app/components/modal-success/modal-success.component';
import {ESuccessType} from 'src/app/types/esuccess.enum';
import {Md5} from 'ts-md5';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {UntypedFormGroup} from '@angular/forms';
import {Location} from 'src/app/types/location';
import {confMAP} from 'wm-core/store/conf/conf.selector';
import {IPhotoItem, CameraService} from 'wm-core/services/camera.service';
import {UgcService} from 'wm-core/services/ugc.service';
import {WmFeature} from '@wm-types/feature';
import {Point} from 'geojson';
import {generateUUID} from 'wm-core/utils/localForage';
import {ConfService} from 'wm-core/store/conf/conf.service';
import packageJson from 'package.json';
@Component({
  selector: 'webmapp-modal-waypoint-save',
  templateUrl: './modal-waypoint-save.component.html',
  styleUrls: ['./modal-waypoint-save.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ModalWaypointSaveComponent implements OnInit {
  acquisitionFORM$: Observable<any[]>;
  confMap$: Observable<any> = this._store.select(confMAP);
  description: string;
  displayPosition: Location;
  fg: UntypedFormGroup;
  isValidArray: boolean[] = [false, false];
  nominatim: any;
  photos: any[] = [];
  position: Location;
  positionCity: string = 'città';
  positionString: string;
  title: string;
  validate = false;
  waypointtype = 'waypoint';

  constructor(
    private _modalCtrl: ModalController,
    private _photoSvc: CameraService,
    private _ugcSvc: UgcService,
    private _loadingCtrl: LoadingController,
    private _store: Store<any>,
    private _cdr: ChangeDetectorRef,
    private _configSvc: ConfService,
  ) {}

  ngOnInit() {
    this.positionString = `${this.position.latitude}, ${this.position.longitude}`;
    setTimeout(() => {
      this.displayPosition = this.position;
    }, 2000);
  }

  async addPhotos() {
    let library = [];
    const loading = await this._loadingCtrl.create();
    loading.present();
    try {
      library = await this._photoSvc.getPhotos();
    } catch (_) {
      loading.dismiss();
    }
    loading.dismiss();
    library.forEach(async libraryItem => {
      const libraryItemCopy = Object.assign({selected: false}, libraryItem);
      const photoData = await this._photoSvc.getPhotoData(libraryItemCopy.properties.photo.webPath);
      const md5 = Md5.hashStr(JSON.stringify(photoData));
      let exists: boolean = false;
      for (let p of this.photos) {
        const pData = await this._photoSvc.getPhotoData(p.properties.photo.webPath);
        const pictureMd5 = Md5.hashStr(JSON.stringify(pData));
        if (md5 === pictureMd5) {
          exists = true;
          break;
        }
      }
      if (!exists) this.photos.push(libraryItemCopy);
      this._cdr.detectChanges();
    });
  }

  close() {
    this._modalCtrl.dismiss({
      dismissed: true,
    });
  }

  isValid() {
    this.validate = true;
    const allValid = this.isValidArray.reduce((x, curr) => {
      return curr && x;
    }, true);
    return allValid;
  }

  async openModalSuccess(waypoint) {
    const modaSuccess = await this._modalCtrl.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: ESuccessType.WAYPOINT,
        waypoint,
      },
    });
    await modaSuccess.present();
    await modaSuccess.onDidDismiss();
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

  async save() {
    if (this.fg.invalid) {
      return;
    }
    const ugcPoi: WmFeature<Point> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [this.position.longitude, this.position.latitude],
      },
      properties: {
        name: this.fg.value.title,
        type: 'waypoint',
        date: new Date().toString(),
        photos: this.photos,
        nominatim: this.nominatim,
        uuid: generateUUID(),
        app_id: `${this._configSvc.geohubAppId}`,
        appVersion: packageJson.version,
        form: this.fg.value,
      },
    };
    const waypoint: any = await this._ugcSvc.savePoi(ugcPoi);

    this._modalCtrl.dismiss();

    await this.openModalSuccess(waypoint);
  }

  setIsValid(idx: number, isValid: boolean) {
    this.isValidArray[idx] = isValid;
  }
}
