import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {DeviceService} from '@wm-core/services/device.service';
import {Feature, LineString} from 'geojson';
@Component({
  standalone: false,
  selector: 'webmapp-card-slider',
  templateUrl: './card-slider.component.html',
  styleUrls: ['./card-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CardSliderComponent {
  @Input('data') data: Feature<LineString>[];
  @Input('nodata') nodata: string;
  @Input('showDistance') showDistance: boolean;
  @Input('title') title: string;

  public sliderOptions: any;

  constructor(private _deviceService: DeviceService) {
    this.sliderOptions = {
      initialSlide: 0,
      speed: 400,
      spaceBetween: 10,
      slidesOffsetAfter: 15,
      slidesOffsetBefore: 15,
      slidesPerView: this._deviceService.width / 235,
    };
  }
}
