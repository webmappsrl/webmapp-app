import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {BehaviorSubject, merge, Observable, of} from 'rxjs';
import {first, startWith, tap} from 'rxjs/operators';
import {GeohubService} from 'src/app/services/geohub.service';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {confHOME} from 'src/app/store/conf/conf.selector';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {elasticSearch} from 'src/app/store/elastic/elastic.selector';
import {IMapRootState} from 'src/app/store/map/map';
import {setCurrentLayer, setCurrentTrackId} from 'src/app/store/map/map.actions';
import {online} from 'src/app/store/network/network.selector';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {IHOME, ILAYER} from 'src/app/types/config';
import {IGeojsonFeature} from 'src/app/types/model';

@Component({
  selector: 'webmapp-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomePage implements OnInit {
  cards$: Observable<IHIT[]> = of([]);
  confHOME$: Observable<IHOME[]> = this._storeConf.select(confHOME);
  online$: Observable<boolean> = this._storeNetwork
    .select(online)
    .pipe(tap(() => this._cdr.detectChanges()));

  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);
  showSearch: boolean = true;

  isBackAvailable: boolean = false;
  mostViewedRoutes: Array<IGeojsonFeature>;
  nearRoutes: Array<IGeojsonFeature>;
  searchString: string;
  title: string;

  @Output('searchId') public searchIdEvent: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private _geoHubService: GeohubService,
    private _geoLocation: GeolocationService,
    private _storeSearch: Store<IElasticSearchRootState>,
    private _storeConf: Store<IConfRootState>,
    private _storeMap: Store<IMapRootState>,
    private _storeNetwork: Store<INetworkRootState>,
    private _navController: NavController,
    private _cdr: ChangeDetectorRef,
  ) {
    this.cards$ = merge(this.elasticSearch$).pipe(startWith([]));
  }

  public async ngOnInit() {
    this.mostViewedRoutes = await this._geoHubService.getMostViewedEcTracks();
    await this._geoLocation.start();
    this._geoLocation.onLocationChange.pipe(first()).subscribe(async pos => {
      this.nearRoutes = await this._geoHubService.getNearEcTracks(pos);
    });
  }

  public searchCard(id: string | number) {
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: +id}));
  }

  public setLayer(layer: ILAYER | null | number) {
    this._storeMap.dispatch(setCurrentLayer({currentLayer: layer as ILAYER}));
    this._navController.navigateForward('map');
  }
}
