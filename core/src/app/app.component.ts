import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Platform} from '@ionic/angular';
import {filter, take} from 'rxjs/operators';

import {Router} from '@angular/router';
import {SplashScreen} from '@capacitor/splash-screen';
import {GoogleAnalytics} from '@ionic-native/google-analytics/ngx';
import {Store} from '@ngrx/store';
import {appEN} from 'src/assets/i18n/en';
import {appFR} from 'src/assets/i18n/fr';
import {appIT} from 'src/assets/i18n/it';
import {environment} from 'src/environments/environment';
import {GEOHUB_SAVING_TRY_INTERVAL} from './constants/geohub';
import {DownloadService} from './services/download.service';
import {SaveService} from './services/save.service';
import {StatusService} from './services/status.service';
import {LangService} from './shared/wm-core/localization/lang.service';
import {loadConf} from './store/conf/conf.actions';
import {IConfRootState} from './store/conf/conf.reducer';
import {confLANGUAGES, confMAP, confTHEMEVariables} from './store/conf/conf.selector';
import {startNetworkMonitoring} from './store/network/network.actions';
import {INetworkRootState} from './store/network/netwotk.reducer';
import {loadPois} from './store/pois/pois.actions';
import {DOCUMENT} from '@angular/common';
import {Observable} from 'rxjs';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [LangService],
})
export class AppComponent {
  confTHEMEVariables$: Observable<any> = this._storeConf.select(confTHEMEVariables);
  public image_gallery: any[];
  public photoIndex: number = 0;
  public showingPhotos = false;

  constructor(
    private _platform: Platform,
    private _googleAnalytics: GoogleAnalytics,
    private _downloadService: DownloadService,
    private router: Router,
    private status: StatusService,
    private saveService: SaveService,
    private _storeConf: Store<IConfRootState>,
    private _storeNetwork: Store<INetworkRootState>,
    private _langService: LangService,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    this._storeConf.dispatch(loadConf());
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
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
    this._storeConf
      .select(confLANGUAGES)
      .pipe(
        filter(p => p != null),
        take(2),
      )
      .subscribe(l => {
        this._langService.setTranslation('it', appIT, true);
        this._langService.setTranslation('en', appEN, true);
        this._langService.setTranslation('fr', appFR, true);
        this._langService.initLang(l.default);
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

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    console.log(css);
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }
}
