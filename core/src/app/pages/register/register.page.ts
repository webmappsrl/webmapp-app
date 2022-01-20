import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { ESuccessType } from '../../types/esuccess.enum';
import { ModalSaveComponent } from './modal-save/modal-save.component';
import { ModalSuccessComponent } from '../../components/modal-success/modal-success.component';
import { SaveService } from 'src/app/services/save.service';
import { ITrack } from 'src/app/types/track';
import { DEF_MAP_LOCATION_ZOOM } from 'src/app/constants/map';

@Component({
  selector: 'webmapp-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {
  @ViewChild('map') map: MapComponent;

  public opacity: number = 0;
  public time: { hours: number; minutes: number; seconds: number } = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  public actualSpeed: number = 0;
  public averageSpeed: number = 0;
  public length: number = 0;

  public isRecording = false;
  public isPaused = false;

  public location: number[];

  private _timerInterval: any;

  constructor(
    private _geolocationService: GeolocationService,
    private _geoutilsService: GeoutilsService,
    private _navCtrl: NavController,
    private _translate: TranslateService,
    private _alertController: AlertController,
    private _modalController: ModalController,
    private _saveService: SaveService
  ) { }

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

  checkRecording() {
    if (this._geolocationService.recording) {
      this.isRecording = true;
      this.isPaused = this._geolocationService.paused;
      this.opacity = 1;
      this._timerInterval = setInterval(() => {
        this.time = GeoutilsService.formatTime(
          this._geolocationService.recordTime / 1000
        );
      }, 1000);
      setTimeout(() => {
        this.updateMap();
      }, 100);
    }
  }

  recordMove(ev) {
    this.opacity = ev;
  }

  updateMap() {
    if (this.isRecording && this._geolocationService.recordedFeature) {
      this.map.drawTrack(this._geolocationService.recordedFeature);
      this.length = this._geoutilsService.getLength(
        this._geolocationService.recordedFeature
      );
      // const timeSeconds = this._geoutilsService.getTime(
      //   this._geolocationService.recordedFeature
      // );
      // this.time = this.formatTime(timeSeconds);
      this.actualSpeed = this._geoutilsService.getCurrentSpeed(
        this._geolocationService.recordedFeature
      );
      this.averageSpeed = this._geoutilsService.getAverageSpeed(
        this._geolocationService.recordedFeature
      );
    }
  }

  /**
   * Calculate the time values for seconds, minutes and hours given a time in seconds
   *
   * @param timeSeconds the time in seconds
   *
   * @returns
   */

  async recordStart(event: boolean) {
    await this._geolocationService.startRecording();
    this.checkRecording();
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
          handler: () => { },
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
    try {
      clearInterval(this._timerInterval);
    } catch (e) { }
    await this._geolocationService.pauseRecording();



    const modal = await this._modalController.create({
      component: ModalSaveComponent,
    });
    await modal.present();
    const res = await modal.onDidDismiss();

    if (!res.data.dismissed && res.data.save) {
      const geojson = await this._geolocationService.stopRecording();
      const track: ITrack = Object.assign(
        {
          geojson,
        },
        res.data.trackData
      );
      const saved = await this._saveService.saveTrack(track);
      await this.openModalSuccess(saved);
      this.backToMap();
    } else if (!res.data.dismissed) {
      await this._geolocationService.stopRecording();
      this.backToMap();
    }


  }



  async resume(event: MouseEvent) {
    await this._geolocationService.resumeRecording();
    this.isPaused = false;
  }

  async pause(event: MouseEvent) {
    await this._geolocationService.pauseRecording();
    this.isPaused = true;
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

  background(ev) {
    this.backToMap();
  }

  backToMap() {
    this._navCtrl.navigateForward('map');
  }

  ngOnDestroy() {
    try {
      clearInterval(this._timerInterval);
    } catch (e) { }
  }
}
