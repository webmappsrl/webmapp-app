import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GeolocationService } from 'src/app/services/geolocation.service';

@Component({
  selector: 'webmapp-page-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  constructor(
    private _navController: NavController,
    private _geolocationSErvice :GeolocationService
  ) { }

  ngOnInit() {
  }

  recordingClick(ev) {
    this._navController.navigateForward('register');
  }

  isRecording(){
    return this._geolocationSErvice.recording;
  }

}
