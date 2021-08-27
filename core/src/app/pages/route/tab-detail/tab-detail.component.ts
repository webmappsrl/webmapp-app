import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StatusService } from 'src/app/services/status.service';
import { ILocation } from 'src/app/types/location';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrls: ['./tab-detail.component.scss'],
})
export class TabDetailComponent implements OnInit {
  public route: IGeojsonFeature;
  @Output('slopeChartHover') slopeChartHover: EventEmitter<ILocation> =
    new EventEmitter<ILocation>();

  constructor(private _statusService: StatusService) {}

  ngOnInit() {
    this.route = this._statusService.route;
    console.log(
      '------- ~ file: tab-detail.component.ts ~ line 19 ~ TabDetailComponent ~ ngOnInit ~ this.route',
      this.route
    );
  }

  onLocationHover(event: ILocation) {
    this.slopeChartHover.emit(event);
  }
}
