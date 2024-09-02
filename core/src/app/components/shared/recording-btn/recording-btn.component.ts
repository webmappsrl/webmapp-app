import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { GeolocationService } from 'wm-core/services/geolocation.service';

@Component({
  selector: 'webmapp-recording-btn',
  templateUrl: './recording-btn.component.html',
  styleUrls: ['./recording-btn.component.scss'],
})
export class RecordingBtnComponent implements OnInit {

  @Output('btnClick') btnClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  public time: { hours: number; minutes: number; seconds: number } = { hours: 0, minutes: 0, seconds: 0 };


  constructor(
    private _geolocationService: GeolocationService
  ) { }

  ngOnInit() {
    setInterval(() => {
      this.time = GeoutilsService.formatTime(this._geolocationService.recordTime / 1000);
    }, 1000);
  }

  click(ev) {
    this.btnClick.emit(ev);
  }

}
