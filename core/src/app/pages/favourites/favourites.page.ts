import {Component, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from '@ionic/angular';
import {GeohubService} from 'src/app/services/geohub.service';
import {NavigationExtras, Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {Feature, LineString} from 'geojson';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
@Component({
  selector: 'webmapp-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {
  private page: number = 0;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  tracks$: BehaviorSubject<Feature<LineString>[]> = new BehaviorSubject<Feature<LineString>[]>(
    null,
  );

  constructor(
    private _geoHubService: GeohubService,
    private _store: Store,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  async ngOnInit() {
    this.doRefresh(null);
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
    this._urlHandlerSvc.updateURL({track: clickedFeatureId});
  }

  async remove(track: Feature<LineString>) {
    await this._geoHubService.setFavouriteTrack(track.properties.id, false);
    const idx = this.tracks$.value.findIndex(x => x.properties.id == track.properties.id);
    const currentTracks = this.tracks$.value;
    currentTracks.splice(idx, 1);
    this.tracks$.next([...currentTracks]);
  }
}
