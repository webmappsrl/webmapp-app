import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Platform} from '@ionic/angular';
import {debounceTime, filter, switchMap, take} from 'rxjs/operators';

import {Router} from '@angular/router';
import {SplashScreen} from '@capacitor/splash-screen';
import {Store} from '@ngrx/store';
import {appEN} from 'src/assets/i18n/en';
import {appFR} from 'src/assets/i18n/fr';
import {appIT} from 'src/assets/i18n/it';
import {GEOHUB_SAVING_TRY_INTERVAL} from './constants/geohub';
import {DownloadService} from './services/download.service';
import {SaveService} from './services/save.service';
import {StatusService} from './services/status.service';
import {LangService} from './shared/wm-core/localization/lang.service';
import {startNetworkMonitoring} from './store/network/network.actions';
import {INetworkRootState} from './store/network/netwotk.reducer';
import {DOCUMENT} from '@angular/common';
import {Observable} from 'rxjs';
import {
  confLANGUAGES,
  confMAP,
  confTHEMEVariables,
} from './shared/wm-core/store/conf/conf.selector';
import {loadConf} from './shared/wm-core/store/conf/conf.actions';
import {loadPois, query} from './shared/wm-core/store/api/api.actions';
import {online} from './store/network/network.selector';
import {AuthService} from './services/auth.service';
import {poisInitFeatureCollection} from './shared/wm-core/store/api/api.selector';
import {WmLoadingService} from './shared/wm-core/services/loading.service';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [LangService],
})
export class AppComponent {
  confTHEMEVariables$: Observable<any> = this._store.select(confTHEMEVariables);
  public image_gallery: any[];
  public photoIndex: number = 0;
  public showingPhotos = false;

  constructor(
    private _platform: Platform,
    private _downloadService: DownloadService,
    private router: Router,
    private status: StatusService,
    private saveService: SaveService,
    private _store: Store<any>,
    private _storeNetwork: Store<INetworkRootState>,
    private _langService: LangService,
    @Inject(DOCUMENT) private _document: Document,
    private _authSvc: AuthService,
    private _loadingSvc: WmLoadingService,
  ) {
    this._store.dispatch(loadConf());
    this._store.dispatch(query({init: true}));
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
    this._storeNetwork.dispatch(startNetworkMonitoring());
    this._store
      .select(poisInitFeatureCollection)
      .pipe(
        filter(f => f),
        take(1),
      )
      .subscribe(() => this._loadingSvc.close('Loading pois...'));
    this._store
      .select(confMAP)
      .pipe(
        filter(p => p != null),
        take(1),
      )
      .subscribe(c => {
        if (c != null && c.pois != null && c.pois.apppoisApiLayer == true) {
          this._store.dispatch(loadPois());
        }
      });
    this._store
      .select(confLANGUAGES)
      .pipe(
        filter(p => p != null),
        take(1),
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

    this._store
      .select(online)
      .pipe(
        filter(o => o),
        switchMap(_ => this._authSvc.isLoggedIn$),
        filter(l => l),
        debounceTime(2000),
      )
      .subscribe(_ => {
        this.saveService.uploadUnsavedContents();
      });
    this._downloadService.init();

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
  }

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }
}
