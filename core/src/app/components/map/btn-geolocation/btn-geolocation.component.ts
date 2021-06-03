import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { EMapLocationState } from 'src/app/types/emap-location-state.enum';

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
        this.iconClass = 'webmapp-icon-nav-outline';
        break;
      case EMapLocationState.FOLLOW:
        this.iconClass = 'webmapp-icon-nav';
        break;
    }
  }
  @Output('btn-click') btnClick: EventEmitter<MouseEvent> =
    new EventEmitter<MouseEvent>();

  public state: EMapLocationState = EMapLocationState.OFF;
  public iconClass: string = 'webmapp-icon-nav-outline';

  constructor(private geolocationService: GeolocationService) {}

  ngOnInit() {}

  locate(event: MouseEvent) {
    this.geolocationService.start();
    this.btnClick.emit(event);
  }
}
