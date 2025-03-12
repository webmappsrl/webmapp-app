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
import {from, Observable} from 'rxjs';
import {UntypedFormGroup} from '@angular/forms';
import {Location} from 'src/app/types/location';
import {confMAP} from '@wm-core/store/conf/conf.selector';
import {CameraService} from '@wm-core/services/camera.service';
import {WmFeature} from '@wm-types/feature';
import {Point} from 'geojson';
import {generateUUID, saveUgcPoi} from '@wm-core/utils/localForage';
import {ConfService} from '@wm-core/store/conf/conf.service';
import {DeviceService} from '@wm-core/services/device.service';
import {switchMap, take} from 'rxjs/operators';
import {syncUgcPois} from '@wm-core/store/features/ugc/ugc.actions';
import {Photo} from '@capacitor/camera';
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
  photos: Photo[] = [];
  position: Location;
  positionCity: string = 'città';
  positionString: string;
  title: string;
  validate = false;
  waypointtype = 'waypoint';

  constructor(
    private _modalCtrl: ModalController,
    private _cameraSvc: CameraService,
    private _loadingCtrl: LoadingController,
    private _store: Store<any>,
    private _cdr: ChangeDetectorRef,
    private _configSvc: ConfService,
    private _deviceSvc: DeviceService,
  ) {}

  ngOnInit() {
    this.positionString = `${this.position.latitude}, ${this.position.longitude}`;
    setTimeout(() => {
      this.displayPosition = this.position;
    }, 2000);
  }
  private _addFormError(error): void {
    this.fg.setErrors({...(this.fg.errors || {}), error});
  }
  private _removeFormError(errorKey: string): void {
    if (!this.fg.errors || !this.fg.errors.error) return;

    const currentErrors = {...this.fg.errors.error};
    delete currentErrors[errorKey];

    // Se non ci sono più errori, rimuove l'oggetto `error`, altrimenti lo aggiorna
    if (Object.keys(currentErrors).length === 0) {
      const newErrors = {...this.fg.errors};
      delete newErrors.error;
      this.fg.setErrors(Object.keys(newErrors).length ? newErrors : null);
    } else {
      this.fg.setErrors({...this.fg.errors, error: currentErrors});
    }
  }

  async addPhotos(): Promise<void> {
    this._addFormError({photo: true}); // serve a invalidare il form durante il caricamento delle foto
    const library = await this._cameraSvc.getPhotos();

    await Promise.all(
      library.map(async libraryItem => {
        const libraryItemCopy = Object.assign({selected: false}, libraryItem);
        const photoData = await this._cameraSvc.getPhotoData(libraryItemCopy.webPath);
        const md5 = Md5.hashStr(JSON.stringify(photoData));

        let exists: boolean = false;
        for (let p of this.photos) {
          const pData = await this._cameraSvc.getPhotoData(p.webPath);
          const pictureMd5 = Md5.hashStr(JSON.stringify(pData));
          if (md5 === pictureMd5) {
            exists = true;
            break;
          }
        }

        if (this.photos.length < 3 && !exists) {
          this.photos.push(libraryItemCopy);
          this._cdr.detectChanges(); // Forza il refresh della view per visualizzare le foto aggiunte
        }
      }),
    );

    this._removeFormError('photo'); // rimuove l'errore di validazione
    this._cdr.detectChanges(); // Forza il refresh della view per abilitare il pulsante di salvataggio
  }

  close(): void {
    this._modalCtrl.dismiss({
      dismissed: true,
    });
  }

  isValid(): boolean {
    this.validate = true;
    const allValid = this.isValidArray.reduce((x, curr) => {
      return curr && x;
    }, true);
    return allValid;
  }

  async openModalSuccess(waypoint: WmFeature<Point>): Promise<void> {
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

  remove(idx: number): void {
    if (idx > -1) {
      this.photos.splice(idx, 1);
    }
    this._cdr.detectChanges();
  }

  async save(): Promise<void> {
    if (this.fg.invalid) {
      return;
    }
    const device = await this._deviceSvc.getInfo();
    const dateNow = new Date();
    const ugcPoi: WmFeature<Point> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [this.position.longitude, this.position.latitude],
      },
      properties: {
        name: this.fg.value.title,
        type: 'waypoint',
        media: this.photos,
        nominatim: this.nominatim,
        uuid: generateUUID(),
        app_id: `${this._configSvc.geohubAppId}`,
        createdAt: dateNow,
        updatedAt: dateNow,
        form: this.fg.value,
        device,
      },
    };

    from(saveUgcPoi(ugcPoi))
      .pipe(
        take(1),
        switchMap(_ => this.backToSuccess()),
        switchMap(_ => this.openModalSuccess(ugcPoi)),
      )
      .subscribe(async dismiss => {
        await dismiss;
        this._store.dispatch(syncUgcPois());
      });
  }

  setIsValid(idx: number, isValid: boolean): void {
    this.isValidArray[idx] = isValid;
  }
  backToSuccess(): Promise<boolean> {
    return this._modalCtrl.dismiss({
      dismissed: false,
      save: true,
    });
  }
}
