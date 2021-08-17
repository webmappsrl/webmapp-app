import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrls: ['./tab-detail.component.scss'],
})
export class TabDetailComponent implements OnInit {
  public route: IGeojsonFeature;

  constructor(
    private _statusService: StatusService) { }

  ngOnInit() {
      this.route = this._statusService.route;
      console.log('------- ~ file: tab-detail.component.ts ~ line 19 ~ TabDetailComponent ~ ngOnInit ~ this.route', this.route);
  }

}
