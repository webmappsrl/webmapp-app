import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Platform, AlertController, ModalController} from '@ionic/angular';
import {filter, take, switchMap, startWith} from 'rxjs/operators';
import {from, BehaviorSubject} from 'rxjs';
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
  confPRIVACY,
} from '@wm-core/store/conf/conf.selector';
import {loadConf} from '@wm-core/store/conf/conf.actions';
import {IGEOLOCATION, ILANGUAGES} from '@wm-core/types/config';
import {OfflineCallbackManager} from '@wm-core/shared/img/offlineCallBackManager';
import {isLogged, needsPrivacyConsent} from '@wm-core/store/auth/auth.selectors';
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
  needsPrivacyConsent$: Observable<boolean> = this._store.pipe(select(needsPrivacyConsent));
  confPrivacy$: Observable<any> = this._store.select(confPRIVACY);

  // Subject to track localStorage changes
  private privacyConsentSubject = new BehaviorSubject<boolean>(
    this._hasPrivacyConsentInLocalStorage(),
  );

  // Track current privacy alert
  private currentPrivacyAlert: HTMLIonAlertElement | null = null;

  // Flag to prevent multiple alerts
  private isShowingPrivacyAlert = false;

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

    // Update privacy consent status when user logs in
    this.isLogged$.pipe(filter(isLogged => isLogged)).subscribe(() => {
      // Reset flag when user logs in to allow new alert if needed
      this.isShowingPrivacyAlert = false;
      // Update consent status after a small delay to ensure user is fully logged in
      setTimeout(() => {
        this._updatePrivacyConsentStatus();
      }, 100);
    });

    // Close privacy alert when user logs out (backup safety)
    this.isLogged$.pipe(filter(isLogged => !isLogged)).subscribe(() => {
      // Force close any remaining privacy alerts
      this._forceClosePrivacyAlert();
      // Reset flag to allow new alert on next login
      this.isShowingPrivacyAlert = false;
    });

    // Add privacy consent check ONLY after login
    this.isLogged$
      .pipe(
        filter(isLogged => isLogged),
        switchMap(() =>
          this.privacyConsentSubject.pipe(startWith(this._hasPrivacyConsentInLocalStorage())),
        ),
        filter(hasConsent => !hasConsent),
        filter(() => !this.isShowingPrivacyAlert), // Only show if no alert is currently being shown
        switchMap(() => this._showPrivacyConsentAlert()),
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

  private _hasPrivacyConsentInLocalStorage(): boolean {
    return localStorage.getItem('privacy_consent') === 'true';
  }

  private _updatePrivacyConsentStatus(): void {
    // Only update consent status if user is logged in
    this.isLogged$.pipe(take(1)).subscribe(isLogged => {
      if (isLogged) {
        this.privacyConsentSubject.next(this._hasPrivacyConsentInLocalStorage());
      }
    });
  }

  private _closePrivacyAlert(): void {
    if (this.currentPrivacyAlert) {
      try {
        this.currentPrivacyAlert.dismiss();
      } catch (error) {
        console.log('Error dismissing privacy alert:', error);
      } finally {
        this.currentPrivacyAlert = null;
        this.isShowingPrivacyAlert = false;
      }
    }
  }

  private _forceClosePrivacyAlert(): void {
    if (this.currentPrivacyAlert) {
      try {
        // Force dismiss with immediate effect
        this.currentPrivacyAlert.dismiss();
        this.currentPrivacyAlert = null;
      } catch (error) {
        console.log('Error force dismissing privacy alert:', error);
        this.currentPrivacyAlert = null;
      }
    }

    // Reset flag
    this.isShowingPrivacyAlert = false;

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

  private async _showPrivacyConsentAlert(): Promise<void> {
    // Prevent multiple alerts
    if (this.isShowingPrivacyAlert) {
      return;
    }

    // Set flag to prevent duplicates
    this.isShowingPrivacyAlert = true;

    // Close any existing alert first
    this._closePrivacyAlert();

    // Use hardcoded text as fallback if translations are not loaded
    const title =
      this._langSvc.instant('privacy.consent.title') || 'Trattamento dei Dati Personali';
    const message =
      this._langSvc.instant('privacy.consent.message') ||
      "Per utilizzare l'applicazione, devi confermare il trattamento dei tuoi dati personali secondo la nostra Privacy Policy.";
    const readPrivacy =
      this._langSvc.instant('privacy.consent.read_privacy') || 'Leggi Privacy Policy';
    const accept = this._langSvc.instant('privacy.consent.accept') || 'Accetta';
    const reject = this._langSvc.instant('privacy.consent.reject') || 'Rifiuta';
    const rejectTitle =
      this._langSvc.instant('privacy.consent.reject_confirm.title') || 'Attenzione';
    const rejectMessage =
      this._langSvc.instant('privacy.consent.reject_confirm.message') ||
      "Senza il consenso al trattamento dei dati non puoi utilizzare l'applicazione. Verrai disconnesso.";
    const rejectOk = this._langSvc.instant('privacy.consent.reject_confirm.ok') || 'OK';

    const alert = await this._alertCtrl.create({
      header: title,
      message: message,
      buttons: [
        {
          text: readPrivacy,
          handler: () => {
            this.openPrivacyPolicy();
            return false; // Non chiudere l'alert
          },
        },
        {
          text: accept,
          handler: () => {
            // Save consent immediately
            localStorage.setItem('privacy_consent', 'true');
            localStorage.setItem('privacy_consent_date', new Date().toISOString());
            this._updatePrivacyConsentStatus();

            // Let the alert close naturally by returning true
            return true;
          },
        },
        {
          text: reject,
          role: 'cancel',
          handler: async () => {
            // Mostra messaggio di conferma
            const confirmAlert = await this._alertCtrl.create({
              header: rejectTitle,
              message: rejectMessage,
              buttons: [
                {
                  text: rejectOk,
                  handler: async () => {
                    // Force close the main privacy alert immediately
                    this._forceClosePrivacyAlert();

                    // Remove privacy consent from localStorage when user rejects
                    localStorage.removeItem('privacy_consent');
                    localStorage.removeItem('privacy_consent_date');
                    this._updatePrivacyConsentStatus();

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
    this.currentPrivacyAlert = alert;

    // Handle alert dismissal
    alert.onDidDismiss().then(() => {
      this.currentPrivacyAlert = null;
      this.isShowingPrivacyAlert = false;
    });

    // Handle alert will dismiss to update consent status
    alert.onWillDismiss().then(detail => {
      // If user accepted, update the consent status
      if (detail.role === 'ok' || detail.role === undefined) {
        // Check if consent was already saved (in case of accept button)
        if (!this._hasPrivacyConsentInLocalStorage()) {
          // If not saved yet, save it now
          localStorage.setItem('privacy_consent', 'true');
          localStorage.setItem('privacy_consent_date', new Date().toISOString());
          this._updatePrivacyConsentStatus();
        }
      }
    });

    await alert.present();
  }

  private openPrivacyPolicy(): void {
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
