import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from '@ionic/angular';
import {GeohubService} from 'src/app/services/geohub.service';
import {NavigationExtras, Router} from '@angular/router';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {confOPTIONSShowFavorites} from '@wm-core/store/conf/conf.selector';
import {Feature, LineString} from 'geojson';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
@Component({
  standalone: false,
  selector: 'webmapp-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit, OnDestroy {
  private page: number = 0;
  private _userSelectedSegmentManually = false;
  private _destroy$: Subject<void> = new Subject<void>();

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  showLayersSegment$: Observable<boolean> = this._store.select(confOPTIONSShowFavorites);
  selectedSegment: 'tracks' | 'layers' = 'tracks';
  tracks$: BehaviorSubject<Feature<LineString>[]> = new BehaviorSubject<Feature<LineString>[]>(
    null,
  );

  constructor(
    private _geoHubService: GeohubService,
    private _store: Store,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  /**
   * Tiene selectedSegment sincronizzato con showLayersSegment$ finché l'utente
   * non sceglie un tab manualmente (onSegmentChange). Non usa un gate "conf
   * caricata" a parte: showLayersSegment$ è già `false` finché la config reale
   * non arriva (default OPTIONS senza showFavorites, oc:8465), quindi seguire
   * direttamente il suo valore copre sia il cold start sia la doppia emissione
   * cache+fresh di getConf() (un "loaded=true" latch si fermerebbe alla prima
   * emissione, anche se dalla cache stale) — e riporta a 'tracks' se il flag
   * torna false, evitando un vicolo cieco senza switch per tornare indietro.
   */
  private _syncDefaultSegment(): void {
    this.showLayersSegment$.pipe(takeUntil(this._destroy$)).subscribe(showLayers => {
      if (!this._userSelectedSegmentManually) {
        this.selectedSegment = showLayers ? 'layers' : 'tracks';
      }
    });
  }

  async ngOnInit() {
    this._syncDefaultSegment();
    this.doRefresh(null);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onSegmentChange(segment: 'tracks' | 'layers'): void {
    this._userSelectedSegmentManually = true;
    this.selectedSegment = segment;
  }

  async doRefresh(event) {
    this.page = 0;
    this.tracks$.next(await this._geoHubService.getFavouriteTracks());
    if (event) {
      event.target.complete();
    }
  }

  async ionViewDidEnter() {
    this.doRefresh(null);
  }

  async loadData(event) {
    this.tracks$.next([
      ...this.tracks$.value,
      ...(await this._geoHubService.getFavouriteTracks(++this.page)),
    ]);

    event.target.complete();
  }

  open(track: Feature<LineString>) {
    const clickedFeatureId = track.properties.id ?? null;
    this._urlHandlerSvc.changeURL('map', {track: clickedFeatureId});
  }

  async remove(track: Feature<LineString>) {
    await this._geoHubService.setFavouriteTrack(track.properties.id, false);
    const idx = this.tracks$.value.findIndex(x => x.properties.id == track.properties.id);
    const currentTracks = this.tracks$.value;
    currentTracks.splice(idx, 1);
    this.tracks$.next([...currentTracks]);
  }
}
