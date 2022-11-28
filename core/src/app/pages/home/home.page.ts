import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

import {ModalController, NavController} from '@ionic/angular';

import {BehaviorSubject, merge, Observable, of, zip} from 'rxjs';
import {filter, first, map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {confAPP, confHOME, confPOISFilter} from 'src/app/store/conf/conf.selector';
import {
  setCurrentFilters,
  setCurrentLayer,
  setCurrentPoiId,
  setCurrentTrackId,
} from 'src/app/store/map/map.actions';
import {IAPP, IHOME, ILAYER} from 'src/app/types/config';

import {Store} from '@ngrx/store';
import {InnerHtmlComponent} from 'src/app/components/modal-inner-html/modal-inner-html.component';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {elasticSearch} from 'src/app/store/elastic/elastic.selector';
import {IMapRootState} from 'src/app/store/map/map';
import {currentFilters, mapCurrentLayer} from 'src/app/store/map/map.selector';
import {online} from 'src/app/store/network/network.selector';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {pois} from 'src/app/store/pois/pois.selector';
import {fromHEXToColor} from 'src/app/components/shared/map-core/utils';

@Component({
  selector: 'wm-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit, OnChanges {
  confAPP$: Observable<IAPP> = this._storeConf.select(confAPP);
  confHOME$: Observable<IHOME[]> = this._storeConf.select(confHOME);
  confPOISFilter$: Observable<any> = this._storeConf.select(confPOISFilter).pipe(
    map(p => {
      if (p.poi_type != null) {
        let poi_type = p.poi_type.map(p => {
          if (p.icon != null && p.color != null) {
            const namedPoiColor = fromHEXToColor[p.color] || 'darkorange';
            return {...p, ...{icon: p.icon.replaceAll('darkorange', namedPoiColor)}};
          }
          return p;
        });
        return {where: p.where, poi_type};
      }
      return p;
    }),
  );
  currentLayer$ = this._storeMap.select(mapCurrentLayer);
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>('tracks');
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  elasticSearchFilteredByLayer$ = this.elasticSearch$.pipe(
    withLatestFrom(this.currentLayer$),
    map(([all, currentLayer]) => all.filter(l => l.layers.indexOf(+currentLayer.id) > -1)),
  );
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);
  online$: Observable<boolean> = this._storeNetwork
    .select(online)
    .pipe(tap(() => this._cdr.detectChanges()));
  poiCards$: Observable<any[]>;
  selectedFilters$: Observable<string[]> = this._storeMap.select(currentFilters);
  title: string;

  constructor(
    private _geoLocation: GeolocationService,
    private _storeSearch: Store<IElasticSearchRootState>,
    private _storeConf: Store<IConfRootState>,
    private _storeMap: Store<IMapRootState>,
    private _storeNetwork: Store<INetworkRootState>,
    private _navCtrl: NavController,
    private _modalCtrl: ModalController,
    private _cdr: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
  ) {
    const allPois: Observable<any[]> = this._storeMap.select(pois).pipe(
      filter(p => p != null),
      map(p => ((p as any).features || []).map(p => (p as any).properties || [])),
    );
    const selectedPois = zip(this.currentSearch$, allPois, this.selectedFilters$).pipe(
      map(([search, features, filters]) => {
        const isSearch = search.length > 0 || filters.length > 0;
        const whereFilters = filters.filter(f => f.indexOf('where_') >= 0);
        const poiTypeFilters = filters.filter(f => f.indexOf('poi_type_') >= 0);
        let whereCondition = true;
        let poiTypeCondition = true;
        return features.filter(f => {
          const nameCondition = JSON.stringify(f.name).toLowerCase().includes(search.toLowerCase());
          if (filters.length > 0) {
            whereCondition =
              whereFilters.length > 0
                ? f.taxonomyIdentifiers.filter(v => whereFilters.indexOf(v) >= 0).length > 0
                : true;
            poiTypeCondition =
              poiTypeFilters.length > 0
                ? f.taxonomyIdentifiers.filter(v => poiTypeFilters.indexOf(v) >= 0).length > 0
                : true;
          }
          return nameCondition && whereCondition && poiTypeCondition && isSearch;
        }) as any[];
      }),
      tap(pois => {
        if (pois.length === 0) {
          this.currentTab$.next('tracks');
        }
      }),
    );
    this.poiCards$ = merge(this.currentSearch$, this.selectedFilters$).pipe(
      switchMap(_ => selectedPois),
    );
  }

  goToHome(): void {
    this.setLayer(null);
    this._navCtrl.navigateForward('home');
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  async ngOnInit() {
    // this.mostViewedRoutes = await this._geoHubService.getMostViewedEcTracks();
    await this._geoLocation.start();
    this._geoLocation.onLocationChange.pipe(first()).subscribe(async pos => {
      //  this.nearRoutes = await this._geoHubService.getNearEcTracks(pos);
    });
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

  searchCard(id: string | number): void {
    if (id != null) {
      this._storeMap.dispatch(setCurrentTrackId({currentTrackId: +id}));
    }
  }

  segmentChanged(ev: any): void {
    if (ev != null && ev.detail != null && ev.detail.value != null) {
      this.currentTab$.next(ev.detail.value);
    }
  }

  setCurrentFilters(filters: string[]): void {
    if (filters != null) {
      this._storeMap.dispatch(setCurrentFilters({currentFilters: filters}));
      this.currentTab$.next('pois');
    }
  }

  setLayer(layer: ILAYER | null | any): void {
    if (layer != null) {
      const cards = layer.tracks[layer.id] ?? [];
      this.layerCards$.next(cards);
      this._cdr.markForCheck();
    } else {
      this.layerCards$.next(null);
    }
    this._storeMap.dispatch(setCurrentLayer({currentLayer: layer as ILAYER}));
  }

  setPoi(id: number): void {
    if (id != null) {
      this._navCtrl.navigateForward('map');
      this._storeMap.dispatch(setCurrentPoiId({currentPoiId: id}));
    }
  }
}
