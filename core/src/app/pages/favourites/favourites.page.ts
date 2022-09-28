import {Component, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll, NavController} from '@ionic/angular';

import {AuthService} from 'src/app/services/auth.service';
import {GeohubService} from 'src/app/services/geohub.service';
import {IGeojsonFeature} from 'src/app/types/model';
import {IMapRootState} from 'src/app/store/map/map';
import {Store} from '@ngrx/store';
import {setCurrentTrackId} from 'src/app/store/map/map.actions';

@Component({
  selector: 'webmapp-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {
  private page: number = 0;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  isLoggedIn$ = this._authService.isLoggedIn$;
  public tracks: IGeojsonFeature[] = [];

  constructor(
    private _geoHubService: GeohubService,
    private _navController: NavController,
    private _storeMap: Store<IMapRootState>,
    private _authService: AuthService,
  ) {}

  async doRefresh(event) {
    this.page = 0;
    this.tracks = await this._geoHubService.getFavouriteTracks();
    if (event) {
      event.target.complete();
    }
  }

  async ionViewDidEnter() {
    this.doRefresh(null);
  }

  async loadData(event) {
    const newpageResults = await this._geoHubService.getFavouriteTracks(++this.page);
    newpageResults.forEach(fav => {
      this.tracks.push(fav);
    });
    event.target.complete();
  }

  async ngOnInit() {
    this.doRefresh(null);
  }

  open(track: IGeojsonFeature) {
    const clickedFeatureId = track.properties.id;
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: +clickedFeatureId}));
    this._navController.navigateForward('/itinerary');
  }

  async remove(track: IGeojsonFeature) {
    await this._geoHubService.setFavouriteTrack(track.properties.id, false);
    const idx = this.tracks.findIndex(x => x.properties.id == track.properties.id);
    this.tracks.splice(idx, 1);
  }
}
