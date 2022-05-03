import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {IMapRootState} from 'src/app/store/map/map';
import {mapCurrentTrackProperties} from 'src/app/store/map/map.selector';
import {IGeojsonProperties} from 'src/app/types/model';

@Component({
  selector: 'webmapp-tab-description',
  templateUrl: './tab-description.component.html',
  styleUrls: ['./tab-description.component.scss'],
})
export class TabDescriptionComponent {
  currentTrackProperties$: Observable<IGeojsonProperties> =
    this._storeMap.select(mapCurrentTrackProperties);
  public sliderOptions: any = {
    slidesPerView: 1.3,
  };

  constructor(private _storeMap: Store<IMapRootState>) {}
}
