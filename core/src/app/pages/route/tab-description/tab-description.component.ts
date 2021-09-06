import { Component, OnInit } from '@angular/core';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'app-tab-description',
  templateUrl: './tab-description.component.html',
  styleUrls: ['./tab-description.component.scss'],
})
export class TabDescriptionComponent implements OnInit {
 
  public sliderOptions: any = {
    slidesPerView: 1.5,
  };
  
  public route: IGeojsonFeature;  

  constructor(
    private _statusService: StatusService) { }

  ngOnInit() {
      this.route = this._statusService.route;
  }

}
