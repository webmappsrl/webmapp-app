import { Component, Input, OnInit } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation.service';

@Component({
  selector: 'webmapp-btn-geolocation',
  templateUrl: './btn-geolocation.component.html',
  styleUrls: ['./btn-geolocation.component.scss'],
})
export class BtnGeolocationComponent implements OnInit {

  @Input('color') color: string;

  constructor(
    private geolocationService: GeolocationService
  ) {

  }

  ngOnInit() {

  }

  locate() {
    this.geolocationService.start();
  }

}
