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

import {SearchBarComponent} from 'src/app/components/shared/search-bar/search-bar.component';
import {
  inputTyped,
  resetPoiFilters,
  resetTrackFilters,
  setLayer,
  togglePoiFilter,
  toggleTrackFilterByIdentifier,
} from 'wm-core/store/api/api.actions';
import {showResult} from 'wm-core/store/api/api.selector';
import {loadConf} from 'wm-core/store/conf/conf.actions';
import {confAPP, confPROJECT} from 'wm-core/store/conf/conf.selector';
import {toggleHome} from 'src/app/store/map/map.selector';
import {IAPP, ILAYER} from 'wm-core/types/config';
import {WmInnerHtmlComponent} from 'wm-core/inner-html/inner-html.component';
import {online} from 'src/app/store/network/network.selector';
import {GeolocationService} from 'wm-core/services/geolocation.service';

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

  @ViewChild('searchCmp') searchCmp: SearchBarComponent;

  confAPP$: Observable<IAPP> = this._store.select(confAPP);
  goToHome$: Observable<any> = this._store.select(toggleHome);
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

  constructor(
    private _store: Store<any>,
    private _navCtrl: NavController,
    private _modalCtrl: ModalController,
    private _platform: Platform,
    private _geolocationSvc: GeolocationService,
    public sanitizer: DomSanitizer,
  ) {
    this._goToHomeSub = this.goToHome$.pipe(debounceTime(300)).subscribe(() => {
      this.goToHome();
    });
  }

  ngOnDestroy(): void {
    this._goToHomeSub.unsubscribe();
  }

  goToHome(): void {
    this.setLayer(null);
    this._store.dispatch(resetPoiFilters());
    try {
      this.searchCmp.reset();
    } catch (_) {}
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

  openSlug(slug: string): void {
    if (slug === 'project') {
      this._store
        .select(confPROJECT)
        .pipe(take(1))
        .subscribe(conf => {
          this._modalCtrl
            .create({
              component: WmInnerHtmlComponent,
              componentProps: {
                html: conf.HTML,
              },
              cssClass: 'wm-modal',
              backdropDismiss: true,
              keyboardClose: true,
            })
            .then(modal => {
              modal.present();
            });
        });
    } else {
      this._navCtrl.navigateForward(slug);
    }
  }

  removeLayer(layer: any): void {
    this.setLayer(null);
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
    if (layer != null) {
      if (layer.id != null) {
        this._store.dispatch(setLayer({layer}));
      }
      if (typeof layer === 'number') {
        layer = {id: layer};
        this._store.dispatch(setLayer({layer}));
      }
    } else {
      this._store.dispatch(setLayer(null));
      this._store.dispatch(resetTrackFilters());
    }
  }

  setPoi(id: number): void {
    if (id != null) {
      this._navCtrl.navigateForward('map');
      if (id != null) {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            poi: id,
          },
        };
        this._navCtrl.navigateForward('map', navigationExtras);
      }
    }
  }

  setSearch(value: string): void {
    this._store.dispatch(inputTyped({inputTyped: value}));
  }

  setTrack(id: string | number): void {
    if (id != null) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          track: id,
        },
        queryParamsHandling: 'merge',
      };
      this._navCtrl.navigateForward('map', navigationExtras);
    }
  }

  toggleFilter(filterIdentifier: string, idx?: number): void {
    this.setFilter({identifier: filterIdentifier, taxonomy: 'activities'});
  }
}
