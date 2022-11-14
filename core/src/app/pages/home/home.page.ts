import {BehaviorSubject, Observable, merge, of, zip} from 'rxjs';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {IAPP, IHOME, ILAYER} from 'src/app/types/config';
import {ModalController, NavController} from '@ionic/angular';
import {confAPP, confHOME, confPOISFilter} from 'src/app/store/conf/conf.selector';
import {filter, first, map, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {
  setCurrentFilters,
  setCurrentLayer,
  setCurrentPoiId,
  setCurrentTrackId,
} from 'src/app/store/map/map.actions';

import {DomSanitizer} from '@angular/platform-browser';
import {GeohubService} from 'src/app/services/geohub.service';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {IGeojsonFeature} from 'src/app/types/model';
import {IMapRootState} from 'src/app/store/map/map';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {InnerHtmlComponent} from 'src/app/components/modal-inner-html/modal-inner-html.component';
import {Store} from '@ngrx/store';
import {currentFilters, mapCurrentLayer} from 'src/app/store/map/map.selector';
import {elasticSearch} from 'src/app/store/elastic/elastic.selector';
import {online} from 'src/app/store/network/network.selector';
import {pois} from 'src/app/store/pois/pois.selector';

@Component({
  selector: 'webmapp-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomePage implements OnInit {
  @Output('searchId') searchIdEvent: EventEmitter<number> = new EventEmitter<number>();

  cards$: Observable<IHIT[]> = of([]);
  confAPP$: Observable<IAPP> = this._storeConf.select(confAPP);
  confHOME$: Observable<IHOME[]> = this._storeConf.select(confHOME);
  confPOISFilter$: Observable<any> = this._storeConf.select(confPOISFilter);
  currentLayer$ = this._storeMap.select(mapCurrentLayer);
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>('tracks');
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);

  elasticSearchFilteredByLayer$ = this.elasticSearch$.pipe(
    withLatestFrom(this.currentLayer$),
    map(([all, currentLayer]) => all.filter(l => l.layers.indexOf(+currentLayer.id) > -1)),
  );
  isBackAvailable: boolean = false;
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  mostViewedRoutes: Array<IGeojsonFeature>;
  nearRoutes: Array<IGeojsonFeature>;
  online$: Observable<boolean> = this._storeNetwork
    .select(online)
    .pipe(tap(() => this._cdr.detectChanges()));
  poiCards$: Observable<any[]>;
  selectedFilters$: Observable<string[]> = this._storeMap.select(currentFilters);
  showSearch: boolean = true;
  title: string;

  constructor(
    private _geoHubService: GeohubService,
    private _geoLocation: GeolocationService,
    private _storeSearch: Store<IElasticSearchRootState>,
    private _storeConf: Store<IConfRootState>,
    private _storeMap: Store<IMapRootState>,
    private _storeNetwork: Store<INetworkRootState>,
    private _navController: NavController,
    private _modalCtrl: ModalController,
    private _cdr: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
  ) {
    this.cards$ = merge(this.elasticSearch$).pipe(startWith([]));
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
    }
  }

  searchCard(id: string | number) {
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: +id}));
  }

  segmentChanged(ev: any) {
    this.currentTab$.next(ev.detail.value);
  }

  setCurrentFilters(filters: string[]): void {
    this._storeMap.dispatch(setCurrentFilters({currentFilters: filters}));
    this.currentTab$.next('pois');
  }

  setLayer(layer: ILAYER | null | any) {
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
    this._navController.navigateForward('map');
    this._storeMap.dispatch(setCurrentPoiId({currentPoiId: id}));
  }
  goToHome(): void {
    this.setLayer(null);
    this._navController.navigateForward('home');
  }
}
