import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {EMapLocationState} from 'src/app/types/emap-location-state.enum';
import {GeolocationService} from 'src/app/services/geolocation.service';

@Component({
  selector: 'webmapp-btn-geolocation',
  templateUrl: './btn-geolocation.component.html',
  styleUrls: ['./btn-geolocation.component.scss'],
})
export class BtnGeolocationComponent implements OnInit {
  @Input('color') color: string = 'light';
  @Input('state') set stateSetter(state: EMapLocationState) {
    this.state = state;
    switch (this.state) {
      case EMapLocationState.OFF:
      case EMapLocationState.ACTIVE:
      default:
        this.iconClass = 'icon-outline-nav';
        break;
      case EMapLocationState.FOLLOW:
        this.iconClass = 'icon-fill-nav';
        break;
    }
  }
  @Output('btn-click') btnClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  public state: EMapLocationState = EMapLocationState.OFF;
  public iconClass: string = 'icon-outline-nav';

  constructor(private geolocationService: GeolocationService) {}

  ngOnInit() {}

  locate(event: MouseEvent) {
    this.geolocationService.start();
    this.btnClick.emit(event);
  }
}
