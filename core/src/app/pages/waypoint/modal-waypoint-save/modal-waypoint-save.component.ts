import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {ModalController, IonContent} from '@ionic/angular';
import {ModalSuccessComponent} from 'src/app/components/modal-success/modal-success.component';
import {ESuccessType} from 'src/app/types/esuccess.enum';
import {Store} from '@ngrx/store';
import {from, Observable} from 'rxjs';
import {Location} from 'src/app/types/location';
import {confMAP} from '@wm-core/store/conf/conf.selector';
import {WmFeature} from '@wm-types/feature';
import {Point} from 'geojson';
import {generateUUID, saveUgcPoi} from '@wm-core/utils/localForage';
import {DeviceService} from '@wm-core/services/device.service';
import {switchMap, take} from 'rxjs/operators';
import {syncUgcPois} from '@wm-core/store/features/ugc/ugc.actions';
import {Photo} from '@capacitor/camera';
import {EnvironmentService} from '@wm-core/services/environment.service';
import {addFormError, removeFormError} from '@wm-core/utils/form';
import {BaseFormVisibilityComponent} from 'src/app/components/base-form-visibility.component.ts/base-form-visibility.component';

@Component({
  selector: 'webmapp-modal-waypoint-save',
  templateUrl: './modal-waypoint-save.component.html',
  styleUrls: ['./modal-waypoint-save.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ModalWaypointSaveComponent extends BaseFormVisibilityComponent implements OnInit {
  @ViewChild(IonContent, {static: false}) ionContent: IonContent;
  @ViewChild('formContainer', {static: false}) formContainer: ElementRef;

  acquisitionFORM$: Observable<any[]>;
  confMap$: Observable<any> = this._store.select(confMAP);
  description: string;
  displayPosition: Location;
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
    private _store: Store<any>,
    protected _cdr: ChangeDetectorRef,
    private _environmentSvc: EnvironmentService,
    private _deviceSvc: DeviceService,
  ) {
    super(_cdr);
  }

  ngOnInit() {
    this.positionString = `${this.position.latitude}, ${this.position.longitude}`;
    setTimeout(() => {
      this.displayPosition = this.position;
    }, 2000);
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

  onPhotosAdded(photos: Photo[]): void {
    this.photos = photos;
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

  async save(): Promise<void> {
    if (this.formGroup.invalid) {
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
        name: this.formGroup.value.title,
        type: 'waypoint',
        media: this.photos,
        nominatim: this.nominatim,
        uuid: generateUUID(),
        app_id: `${this._environmentSvc.appId}`,
        createdAt: dateNow,
        updatedAt: dateNow,
        form: this.formGroup.value,
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

  startAddPhotos(): void {
    addFormError(this.formGroup, {photo: true});
  }

  endAddPhotos(): void {
    removeFormError(this.formGroup, 'photo');
  }
}
