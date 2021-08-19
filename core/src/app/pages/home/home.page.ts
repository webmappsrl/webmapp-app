import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { GeohubService } from 'src/app/services/geohub.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public mostViewedRoutes: Array<IGeojsonFeature>;
  public nearRoutes: Array<IGeojsonFeature>;
  constructor(
    private _geoHubService: GeohubService,
    private _geoLocation: GeolocationService
  ) { }

  async ngOnInit() {
    this.mostViewedRoutes = await this._geoHubService.getMostViewedEcTracks();
    await this._geoLocation.start();
    this._geoLocation.onLocationChange.pipe(first()).subscribe(async (pos) => {      
      this.nearRoutes = await this._geoHubService.getNearEcTracks(pos);      
    })
  }
}
