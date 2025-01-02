import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {IonSlides, ModalController, NavController} from '@ionic/angular';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {ESuccessType} from '../../types/esuccess.enum';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {confMAP} from '@wm-core/store/conf/conf.selector';
import {
  LineStringProperties,
  Media,
  MediaProperties,
  PointProperties,
  WmFeature,
} from '@wm-types/feature';
import {Point, LineString} from 'geojson';
@Component({
  selector: 'webmapp-modal-registersuccess',
  templateUrl: './modal-success.component.html',
  styleUrls: ['./modal-success.component.scss'],
})
export class ModalSuccessComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private MINSCATTER = 30;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private PHOTOSCATTER = 100;

  @Input() photos: WmFeature<Media, MediaProperties>[];
  @Input() track: WmFeature<LineString, LineStringProperties>;
  @Input() type: ESuccessType;
  @Input() waypoint: WmFeature<Point, PointProperties>;
  @ViewChild('slider') slider: IonSlides;

  confMap$: Observable<any> = this._store.select(confMAP);
  isPhotos = false;
  isTrack = false;
  isWaypoint = false;
  sliderOptions: any = {
    slidesPerView: 2.5,
  };
  today = new Date();
  topValues = [];
  trackAvgSpeed: number = 0;
  trackDate;
  trackSlope: number = 0;
  trackTime = {hours: 0, minutes: 0, seconds: 0};
  trackTopSpeed: number = 0;
  trackodo: number = 0;

  constructor(
    private _modalController: ModalController,
    private _geoUtils: GeoutilsService,
    private _navController: NavController,
    private _store: Store,
  ) {}

  ngOnInit() {
    switch (this.type) {
      case ESuccessType.TRACK:
        this.trackDate = this._geoUtils.getDate(this.track);
        this.trackodo = this._geoUtils.getLength(this.track);
        this.trackSlope = this._geoUtils.getSlope(this.track);
        this.trackAvgSpeed = this._geoUtils.getAverageSpeed(this.track);
        this.trackTopSpeed = this._geoUtils.getTopSpeed(this.track);
        this.trackTime = GeoutilsService.formatTime(this._geoUtils.getTime(this.track));
        this.isTrack = true;
        break;
      case ESuccessType.PHOTOS:
        this.isPhotos = true;
        this.photos.forEach(x => {
          let scatter = Math.random() * this.PHOTOSCATTER;
          if (this.topValues.length) {
            while (
              Math.abs(scatter - this.topValues[this.topValues.length - 1]) < this.MINSCATTER
            ) {
              scatter = Math.random() * this.PHOTOSCATTER;
            }
          }
          this.topValues.push(scatter);
        });

        setTimeout(() => {
          //need for slider to use correct slides per view
          if (this.slider) {
            this.slider.update();
          }
        }, 100);

        break;
      case ESuccessType.WAYPOINT:
        this.isWaypoint = true;
        break;
    }
  }

  async close(): Promise<boolean> {
    return this._modalController.dismiss({
      dismissed: true,
    });
  }

  async gotoPhotos(): Promise<void> {
    await this.close();
    this._navController.navigateForward('photolist');
  }

  async openTrack(track: WmFeature<LineString>): Promise<void> {
    await this.close();

    const navigationExtras: NavigationOptions = {
      queryParams: {
        track: track.properties.uuid ?? -1,
      },
    };
    this._navController.navigateForward('trackdetail', navigationExtras);
  }

  async openWaypoint(waypoint: WmFeature<Point>): Promise<void> {
    await this.close();

    const navigationExtras: NavigationOptions = {
      queryParams: {
        waypoint: waypoint.properties.uuid ?? -1,
      },
    };
    this._navController.navigateForward('waypointdetail', navigationExtras);
  }
}
