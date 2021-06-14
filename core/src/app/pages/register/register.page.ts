import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { MapComponent } from 'src/app/components/map/map/map.component';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { ILocation } from 'src/app/types/location';

@Component({
  selector: 'webmapp-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  @ViewChild('map') map: MapComponent;

  public opacity: number = 0;
  public time: { hours: number; minutes: number; seconds: number } = { hours: 0, minutes: 0, seconds: 0 }
  public actualSpeed: number = 0;
  public averageSpeed: number = 0;
  public length: number = 0;

  public isRecording = false;
  public isPaused = false;

  private _timerInterval: any;

  constructor(
    private _geolocationService: GeolocationService,
    private _geoutilsService: GeoutilsService,
    private _navCtrl: NavController
  ) {

  }

  ngOnInit() {
    this._geolocationService.onLocationChange.subscribe((loc) => {
      this.updateMap(loc);
    });
  }

  recordMove(ev) {
    this.opacity = ev;
  }

  updateMap(loc: ILocation) {
    if (this.isRecording && !this.isPaused) {
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
  formatTime(timeSeconds: number) {
    return {
      seconds: Math.floor(timeSeconds % 60),
      minutes: Math.floor(timeSeconds / 60) % 60,
      hours: Math.floor(timeSeconds / 3600),
    };
  }

  async recordStart(event: boolean) {
    await this._geolocationService.startRecording();
    this._timerInterval = setInterval(() => {
      this.time = this.formatTime(this._geolocationService.recordTime / 1000);
    }, 1000);

    this.isRecording = true;
  }

  async stop(event: MouseEvent) {
    try {
      clearInterval(this._timerInterval);
    } catch (e) { }

    await this._geolocationService.stopRecording();
    this.backToMap();

  }

  async resume(event: MouseEvent) {
    await this._geolocationService.resumeRecording();
    this.isPaused = false;
  }

  async pause(event: MouseEvent) {
    await this._geolocationService.pauseRecording();
    this.isPaused = true;
  }

  background(ev) {
    this.backToMap();
  }

  backToMap() {
    this._navCtrl.navigateBack('map');
  }
}
