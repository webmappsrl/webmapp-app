import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Platform, AlertController, ModalController} from '@ionic/angular';
import {filter, take, switchMap, startWith} from 'rxjs/operators';
import {from, BehaviorSubject, Observable, of} from 'rxjs';
import {KeepAwake} from '@capacitor-community/keep-awake';
import {Router} from '@angular/router';
import {SplashScreen} from '@capacitor/splash-screen';
import {select, Store} from '@ngrx/store';
import {StatusService} from './services/status.service';
import {DOCUMENT} from '@angular/common';
import {
  confGEOLOCATION,
  confLANGUAGES,
  confMAP,
  confMAPHitMapUrl,
  confTHEMEVariables,
  confPRIVACY,
} from '@wm-core/store/conf/conf.selector';
import {loadConf} from '@wm-core/store/conf/conf.actions';
import {IGEOLOCATION, ILANGUAGES} from '@wm-core/types/config';
import {OfflineCallbackManager} from '@wm-core/shared/img/offlineCallBackManager';
import {isLogged, needsDataConsent} from '@wm-core/store/auth/auth.selectors';
import {loadAuths, loadSignOuts} from '@wm-core/store/auth/auth.actions';
import {getImg} from '@wm-core/utils/localForage';
import {ecTracks, loadEcPois} from '@wm-core/store/features/ec/ec.actions';
import {INetworkRootState} from '@wm-core/store/network/netwotk.reducer';
import {startNetworkMonitoring} from '@wm-core/store/network/network.actions';
import {syncUgc} from '@wm-core/store/features/ugc/ugc.actions';
import {loadHitmapFeatures} from '@wm-core/store/user-activity/user-activity.action';
import {loadBoundingBoxes} from '@map-core/store/map-core.actions';
import {WmInnerHtmlComponent} from '@wm-core/inner-html/inner-html.component';
import {LangService} from '@wm-core/localization/lang.service';
import {DEFAULT_PRIVACY_POLICY_URL} from '@wm-core/constants/links';

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
  needsDataConsent$: Observable<boolean> = this._store.pipe(select(needsDataConsent));
  confPrivacy$: Observable<any> = this._store.select(confPRIVACY);

  // Subject to track localStorage changes
  private dataConsentSubject = new BehaviorSubject<boolean>(false);

  // Track current data consent alert
  private currentDataConsentAlert: HTMLIonAlertElement | null = null;

  // Flag to prevent multiple alerts
  private isShowingDataConsentAlert = false;

  public image_gallery: any[];
  public photoIndex: number = 0;
  public showingPhotos = false;

  constructor(
    private _platform: Platform,
    private _router: Router,
    private _statusSvc: StatusService,
    private _store: Store<any>,
    private _storeNetwork: Store<INetworkRootState>,
    private _alertCtrl: AlertController,
    private _modalCtrl: ModalController,
    private _langSvc: LangService,
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

    // Update data consent status when user logs in
    this.isLogged$.pipe(filter(isLogged => isLogged)).subscribe(() => {
      // Reset flag when user logs in to allow new alert if needed
      this.isShowingDataConsentAlert = false;
      // Update consent status after a small delay to ensure user is fully logged in
      setTimeout(() => {
        this._updateDataConsentStatus();
      }, 100);
    });

    // Close data consent alert when user logs out (backup safety)
    this.isLogged$.pipe(filter(isLogged => !isLogged)).subscribe(() => {
      // Force close any remaining data consent alerts
      this._forceCloseDataConsentAlert();
      // Reset flag to allow new alert on next login
      this.isShowingDataConsentAlert = false;
    });

    // Add data consent check ONLY after login
    this.isLogged$
      .pipe(
        filter(isLogged => isLogged),
        switchMap(() => {
          // Always check localStorage directly when user logs in
          const hasConsent = this._hasDataConsentInLocalStorage();
          console.log('User logged in, hasConsent:', hasConsent);
          this.dataConsentSubject.next(hasConsent);

          // If no consent, show alert directly
          if (!hasConsent && !this.isShowingDataConsentAlert) {
            console.log('No consent found, showing alert');
            return this._showDataConsentAlert();
          }

          // Return empty observable if consent exists
          return [];
        }),
      )
      .subscribe();

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

  private _hasDataConsentInLocalStorage(): boolean {
    return localStorage.getItem('privacy_consent') === 'true';
  }

  private _updateDataConsentStatus(): void {
    // Update consent status directly
    this.dataConsentSubject.next(this._hasDataConsentInLocalStorage());
  }

  private _closeDataConsentAlert(): void {
    if (this.currentDataConsentAlert) {
      try {
        this.currentDataConsentAlert.dismiss();
      } catch (error) {
        console.log('Error dismissing data consent alert:', error);
      } finally {
        this.currentDataConsentAlert = null;
        this.isShowingDataConsentAlert = false;
      }
    }
  }

  private _forceCloseDataConsentAlert(): void {
    if (this.currentDataConsentAlert) {
      try {
        // Force dismiss with immediate effect
        this.currentDataConsentAlert.dismiss();
        this.currentDataConsentAlert = null;
      } catch (error) {
        console.log('Error force dismissing data consent alert:', error);
        this.currentDataConsentAlert = null;
      }
    }

    // Reset flag
    this.isShowingDataConsentAlert = false;

    // Also try to dismiss any existing alerts in the DOM
    const existingAlerts = document.querySelectorAll('ion-alert');
    existingAlerts.forEach(alert => {
      if (alert && (alert as any).dismiss) {
        try {
          (alert as any).dismiss();
        } catch (error) {
          console.log('Error dismissing existing alert:', error);
        }
      }
    });
  }

  private async _showDataConsentAlert(): Promise<Observable<any>> {
    // Prevent multiple alerts
    if (this.isShowingDataConsentAlert) {
      return of(null);
    }

    // Set flag to prevent duplicates
    this.isShowingDataConsentAlert = true;

    // Close any existing alert first
    this._closeDataConsentAlert();

    // Use translations only
    const title = this._langSvc.instant('data.consent.title');
    const message = this._langSvc.instant('data.consent.message');
    const readPrivacy = this._langSvc.instant('data.consent.read_privacy');
    const accept = this._langSvc.instant('data.consent.accept');
    const reject = this._langSvc.instant('data.consent.reject');
    const rejectTitle = this._langSvc.instant('data.consent.reject_confirm.title');
    const rejectMessage = this._langSvc.instant('data.consent.reject_confirm.message');
    const rejectOk = this._langSvc.instant('data.consent.reject_confirm.ok');

    const alert = await this._alertCtrl.create({
      header: title,
      message: message,
      buttons: [
        {
          text: readPrivacy,
          handler: () => {
            this.openPrivacyPolicy().subscribe();
            return false;
          },
        },
        {
          text: accept,
          handler: () => {
            // Save consent immediately
            localStorage.setItem('privacy_consent', 'true');
            localStorage.setItem('privacy_consent_date', new Date().toISOString());
            this._updateDataConsentStatus();

            // Let the alert close naturally by returning true
            return true;
          },
        },
        {
          text: reject,
          role: 'cancel',
          handler: async () => {
            // Show confirmation message
            const confirmAlert = await this._alertCtrl.create({
              header: rejectTitle,
              message: rejectMessage,
              buttons: [
                {
                  text: rejectOk,
                  handler: async () => {
                    // Force close the main data consent alert immediately
                    this._forceCloseDataConsentAlert();

                    // Remove data consent from localStorage when user rejects
                    localStorage.removeItem('privacy_consent');
                    localStorage.removeItem('privacy_consent_date');
                    this._updateDataConsentStatus();

                    // Small delay to ensure alert is closed before logout
                    setTimeout(() => {
                      this._store.dispatch(loadSignOuts());
                    }, 200);
                  },
                },
              ],
            });
            await confirmAlert.present();
          },
        },
      ],
    });

    // Save reference to current alert
    this.currentDataConsentAlert = alert;

    // Handle alert dismissal
    alert.onDidDismiss().then(() => {
      this.currentDataConsentAlert = null;
      this.isShowingDataConsentAlert = false;
    });

    // Handle alert will dismiss to update consent status
    alert.onWillDismiss().then(detail => {
      // If user accepted, update the consent status
      if (detail.role === 'ok' || detail.role === undefined) {
        // Check if consent was already saved (in case of accept button)
        if (!this._hasDataConsentInLocalStorage()) {
          // If not saved yet, save it now
          localStorage.setItem('privacy_consent', 'true');
          localStorage.setItem('privacy_consent_date', new Date().toISOString());
          this._updateDataConsentStatus();
        }
      }
    });

    await alert.present();

    // Return empty observable
    return of(null);
  }

  private openPrivacyPolicy(): Observable<any> {
    this.confPrivacy$
      .pipe(
        take(1),
        switchMap(privacy => {
          if (privacy?.html != null) {
            return from(
              this._modalCtrl.create({
                component: WmInnerHtmlComponent,
                componentProps: {
                  html: privacy.html,
                },
                swipeToClose: true,
                mode: 'ios',
              }),
            );
          } else {
            // Fallback se non c'è contenuto HTML nella configurazione
            window.open(DEFAULT_PRIVACY_POLICY_URL, '_blank');
            return from(Promise.resolve(null));
          }
        }),
      )
      .subscribe(modal => modal?.present());

    return of(null);
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
