import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { ILocation } from 'selenium-webdriver';
import { CoinService } from 'src/app/services/coin.service';
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
    private _geoLocation: GeolocationService,
    private _navCtrl: NavController
  ) { }

  async ngOnInit() {
    this.mostViewedRoutes = await this._geoHubService.getMostViewedEcTracks();
    await this._geoLocation.start();
    this._geoLocation.onLocationChange.pipe(first()).subscribe(async (pos) => {
//       const pos2= {
//         longitude:11.045,
// latitude:42.65,
// timestamp:0,
// x:0,y:0,getLatLng:()=>{return[0,0]as [number,number]}
//       };
      this.nearRoutes = await this._geoHubService.getNearEcTracks(pos);      
    })
  }

  start() {    
    this._navCtrl.navigateForward('/map');
  }
}
