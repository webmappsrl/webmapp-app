import { Component, OnInit } from '@angular/core';
import { DownloadService } from 'src/app/services/download.service';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'app-tab-description',
  templateUrl: './tab-description.component.html',
  styleUrls: ['./tab-description.component.scss'],
})
export class TabDescriptionComponent implements OnInit {

  private cache:any = {};
 
  public sliderOptions: any = {
    slidesPerView: 1.3,
  };
  
  public route: IGeojsonFeature;  

  constructor(
    private _statusService: StatusService,
    private download : DownloadService
    ) { }

  ngOnInit() {
      this.route = this._statusService.route;
  }

  getImage(sizes) {
      let url = sizes['250x150'];
      if(!url){url =  sizes['225x100']}

      if (this.cache[url] && this.cache[url] != 'waiting') return this.cache[url]
      else {
        if (this.cache[url] !== 'waiting') {
          this.cache[url] = 'waiting';
          this.download.getB64img(url).then(val => {
            this.cache[url] = val;
          })
        }
      }
      return '';
    }

}
