import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature } from 'src/app/types/model';
import { ISlopeChartHoverElements } from 'src/app/types/slope-chart';

@Component({
  selector: 'webmapp-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrls: ['./tab-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabDetailComponent implements OnInit {
  public route: IGeojsonFeature;
  @Output('slopeChartHover')
  slopeChartHover: EventEmitter<ISlopeChartHoverElements> = new EventEmitter<ISlopeChartHoverElements>();

  constructor(private _statusService: StatusService) {}

  ngOnInit() {
    this.route = this._statusService.route;
  }

  onLocationHover(event: ISlopeChartHoverElements) {
    this.slopeChartHover.emit(event);
  }
}
