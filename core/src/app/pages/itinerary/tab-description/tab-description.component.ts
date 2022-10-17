import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {IGeojsonProperties} from 'src/app/types/model';
import {IMapRootState} from 'src/app/store/map/map';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {mapCurrentTrackProperties} from 'src/app/store/map/map.selector';

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

  constructor(private _storeMap: Store<IMapRootState>, public domSanitazer: DomSanitizer) {}
}
