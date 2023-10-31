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

import {ModalController, NavController} from '@ionic/angular';

import {BehaviorSubject, fromEvent, merge, Observable, of, Subscription} from 'rxjs';
import {debounceTime, map, startWith, tap} from 'rxjs/operators';

import {InnerHtmlComponent} from 'src/app/components/modal-inner-html/modal-inner-html.component';
import {SearchBarComponent} from 'src/app/components/shared/search-bar/search-bar.component';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {
  inputTyped,
  resetPoiFilters,
  resetTrackFilters,
  setLayer,
  togglePoiFilter,
  toggleTrackFilter,
  toggleTrackFilterByIdentifier,
} from 'wm-core/store/api/api.actions';
import {apiElasticStateLayer, showResult} from 'wm-core/store/api/api.selector';
import {loadConf} from 'wm-core/store/conf/conf.actions';
import {confAPP} from 'wm-core/store/conf/conf.selector';
import {toggleHome} from 'src/app/store/map/map.selector';
import {IAPP, Filter, ILAYER} from 'wm-core/types/config';

@Component({
  selector: 'wm-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnDestroy {
  private _goToHomeSub: Subscription = Subscription.EMPTY;

  @ViewChild('searchCmp') searchCmp: SearchBarComponent;

  confAPP$: Observable<IAPP> = this._store.select(confAPP);
  currentLayer$ = this._store.select(apiElasticStateLayer);
  goToHome$: Observable<any> = this._store.select(toggleHome);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  online$: Observable<boolean> = merge(
    of(null),
    fromEvent(window, 'online'),
    fromEvent(window, 'offline'),
  ).pipe(
    map(() => navigator.onLine),
    startWith(false),
    tap(online => {
      if (online) {
        this._store.dispatch(loadConf());
      }
    }),
  );
  showResult$ = this._store.select(showResult);

  constructor(
    private _geoLocation: GeolocationService,
    private _store: Store<any>,
    private _navCtrl: NavController,
    private _modalCtrl: ModalController,
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

  openExternalUrl(url: string): void {
    window.open(url);
  }

  openSlug(slug: string): void {
    if (slug === 'project') {
      this._modalCtrl
        .create({
          component: InnerHtmlComponent,
          cssClass: 'wm-modal',
          backdropDismiss: true,
          keyboardClose: true,
        })
        .then(modal => {
          modal.present();
        });
    } else {
      this._navCtrl.navigateForward(slug);
    }
  }

  removeFilter(filter: Filter): void {
    this._store.dispatch(toggleTrackFilter({filter}));
  }

  removeLayer(layer: any): void {
    this.setLayer(null);
  }

  removePoiFilter(filterIdentifier: string): void {
    this._store.dispatch(togglePoiFilter({filterIdentifier}));
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
    if (layer != null && layer.id != null) {
      this._store.dispatch(setLayer({layer}));
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
