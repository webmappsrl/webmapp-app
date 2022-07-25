import {BehaviorSubject, Observable, merge, of} from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {IHOME, ILAYER} from 'src/app/types/config';
import {ModalController, NavController} from '@ionic/angular';
import {first, startWith, tap} from 'rxjs/operators';
import {setCurrentLayer, setCurrentTrackId} from 'src/app/store/map/map.actions';

import {GeohubService} from 'src/app/services/geohub.service';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {IGeojsonFeature} from 'src/app/types/model';
import {IMapRootState} from 'src/app/store/map/map';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {InnerHtmlComponent} from 'src/app/components/modal-inner-html/modal-inner-html.component';
import {Store} from '@ngrx/store';
import {confHOME} from 'src/app/store/conf/conf.selector';
import {elasticSearch} from 'src/app/store/elastic/elastic.selector';
import {online} from 'src/app/store/network/network.selector';

@Component({
  selector: 'webmapp-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomePage implements OnInit {
  @Output('searchId') public searchIdEvent: EventEmitter<number> = new EventEmitter<number>();

  cards$: Observable<IHIT[]> = of([]);
  confHOME$: Observable<IHOME[]> = this._storeConf.select(confHOME);
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(elasticSearch);
  isBackAvailable: boolean = false;
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  layerCards$: BehaviorSubject<IHIT[] | null> = new BehaviorSubject<IHIT[] | null>(null);
  mostViewedRoutes: Array<IGeojsonFeature>;
  nearRoutes: Array<IGeojsonFeature>;
  online$: Observable<boolean> = this._storeNetwork
    .select(online)
    .pipe(tap(() => this._cdr.detectChanges()));
  searchString: string;
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
  ) {
    this.cards$ = merge(this.elasticSearch$).pipe(startWith([]));
  }

  public async ngOnInit() {
    // this.mostViewedRoutes = await this._geoHubService.getMostViewedEcTracks();
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
}
