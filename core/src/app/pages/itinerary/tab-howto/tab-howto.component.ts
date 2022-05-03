import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {IMapRootState} from 'src/app/store/map/map';
import {mapCurrentTrackProperties} from 'src/app/store/map/map.selector';
import {IGeojsonProperties} from 'src/app/types/model';

@Component({
  selector: 'webmapp-tab-howto',
  templateUrl: './tab-howto.component.html',
  styleUrls: ['./tab-howto.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabHowtoComponent {
  currentTrackProperties$: Observable<IGeojsonProperties> =
    this._storeMap.select(mapCurrentTrackProperties);
  constructor(private _storeMap: Store<IMapRootState>) {}
}
