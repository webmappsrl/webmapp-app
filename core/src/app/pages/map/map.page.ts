import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DEF_MAP_LOCATION_ZOOM } from 'src/app/constants/map';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { ILocation } from 'src/app/types/location';

@Component({
  selector: 'webmapp-page-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  constructor(
    private _navController: NavController,
    private _geolocationService: GeolocationService
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
}
