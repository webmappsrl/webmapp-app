import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {NavigationExtras} from '@angular/router';
import {Store} from '@ngrx/store';
import {ModalController, NavController, Platform} from '@ionic/angular';
import {App} from '@capacitor/app';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {debounceTime, startWith, take, tap} from 'rxjs/operators';

import {loadConf} from '@wm-core/store/conf/conf.actions';
import {confAPP, confOPTIONS, confPROJECT} from '@wm-core/store/conf/conf.selector';
import {IAPP, ILAYER, IOPTIONS} from '@wm-core/types/config';
import {WmInnerHtmlComponent} from '@wm-core/inner-html/inner-html.component';
import {online} from 'src/app/store/network/network.selector';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {showResult, ugcOpened} from '@wm-core/store/user-activity/user-activity.selector';
import {
  closeUgc,
  goToHome,
  inputTyped,
  openUgc,
  resetTrackFilters,
  setCurrentPoi,
  setLayer,
  togglePoiFilter,
  toggleTrackFilterByIdentifier,
} from '@wm-core/store/user-activity/user-activity.action';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {currentEcLayerId} from '@wm-core/store/features/ec/ec.actions';

@Component({
  selector: 'wm-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnDestroy {
  private _backBtnSub$: Subscription = Subscription.EMPTY;
  private _goToHomeSub: Subscription = Subscription.EMPTY;

  confAPP$: Observable<IAPP> = this._store.select(confAPP);
  confOPTIONS$: Observable<IOPTIONS> = this._store.select(confOPTIONS);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  online$: Observable<boolean> = this._store.select(online).pipe(
    startWith(false),
    tap(online => {
      if (online) {
        this._store.dispatch(loadConf());
      }
    }),
  );
  showResult$ = this._store.select(showResult);
  ugcOpened$ = this._store.select(ugcOpened);

  constructor(
    private _store: Store<any>,
    private _navCtrl: NavController,
    private _modalCtrl: ModalController,
    private _platform: Platform,
    private _geolocationSvc: GeolocationService,
    private _urlHandlerSvc: UrlHandlerService,
    public sanitizer: DomSanitizer,
  ) {}

  ngOnDestroy(): void {
    this._goToHomeSub.unsubscribe();
  }

  goToHome(): void {
    this._store.dispatch(goToHome());
    this._navCtrl.navigateForward('home');
  }

  ionViewDidEnter(): void {
    this._backBtnSub$ = this._platform.backButton.subscribeWithPriority(99999, () => {
      App.exitApp();
    });
    this._geolocationSvc.start();
  }

  ionViewWillLeave(): void {
    this._backBtnSub$.unsubscribe();
  }

  openExternalUrl(url: string): void {
    window.open(url);
  }

  openSlug(slug: string, idx?: number): void {
    if (slug === 'project') {
      this._store
        .select(confPROJECT)
        .pipe(take(1))
        .subscribe(conf => {
          this._modalCtrl
            .create({
              component: WmInnerHtmlComponent,
              componentProps: {
                html: conf.html ? conf.html : conf.HTML,
              },
              cssClass: 'wm-modal',
              backdropDismiss: true,
              keyboardClose: true,
            })
            .then(modal => {
              modal.present();
              if (idx) {
                this._urlHandlerSvc.updateURL({slug: idx});
              }
            });
        });
    } else {
      this._navCtrl.navigateForward(slug);
    }
  }

  removeLayer(_: any): void {
    this.setLayer(null);
    this._urlHandlerSvc.updateURL({layer: undefined});
  }

  setFilter(filter: {identifier: string; taxonomy: string}): void {
    if (filter == null) return;
    if (filter.taxonomy === 'poi_types') {
      this._store.dispatch(togglePoiFilter({filterIdentifier: filter.identifier}));
    } else {
      this._store.dispatch(
        toggleTrackFilterByIdentifier({identifier: filter.identifier, taxonomy: filter.taxonomy}),
      );
    }
  }

  setLayer(layer: ILAYER | null | any, idx?: number): void {
    if (layer != null && typeof layer === 'number') {
      layer = {id: layer};
    }
    if (layer != null && layer.id != null) {
      this._store.dispatch(currentEcLayerId({currentEcLayerId: layer.id}));
    } else {
      this._store.dispatch(resetTrackFilters());
    }

    this._store.dispatch(closeUgc());
  }

  setPoi(id: string | number): void {
    this._store.dispatch(setCurrentPoi({currentPoi: null}));
    this.ugcOpened$.pipe(take(1)).subscribe(ugcOpened => {
      const queryParams = ugcOpened
        ? {ugc_poi: id ? +id : undefined, poi: undefined}
        : {poi: id ? +id : undefined, ugc_poi: undefined};
      this._urlHandlerSvc.updateURL(queryParams);
    });
  }

  setSearch(value: string): void {
    this._store.dispatch(inputTyped({inputTyped: value}));
  }

  setUgc(): void {
    this._store.dispatch(openUgc());
  }

  toggleFilter(filterIdentifier: string, idx?: number): void {
    this.setFilter({identifier: filterIdentifier, taxonomy: 'activities'});
  }

  updateEcTrack(track = undefined): void {
    const params = {ugc_track: undefined, track};
    if (track == null) {
      params['ec_related_poi'] = undefined;
    }
    this._urlHandlerSvc.updateURL(params);
  }
}
