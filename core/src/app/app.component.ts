import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Platform} from '@ionic/angular';
import {filter, take} from 'rxjs/operators';
import {KeepAwake} from '@capacitor-community/keep-awake';
import {Router} from '@angular/router';
import {SplashScreen} from '@capacitor/splash-screen';
import {select, Store} from '@ngrx/store';
import {StatusService} from './services/status.service';
import {DOCUMENT} from '@angular/common';
import {Observable} from 'rxjs';
import {
  confGEOLOCATION,
  confLANGUAGES,
  confMAP,
  confMAPHitMapUrl,
  confTHEMEVariables,
} from '@wm-core/store/conf/conf.selector';
import {loadConf} from '@wm-core/store/conf/conf.actions';
import {IGEOLOCATION, ILANGUAGES} from '@wm-core/types/config';
import {OfflineCallbackManager} from '@wm-core/shared/img/offlineCallBackManager';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {loadAuths} from '@wm-core/store/auth/auth.actions';
import {getImg} from '@wm-core/utils/localForage';
import {ecTracks, loadEcPois} from '@wm-core/store/features/ec/ec.actions';
import {INetworkRootState} from '@wm-core/store/network/netwotk.reducer';
import {startNetworkMonitoring} from '@wm-core/store/network/network.actions';
import {syncUgc} from '@wm-core/store/features/ugc/ugc.actions';
import {loadHitmapFeatures} from '@wm-core/store/user-activity/user-activity.action';
import {loadBoundingBoxes} from '@map-core/store/map-core.actions';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  confGEOLOCATION$: Observable<IGEOLOCATION> = this._store.select(confGEOLOCATION);
  confTHEMEVariables$: Observable<any> = this._store.select(confTHEMEVariables);
  confLANGUAGES$: Observable<ILANGUAGES> = this._store.select(confLANGUAGES);
  confMAPHitMapUrl$: Observable<string | null> = this._store.select(confMAPHitMapUrl);

  confMap$: Observable<any> = this._store.select(confMAP);
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  public image_gallery: any[];
  public photoIndex: number = 0;
  public showingPhotos = false;

  constructor(
    private _platform: Platform,
    private _router: Router,
    private _statusSvc: StatusService,
    private _store: Store<any>,
    private _storeNetwork: Store<INetworkRootState>,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    this._store.dispatch(loadAuths());
    this._store.dispatch(loadConf());
    this._store.dispatch(ecTracks({init: true}));
    this._store.dispatch(loadEcPois());
    this._store.dispatch(syncUgc());
    this._store.dispatch(loadBoundingBoxes());
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
    this._storeNetwork.dispatch(startNetworkMonitoring());

    this.confMAPHitMapUrl$
      .pipe(
        filter(f => f != null),
        take(1),
      )
      .subscribe(hitMapUrl => {
        this._store.dispatch(loadHitmapFeatures({url: hitMapUrl}));
      });

    this._platform.ready().then(
      () => {
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

    this._statusSvc.showPhotos.subscribe(x => {
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
    const tree = this._router.parseUrl(this._router.url);
    if (tree?.root?.children && tree.root.children['primary']) {
      const url = tree.root.children['primary'].segments[0].path;
      switch (url) {
        case 'register':
          return 'none';
        case 'route':
          return this._statusSvc.showingRouteDetails ? 'high' : 'middle';
        case 'map':
          return this._statusSvc.showingMapResults ? 'middlehigh' : 'low';
      }
    }
    return 'low';
  }

  recordingClick(ev) {}

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }
}
