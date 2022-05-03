import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {IMapRootState} from 'src/app/store/map/map';
import {mapCurrentRelatedPoi} from 'src/app/store/map/map.selector';

@Component({
  selector: 'webmapp-tab-poi',
  templateUrl: './tab-poi.component.html',
  styleUrls: ['./tab-poi.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPoiComponent {
  currentRelatedPoi$: Observable<any[]> = this._storeMap.select(mapCurrentRelatedPoi);
  constructor(private _storeMap: Store<IMapRootState>) {}
}
