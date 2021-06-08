import { Component, OnInit, ViewChild } from '@angular/core';
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

  public status: string = "in movimento";
  public time: { hour: number; minute: number; second: number } = { hour: 0, minute: 0, second: 0 };
  public actualSpeed: number = 0;
  public averageSpeed: number = 0;
  public odo: number = 0;

  // public track;

  public isRecording = false;
  public isPaused = false;

  private timeseparator = ':';

  constructor(
    private geolocation: GeolocationService,
    private geoUtils: GeoutilsService
  ) { }

  ngOnInit() {
    this.geolocation.onLocationChange.subscribe(loc => {
      this.updateMap(loc);
    });
  }

  recordMove(ev) {
    this.opacity = ev;

  }

  updateMap(loc: ILocation) {
    if (this.isRecording && !this.isPaused) {
      this.map.drawTrack(this.geolocation.recordedFeature);
      this.odo = this.geoUtils.getOdo(this.geolocation.recordedFeature);
      const timeSeconds = this.geoUtils.getTime(this.geolocation.recordedFeature);
      this.time = this.formatTime(timeSeconds);
      this.actualSpeed = this.geoUtils.getCurrentSpeed(this.geolocation.recordedFeature);
      this.averageSpeed = this.geoUtils.getAverageSpeed(this.geolocation.recordedFeature);
    }
  }

  formatTime(timeSeconds) {
    return {
      hour: Math.floor(timeSeconds / 3600),
      minute: Math.floor(((timeSeconds - (timeSeconds % 60)) % 3600)),
      second: Math.floor((timeSeconds % 60))
    };

  }

  async recordStart(ev) {
    await this.geolocation.startRecording();
    this.isRecording = true;
  }

  async stop(ev) {

  }

  async resume(ev) {
    await this.geolocation.resumeRecording();
    this.isPaused = false;

  }

  async pause(ev) {
    await this.geolocation.pauseRecording();
    this.isPaused = true;
  }


}
