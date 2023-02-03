import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {AlertController, ModalController, NavController} from '@ionic/angular';
import {OldMapComponent} from 'src/app/components/map/old-map/map.component';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {ESuccessType} from '../../types/esuccess.enum';
import {ModalSaveComponent} from './modal-save/modal-save.component';
import {ModalSuccessComponent} from '../../components/modal-success/modal-success.component';
import {SaveService} from 'src/app/services/save.service';
import {ITrack} from 'src/app/types/track';
import {DEF_MAP_LOCATION_ZOOM} from 'src/app/constants/map';
import {LangService} from 'src/app/shared/wm-core/localization/lang.service';

@Component({
  selector: 'webmapp-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  providers: [LangService],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage implements OnInit, OnDestroy {
  private _timerInterval: any;

  @ViewChild('map') map: OldMapComponent;

  public actualSpeed: number = 0;
  public averageSpeed: number = 0;
  public isPaused = false;
  public isRecording = false;
  public isRegestering = true;
  public length: number = 0;
  public location: number[];
  public opacity: number = 0;
  public time: {hours: number; minutes: number; seconds: number} = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  constructor(
    private _geolocationService: GeolocationService,
    private _geoutilsService: GeoutilsService,
    private _navCtrl: NavController,
    private _translate: LangService,
    private _alertController: AlertController,
    private _modalController: ModalController,
    private _saveService: SaveService,
    private _cdr: ChangeDetectorRef,
  ) {}

  backToMap() {
    this._navCtrl.navigateForward('map');
    this.reset();
  }

  background(ev) {
    this.backToMap();
  }

  checkRecording() {
    if (this._geolocationService.recording) {
      this.isRecording = true;
      this.isPaused = this._geolocationService.paused;
      this.opacity = 1;
      this._timerInterval = setInterval(() => {
        this.time = GeoutilsService.formatTime(this._geolocationService.recordTime / 1000);
        this._cdr.detectChanges();
      }, 1000);
      setTimeout(() => {
        this.updateMap();
      }, 100);
    }
  }

  ngOnDestroy() {
    try {
      clearInterval(this._timerInterval);
    } catch (e) {}
  }

  ngOnInit() {
    if (this._geolocationService.location) {
      this.location = [
        this._geolocationService.location.longitude,
        this._geolocationService.location.latitude,
        DEF_MAP_LOCATION_ZOOM,
      ];
    }
    this._geolocationService.onLocationChange.subscribe(() => {
      this.updateMap();
    });

    this.checkRecording();
  }

  async openModalSuccess(track) {
    const modaSuccess = await this._modalController.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: ESuccessType.TRACK,
        track,
      },
    });
    await modaSuccess.present();
    // await modaSuccess.onDidDismiss();
  }

  async pause(event: MouseEvent) {
    await this._geolocationService.pauseRecording();
    this.isPaused = true;
  }

  recordMove(ev) {
    this.opacity = ev;
  }

  /**
   * Calculate the time values for seconds, minutes and hours given a time in seconds
   *
   * @param timeSeconds the time in seconds
   *
   * @returns
   */
  async recordStart(event: boolean) {
    this.isPaused = false;
    await this._geolocationService.startRecording();
    this.checkRecording();
  }

  reset() {
    this.isRegestering = true;
    this.opacity = 0;
    this.time = {hours: 0, minutes: 0, seconds: 0};
    this.actualSpeed = 0;
    this.averageSpeed = 0;
    this.length = 0;
    this.isRecording = false;
    this.isPaused = false;
    this._geolocationService.stopRecording();
  }

  async resume(event: MouseEvent) {
    await this._geolocationService.resumeRecording();
    this.isPaused = false;
  }

  async stop(event: MouseEvent) {
    this.stopRecording();
    return;
    const translation = await this._translate
      .get([
        'pages.register.modalconfirm.title',
        'pages.register.modalconfirm.text',
        'pages.register.modalconfirm.confirm',
        'pages.register.modalconfirm.cancel',
      ])
      .toPromise();

    const alert = await this._alertController.create({
      cssClass: 'my-custom-class',
      header: translation['pages.register.modalconfirm.title'],
      message: translation['pages.register.modalconfirm.text'],
      buttons: [
        {
          text: translation['pages.register.modalconfirm.cancel'],
          cssClass: 'webmapp-modalconfirm-btn',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: translation['pages.register.modalconfirm.confirm'],
          cssClass: 'webmapp-modalconfirm-btn',
          handler: () => {
            this.stopRecording();
          },
        },
      ],
    });

    await alert.present();
  }

  async stopRecording() {
    await this._geolocationService.pauseRecording();
    this.isPaused = true;

    const modal = await this._modalController.create({
      component: ModalSaveComponent,
    });
    await modal.present();
    const res = await modal.onDidDismiss();

    if (!res.data.dismissed && res.data.save) {
      try {
        clearInterval(this._timerInterval);
      } catch (e) {}
      const geojson = await this._geolocationService.stopRecording();
      const track: ITrack = Object.assign(
        {
          geojson,
        },
        res.data.trackData,
      );
      const saved = await this._saveService.saveTrack(track);
      await this.openModalSuccess(saved);
      this.backToMap();
    } else if (!res.data.dismissed) {
      await this._geolocationService.stopRecording();
      this.backToMap();
    }
  }

  updateMap() {
    if (this.isRecording && this._geolocationService.recordedFeature) {
      this.map.drawTrack(this._geolocationService.recordedFeature);
      this.length = this._geoutilsService.getLength(this._geolocationService.recordedFeature);
      // const timeSeconds = this._geoutilsService.getTime(
      //   this._geolocationService.recordedFeature
      // );
      // this.time = this.formatTime(timeSeconds);
      this.actualSpeed = this._geoutilsService.getCurrentSpeed(
        this._geolocationService.recordedFeature,
      );
      this.averageSpeed = this._geoutilsService.getAverageSpeed(
        this._geolocationService.recordedFeature,
      );
    }
  }
}
