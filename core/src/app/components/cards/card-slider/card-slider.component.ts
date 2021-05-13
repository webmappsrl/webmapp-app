import { Component, Input, OnInit } from '@angular/core';
import { DeviceService } from 'src/app/services/base/device.service';

@Component({
  selector: 'webmapp-card-slider',
  templateUrl: './card-slider.component.html',
  styleUrls: ['./card-slider.component.scss'],
})
export class CardSliderComponent implements OnInit {
  @Input('title') title: string;
  @Input('data') data: Array<string>;

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

  ngOnInit() {}
}
