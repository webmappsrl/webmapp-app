import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {StatusService} from 'src/app/services/status.service';
import {IMapRootState} from 'src/app/store/map/map';
import {setCurrentLayer, setCurrentTrackId} from 'src/app/store/map/map.actions';

@Component({
  selector: 'webmapp-page-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  constructor(private _statusService: StatusService, private _storeMap: Store<IMapRootState>) {}

  isBarHidden() {
    return this._statusService.isSelectedMapTrack;
  }

  reset() {
    this._storeMap.dispatch(setCurrentLayer({currentLayer: null}));
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: null}));
  }
}
