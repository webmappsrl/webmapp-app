import { Component } from '@angular/core';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'webmapp-page-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  constructor(
    private _statusService : StatusService
  ) {}

  isBarHidden(){
    return this._statusService.isSelectedMapTrack;
  }
}
