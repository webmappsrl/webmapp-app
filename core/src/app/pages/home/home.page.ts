import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { first, startWith } from 'rxjs/operators';
import { ILocation } from 'selenium-webdriver';
import { CoinService } from 'src/app/services/coin.service';
import { GeohubService } from 'src/app/services/geohub.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { IConfRootState } from 'src/app/store/conf/conf.reducer';
import { confHOME } from 'src/app/store/conf/conf.selector';
import { IElasticSearchRootState } from 'src/app/store/elastic/elastic.reducer';
import { elasticSearch } from 'src/app/store/elastic/elastic.selector';
import { setCurrentLayer } from 'src/app/store/UI/UI.actions';
import { IUIRootState } from 'src/app/store/UI/UI.reducer';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomePage implements OnInit {
  @Output('searchId') searchIdEvent: EventEmitter<number> = new EventEmitter<number>();

  cards$: Observable<IHIT[]> = of([]);
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  confHOME$: Observable<IHOME[]> = this._storeConf.select(confHOME);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);
  currentLayer$: BehaviorSubject<ILAYER | null> = new BehaviorSubject<ILAYER | null>(null);

  public isBackAvailable: boolean = false;
  public showSearch: boolean = true;
  public title: string;
  public searchString: string;


  public mostViewedRoutes: Array<IGeojsonFeature>;
  public nearRoutes: Array<IGeojsonFeature>;

  constructor(
    private _geoHubService: GeohubService,
    private _geoLocation: GeolocationService,
    private _navCtrl: NavController,
    private _storeSearch: Store<IElasticSearchRootState>,
    private _storeConf: Store<IConfRootState>,
    private _StoreUi: Store<IUIRootState>,
    private _router: Router,
    private _route: ActivatedRoute,
    private _navController: NavController,
  ) {
    this.cards$ = merge(this.elasticSearch$, this.layerCards$).pipe(startWith([]));
   }

   searchCard(id: string | number) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: id ? id : null},
      queryParamsHandling: 'merge',
    });
  }

  setLayer(layer: ILAYER | null) {
    if (layer != null) {
      const cards = layer.tracks[layer.id] ?? [];
      this.layerCards$.next(cards);
    } else {
      this.layerCards$.next(null);
    }
    this._StoreUi.dispatch(setCurrentLayer({currentLayer: layer}));
    this.currentLayer$.next(layer);
    this._navController.navigateForward('map');
  }

  async ngOnInit() {
    this.mostViewedRoutes = await this._geoHubService.getMostViewedEcTracks();
    await this._geoLocation.start();
    this._geoLocation.onLocationChange.pipe(first()).subscribe(async (pos) => {
//       const pos2= {
//         longitude:11.045,
// latitude:42.65,
// timestamp:0,
// x:0,y:0,getLatLng:()=>{return[0,0]as [number,number]}
//       };
      this.nearRoutes = await this._geoHubService.getNearEcTracks(pos);
    })
  }

  start() {
    this._navCtrl.navigateForward('/map');
  }

  updateSearch(){

  }
}
