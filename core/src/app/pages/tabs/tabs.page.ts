import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { StatusService } from 'src/app/services/status.service';
import { setCurrentLayer } from 'src/app/store/UI/UI.actions';
import { IUIRootState } from 'src/app/store/UI/UI.reducer';


@Component({
  selector: 'webmapp-page-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  constructor(
    private _statusService : StatusService,
    private _storeUi:  Store<IUIRootState>,
  ) {}

  isBarHidden(){
    return this._statusService.isSelectedMapTrack;
  }

  initLayer() {
    console.log('ciao')
    this._storeUi.dispatch(setCurrentLayer({currentLayer: null}));
  }
}
