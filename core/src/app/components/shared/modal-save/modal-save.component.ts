import {LineString} from 'geojson';
import {Observable, from, of} from 'rxjs';
import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Photo} from '@capacitor/camera';
import {ActionSheetController, AlertController, IonContent, ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {DeviceService} from '@wm-core/services/device.service';
import {syncUgcTracks} from '@wm-core/store/features/ugc/ugc.actions';
import {generateUUID} from '@wm-core/utils/localForage';
import {WmFeature} from '@wm-types/feature';
import {switchMap, take} from 'rxjs/operators';
import {ModalSuccessComponent} from 'src/app/components/modal-success/modal-success.component';
import {activities} from 'src/app/constants/activities';
import {ESuccessType} from 'src/app/types/esuccess.enum';
import {LangService} from '@wm-core/localization/lang.service';
import {EnvironmentService} from '@wm-core/services/environment.service';
import {addFormError, removeFormError} from '@wm-core/utils/form';
import {BaseSaveComponent} from 'src/app/components/base-save.component.ts/base-save.component';
import {Point} from 'geojson';
import {syncUgcPois} from '@wm-core/store/features/ugc/ugc.actions';
import {saveUgc} from '@wm-core/utils/localForage';

@Component({
  selector: 'webmapp-modal-save',
  templateUrl: './modal-save.component.html',
  styleUrls: ['./modal-save.component.scss'],
})
export class ModalSaveComponent extends BaseSaveComponent implements OnInit {
  @ViewChild(IonContent, {static: false}) ionContent: IonContent;
  @ViewChild('formContainer', {static: false}) formContainer: ElementRef;

  acquisitionFORM$: Observable<any[]>;
  public activities = activities;
  public activity: string;
  public description: string;
  public isValidArray: boolean[] = [false, false];
  public photos: Photo[] = [];
  public recordedFeature: WmFeature<LineString>;
  public title: string;
  public track: WmFeature<LineString>;
  public validate = false;
  public isWaypoint: boolean = false;
  public position: {latitude: number; longitude: number};
  public nominatim: any;

  constructor(
    private _modalCtrl: ModalController,
    private _environmentSvc: EnvironmentService,
    private _deviceSvc: DeviceService,
    private _langSvc: LangService,
    private _alertController: AlertController,
    protected _cdr: ChangeDetectorRef,
    private _actionSheetCtrl: ActionSheetController,
    private _store: Store<any>,
  ) {
    super(_cdr);
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

  photosChanged(photos: Photo[]): void {
    this.photos = photos;
  }

  async close(): Promise<void> {
    if (this.isWaypoint) {
      await this._modalCtrl.dismiss();
      return;
    }
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
    if (this.isWaypoint) {
      await this._modalCtrl.dismiss();
      return;
    }
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

  async openModalSuccess(feature: {
    track?: WmFeature<LineString>;
    waypoint?: WmFeature<Point>;
  }): Promise<void> {
    const successType = feature.waypoint ? ESuccessType.WAYPOINT : ESuccessType.TRACK;
    const modaSuccess = await this._modalCtrl.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: successType,
        track: feature.track,
        waypoint: feature.waypoint,
      },
    });
    await modaSuccess.present();
    await modaSuccess.onDidDismiss();
  }

  save(): void {
    if (this.formGroup.invalid) {
      return;
    }
    const dateNow = new Date();
    const geometry: Point | LineString = this.isWaypoint
      ? {type: 'Point', coordinates: [this.position.longitude, this.position.latitude]}
      : {type: 'LineString', coordinates: this.recordedFeature.geometry.coordinates};
    const properties = {...(this.recordedFeature?.properties ?? {})};
    const additionalProperties = {
      name: this.formGroup.value.title,
      form: this.formGroup.value,
      media: this.photos,
      uuid: generateUUID(),
      app_id: `${this._environmentSvc.appId}`,
      createdAt: dateNow,
      updatedAt: dateNow,
      device: null, // TODO: Add device info in row 244 :  ugcFeature.properties.device = device;
      ...(this.isWaypoint
        ? {nominatim: this.nominatim}
        : {distanceFilter: +localStorage.getItem('wm-distance-filter') || 10}),
    };
    const ugcFeature: WmFeature<LineString | Point> = {
      type: 'Feature',
      geometry,
      properties: {...properties, ...additionalProperties},
    };
    from(this._deviceSvc.getInfo())
      .pipe(
        take(1),
        switchMap(device => {
          ugcFeature.properties.device = device;
          return from(saveUgc(ugcFeature));
        }),
        switchMap(_ => this.backToSuccess()),
        switchMap(_ =>
          this.openModalSuccess(
            this.isWaypoint
              ? {waypoint: ugcFeature as WmFeature<Point>}
              : {track: ugcFeature as WmFeature<LineString>},
          ),
        ),
        switchMap(_ =>
          from(this._modalCtrl.getTop()).pipe(
            switchMap(topModal => {
              if (topModal) {
                return from(this._modalCtrl.dismiss());
              } else {
                return of(null);
              }
            }),
          ),
        ),
      )
      .subscribe(() => {
        this._store.dispatch(this.isWaypoint ? syncUgcPois() : syncUgcTracks());
      });
  }

  setIsValid(idx: number, isValid: boolean): void {
    this.isValidArray[idx] = isValid;
  }
}
