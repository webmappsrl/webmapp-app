import {Component, ViewEncapsulation} from '@angular/core';
import {Platform} from '@ionic/angular';
import {filter, take} from 'rxjs/operators';

import {DownloadService} from './services/download.service';
import {GEOHUB_SAVING_TRY_INTERVAL} from './constants/geohub';
import {GoogleAnalytics} from '@ionic-native/google-analytics/ngx';
import {IConfRootState} from './store/conf/conf.reducer';
import {INetworkRootState} from './store/network/netwotk.reducer';
import {LanguagesService} from './services/languages.service';
import {Router} from '@angular/router';
import {SaveService} from './services/save.service';
import {SplashScreen} from '@capacitor/splash-screen';
import {StatusService} from './services/status.service';
import {Store} from '@ngrx/store';
import {confMAP} from './store/conf/conf.selector';
import {environment} from 'src/environments/environment';
import {loadConf} from './store/conf/conf.actions';
import {loadPois} from './store/pois/pois.actions';
import {startNetworkMonitoring} from './store/network/network.actions';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  public image_gallery: any[];
  public photoIndex: number = 0;
  public showingPhotos = false;

  constructor(
    private _languagesService: LanguagesService,
    private _platform: Platform,
    private _googleAnalytics: GoogleAnalytics,
    private _downloadService: DownloadService,
    private router: Router,
    private status: StatusService,
    private saveService: SaveService,
    private _storeConf: Store<IConfRootState>,
    private _storeNetwork: Store<INetworkRootState>,
  ) {
    this._languagesService.initialize();
    this._storeConf.dispatch(loadConf());
    this._storeNetwork.dispatch(startNetworkMonitoring());

    this._storeConf
      .select(confMAP)
      .pipe(
        filter(p => p != null),
        take(2),
      )
      .subscribe(c => {
        if (c != null && c.pois != null && c.pois.apppoisApiLayer == true) {
          this._storeConf.dispatch(loadPois());
        }
      });
    this._platform.ready().then(
      () => {
        this.saveGeneratedContentsNowAndInterval();
        this.router.navigate(['home']);
        SplashScreen.hide();
      },
      err => {
        SplashScreen.hide();
      },
    );

    this._downloadService.init();

    this._googleAnalytics
      .startTrackerWithId(environment.analyticsId)
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
    });
  }

  closePhoto() {
    this.showingPhotos = false;
  }

  isRecording() {}

  /**
   * @description
   * This function returns a string based on the current URL.
   * It takes the URL and parses it into a tree structure. If the tree has a root with children,
   * it takes the path of the first segment of the primary child.
   * Depending on what this path is, it returns one of four strings:
   * 'none', 'high', 'middle', or 'low'. If none of these conditions are met, it returns 'low' by default.
   * @returns {*}
   * @memberof AppComponent
   */
  recBtnPosition() {
    const tree = this.router.parseUrl(this.router.url);
    if (tree?.root?.children && tree.root.children['primary']) {
      const url = tree.root.children['primary'].segments[0].path;
      switch (url) {
        case 'register':
          return 'none';
        case 'route':
          return this.status.showingRouteDetails ? 'high' : 'middle';
        case 'map':
          return this.status.showingMapResults ? 'middlehigh' : 'low';
      }
    }
    return 'low';
  }

  recordingClick(ev) {}

  /**
   * @description
   * This function is used to save unsaved contents.
   * It uses the saveService object to upload the unsaved contents.
   * The setInterval() method is used to call the uploadUnsavedContents() method at a regular interval,
   * which is specified by the GEOHUB_SAVING_TRY_INTERVAL constant.
   * The setTimeout() method is used to call the uploadUnsavedContents() method after 2000 milliseconds (2 seconds).
   * @memberof AppComponent
   */
  saveGeneratedContentsNowAndInterval() {
    setInterval(() => {
      this.saveService.uploadUnsavedContents();
    }, GEOHUB_SAVING_TRY_INTERVAL);
    setTimeout(() => {
      this.saveService.uploadUnsavedContents();
    }, 2000);
  }
}
