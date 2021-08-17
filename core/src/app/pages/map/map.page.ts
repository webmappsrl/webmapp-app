import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DEF_MAP_LOCATION_ZOOM } from 'src/app/constants/map';
import { GeohubService } from 'src/app/services/geohub.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { ILocation } from 'src/app/types/location';
import { IGeojsonCluster } from 'src/app/types/model';

@Component({
  selector: 'webmapp-page-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  public clusters: IGeojsonCluster[];

  constructor(
    private _navController: NavController,
    private _geolocationService: GeolocationService,
    private _geohubService: GeohubService
  ) {}

  ngOnInit() {}

  recordingClick(ev) {
    const location: ILocation = this._geolocationService.location;
    let state: any = {};

    if (location && location.latitude && location.longitude) {
      state = {
        startView: [
          location.longitude,
          location.latitude,
          DEF_MAP_LOCATION_ZOOM,
        ],
      };
    }
    this._navController.navigateForward('register', {
      state,
    });
  }

  isRecording() {
    return this._geolocationService.recording;
  }  

  async mapMove(moveEv){   
    this.clusters = await this._geohubService.search(moveEv)
  }
}
