import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {IMapRootState} from 'src/app/store/map/map';
import {mapCurrentTrackProperties} from 'src/app/store/map/map.selector';
import {IGeojsonFeature, IGeojsonProperties} from 'src/app/types/model';
import {ISlopeChartHoverElements} from 'src/app/types/slope-chart';

@Component({
  selector: 'webmapp-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrls: ['./tab-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabDetailComponent {
  public route: IGeojsonFeature;
  currentTrackProperties$: Observable<IGeojsonProperties> =
    this._storeMap.select(mapCurrentTrackProperties);
  @Output('slopeChartHover')
  slopeChartHover: EventEmitter<ISlopeChartHoverElements> = new EventEmitter<ISlopeChartHoverElements>();

  constructor(private _storeMap: Store<IMapRootState>) {}

  onLocationHover(event: ISlopeChartHoverElements) {
    this.slopeChartHover.emit(event);
  }
}
