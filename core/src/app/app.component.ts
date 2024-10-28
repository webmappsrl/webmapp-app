import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Platform} from '@ionic/angular';
import {debounceTime, filter, switchMap, take} from 'rxjs/operators';
import {KeepAwake} from '@capacitor-community/keep-awake';
import {Router} from '@angular/router';
import {SplashScreen} from '@capacitor/splash-screen';
import {select, Store} from '@ngrx/store';
import {appEN} from 'src/assets/i18n/en';
import {appFR} from 'src/assets/i18n/fr';
import {appIT} from 'src/assets/i18n/it';
import {GEOHUB_SAVING_TRY_INTERVAL} from './constants/geohub';
import {StatusService} from './services/status.service';
import {LangService} from 'wm-core/localization/lang.service';
import {startNetworkMonitoring} from './store/network/network.actions';
import {INetworkRootState} from './store/network/netwotk.reducer';
import {DOCUMENT} from '@angular/common';
import {Observable} from 'rxjs';
import {
  confGEOLOCATION,
  confLANGUAGES,
  confMAP,
  confTHEMEVariables,
} from 'wm-core/store/conf/conf.selector';
import {loadConf} from 'wm-core/store/conf/conf.actions';
import {loadPois, query} from 'wm-core/store/api/api.actions';
import {online} from './store/network/network.selector';
import {WmLoadingService} from 'wm-core/services/loading.service';
import {IGEOLOCATION} from 'wm-core/types/config';
import {OfflineCallbackManager} from 'wm-core/shared/img/offlineCallBackManager';
import {isLogged} from 'wm-core/store/auth/auth.selectors';
import {loadAuths} from 'wm-core/store/auth/auth.actions';
import {getImg} from 'wm-core/utils/localForage';
import {UgcService} from 'wm-core/services/ugc.service';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [LangService],
})
export class AppComponent {
  confGEOLOCATION$: Observable<IGEOLOCATION> = this._store.select(confGEOLOCATION);
  confTHEMEVariables$: Observable<any> = this._store.select(confTHEMEVariables);
  public image_gallery: any[];
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  public photoIndex: number = 0;
  public showingPhotos = false;

  constructor(
    private _platform: Platform,
    private router: Router,
    private status: StatusService,
    private _ugcSvc: UgcService,
    private _store: Store<any>,
    private _storeNetwork: Store<INetworkRootState>,
    private _langService: LangService,
    @Inject(DOCUMENT) private _document: Document,
    private _loadingSvc: WmLoadingService,
  ) {
    this._store.dispatch(loadConf());
    this._store.dispatch(query({init: true}));
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
    this._storeNetwork.dispatch(startNetworkMonitoring());
    this._store.dispatch(loadAuths());
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
        // this.router.navigate(['home']);
        SplashScreen.hide();
        const keepAwake =
          (localStorage.getItem('wm-keep-awake') != 'false' &&
            localStorage.getItem('wm-keep-awake') != null) ||
          false;
        if (keepAwake) {
          KeepAwake.keepAwake();
        } else {
          KeepAwake.allowSleep();
        }
      },
      err => {
        SplashScreen.hide();
      },
    );

    this._store
      .select(online)
      .pipe(
        filter(o => o),
        switchMap(_ => this.isLogged$),
        filter(l => l),
        debounceTime(2000),
        take(1),
      )
      .subscribe(_ => {
        this._ugcSvc.syncUgcFromCloud();
      });

    this.status.showPhotos.subscribe(x => {
      this.showingPhotos = x.showingPhotos;
      this.image_gallery = x.image_gallery;
      this.photoIndex = x.photoIndex;
    });
    const currentDistanceFilter = +localStorage.getItem('wm-distance-filter');
    if (currentDistanceFilter === 0) {
      this.confGEOLOCATION$
        .pipe(
          filter(v => v != null),
          take(1),
        )
        .subscribe(conf => {
          localStorage.setItem('wm-distance-filter', `${conf.gps_accuracy_default}`);
        });
    }
    OfflineCallbackManager.setOfflineCallback(getImg);
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
      this._ugcSvc.syncUgcFromCloud();
    }, GEOHUB_SAVING_TRY_INTERVAL);
  }

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }
}
