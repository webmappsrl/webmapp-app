import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { PhotoItem } from 'src/app/services/photo.service';
import { SuccessType } from '../../types/success.enum';
import { Track } from 'src/app/types/track.d.';
import { WaypointSave } from 'src/app/types/waypoint';

@Component({
  selector: 'webmapp-modal-registersuccess',
  templateUrl: './modal-success.component.html',
  styleUrls: ['./modal-success.component.scss'],
})
export class ModalSuccessComponent implements OnInit {


  @ViewChild('slider') slider: IonSlides;

  @Input() track: Track;
  @Input() type: SuccessType;
  @Input() photos: PhotoItem[];
  @Input() waypoint: WaypointSave;

  public isTrack = false;
  public isPhotos = false;
  public isWaypoint = false;

  public today = new Date();

  public topValues = [];


  public sliderOptions: any = {
    slidesPerView: 2.5,
  };

  trackDate;
  trackodo: number = 0;
  trackSlope: number = 0;
  trackAvgSpeed: number = 0;
  trackTopSpeed: number = 0;
  trackTime = { hours: 0, minutes: 0, seconds: 0 };

  private PHOTOSCATTER = 100;
  private MINSCATTER = 30;

  constructor(
    private modalController: ModalController,
    private geoUtils: GeoutilsService,
  ) { }

  ngOnInit() {
    switch (this.type) {
      case SuccessType.TRACK:
        this.trackDate = this.geoUtils.getDate(this.track.geojson);
        this.trackodo = this.geoUtils.getLength(this.track.geojson);
        this.trackSlope = this.geoUtils.getSlope(this.track.geojson);
        this.trackAvgSpeed = this.geoUtils.getAverageSpeed(this.track.geojson);
        this.trackTopSpeed = this.geoUtils.getTopSpeed(this.track.geojson);
        this.trackTime = GeoutilsService.formatTime(this.geoUtils.getTime(this.track.geojson));
        this.isTrack = true;
        break;
      case SuccessType.PHOTOS:
        this.isPhotos = true;
        this.photos.forEach(x => {
          let scatter = Math.random() * this.PHOTOSCATTER;
          if (this.topValues.length) {
            while (Math.abs(scatter - this.topValues[this.topValues.length - 1]) < this.MINSCATTER) {
              scatter = Math.random() * this.PHOTOSCATTER;
            }
          }
          this.topValues.push(scatter);
        });

        setTimeout(() => { //need for slider to use correct slides per view
          this.slider.update();
        }, 100);

        break;
        case SuccessType.WAYPOINT:
          this.isWaypoint = true;
          break;
    }
  }

  close() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

}
