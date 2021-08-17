import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { IPhotoItem } from 'src/app/services/photo.service';
import { ESuccessType } from '../../types/esuccess.enum';
import { ITrack } from 'src/app/types/track';
import { WaypointSave } from 'src/app/types/waypoint';

@Component({
  selector: 'webmapp-modal-registersuccess',
  templateUrl: './modal-success.component.html',
  styleUrls: ['./modal-success.component.scss'],
})
export class ModalSuccessComponent implements OnInit {
  @ViewChild('slider') slider: IonSlides;

  @Input() track: ITrack;
  @Input() type: ESuccessType;
  @Input() photos: IPhotoItem[];
  @Input() waypoint: WaypointSave;

  public isTrack = false;
  public isPhotos = false;
  public isWaypoint = false;

  public today = new Date();

  public topValues = [];

  public displayPosition;

  public sliderOptions: any = {
    slidesPerView: 2.5,
  };

  trackDate;
  trackodo: number = 0;
  trackSlope: number = 0;
  trackAvgSpeed: number = 0;
  trackTopSpeed: number = 0;
  trackTime = { hours: 0, minutes: 0, seconds: 0 };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private PHOTOSCATTER = 100;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private MINSCATTER = 30;

  constructor(
    private _modalController: ModalController,
    private _geoUtils: GeoutilsService
  ) {}

  ngOnInit() {
    switch (this.type) {
      case ESuccessType.TRACK:
        this.trackDate = this._geoUtils.getDate(this.track.geojson);
        this.trackodo = this._geoUtils.getLength(this.track.geojson);
        this.trackSlope = this._geoUtils.getSlope(this.track.geojson);
        this.trackAvgSpeed = this._geoUtils.getAverageSpeed(this.track.geojson);
        this.trackTopSpeed = this._geoUtils.getTopSpeed(this.track.geojson);
        this.trackTime = GeoutilsService.formatTime(
          this._geoUtils.getTime(this.track.geojson)
        );
        this.isTrack = true;
        break;
      case ESuccessType.PHOTOS:
        this.isPhotos = true;
        this.photos.forEach((x) => {
          let scatter = Math.random() * this.PHOTOSCATTER;
          if (this.topValues.length) {
            while (
              Math.abs(scatter - this.topValues[this.topValues.length - 1]) <
              this.MINSCATTER
            ) {
              scatter = Math.random() * this.PHOTOSCATTER;
            }
          }
          this.topValues.push(scatter);
        });

        setTimeout(() => {
          //need for slider to use correct slides per view
          this.slider.update();
        }, 100);

        break;
      case ESuccessType.WAYPOINT:
        this.isWaypoint = true;
        this.displayPosition = this.waypoint.displayPosition;
        console.log(
          '------- ~ file: modal-success.component.ts ~ line 85 ~ ModalSuccessComponent ~ ngOnInit ~ this.waypoint',
          this.waypoint
        );
        break;
    }
  }

  close() {
    this._modalController.dismiss({
      dismissed: true,
    });
  }
}
