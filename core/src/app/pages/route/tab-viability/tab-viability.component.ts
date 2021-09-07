import { Component, OnInit } from '@angular/core';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'app-tab-viability',
  templateUrl: './tab-viability.component.html',
  styleUrls: ['./tab-viability.component.scss'],
})
export class TabViabilityComponent implements OnInit {

  public sliderOptions: any = {
    slidesPerView: 4,
  };

  public route: IGeojsonFeature;  

  constructor(
    private _statusService: StatusService) { }

  ngOnInit() {
      this.route = this._statusService.route;
  }

}
