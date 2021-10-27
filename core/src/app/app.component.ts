import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { LanguagesService } from './services/languages.service';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/base/storage.service';
import { DownloadService } from './services/download.service';
import { GeolocationService } from './services/geolocation.service';
import { ILocation } from './types/location';
import { DEF_MAP_LOCATION_ZOOM } from './constants/map';
import { Router } from '@angular/router';
import { StatusService } from './services/status.service';
import { SaveService } from './services/save.service';
import { GEOHUB_SAVING_TRY_INTERVAL } from './constants/geohub';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public showingPhotos = false;
  public image_gallery: any[];
  public photoIndex: number = 0;

  constructor(
    private _languagesService: LanguagesService,
    private _platform: Platform,
    private _googleAnalytics: GoogleAnalytics,
    private _authService: AuthService,
    private _downloadService: DownloadService,
    private _geolocationService: GeolocationService,
    private _navController: NavController,
    private router: Router,
    private status: StatusService,
    private saveService: SaveService
  ) {
    this._languagesService.initialize();

    this._platform.ready().then(
      () => {
        this.saveGeneratedContentsNowAndInterval();
        Plugins.SplashScreen.hide();
      },
      (err) => {
        Plugins.SplashScreen.hide();
      }
    );

    this._downloadService.init();

    this._googleAnalytics.startTrackerWithId(environment.analyticsId)
      .then(() => {
        console.log('Google analytics is ready now');
        this._googleAnalytics.trackView('test');
        // Tracker is ready
        // You can now track pages or set additional information such as AppVersion or UserId
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));

    this.status.showPhotos.subscribe(x => {
      this.showingPhotos = x.showingPhotos;
      this.image_gallery = x.image_gallery;
      this.photoIndex = x.photoIndex;
    })
  }

  closePhoto() {
    this.showingPhotos = false;
  }

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
  recBtnPosition() {
    const tree = this.router.parseUrl(this.router.url);
    if (tree?.root?.children && tree.root.children['primary']) {
      const url = tree.root.children['primary'].segments[0].path;
      switch (url) {
        case 'register':
          return 'none';
        case 'route':
          if (this.status.showingRouteDetails) {
            return 'high';
          }
          return 'middle';
        case 'map':
          if (this.status.showingMapResults) {
            return 'middlehigh';
          }
          return 'low';
      }
    }
    return 'low';
  }

  saveGeneratedContentsNowAndInterval() {
    setInterval(()=>{this.saveService.uploadUnsavedContents()}, GEOHUB_SAVING_TRY_INTERVAL)
    setTimeout(()=>{this.saveService.uploadUnsavedContents()},2000);
  }
}
