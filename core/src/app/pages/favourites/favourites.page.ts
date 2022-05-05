import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import {Store} from '@ngrx/store';
import {GeohubService} from 'src/app/services/geohub.service';
import {IMapRootState} from 'src/app/store/map/map';
import {setCurrentTrackId} from 'src/app/store/map/map.actions';
import {IGeojsonFeature} from 'src/app/types/model';

@Component({
  selector: 'webmapp-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public tracks: IGeojsonFeature[] = [];
  private page: number = 0;

  constructor(
    private _geoHubService: GeohubService,
    private _navController: NavController,
    private _storeMap: Store<IMapRootState>,
  ) {}

  async ngOnInit() {
    this.doRefresh(null);
  }
  async ionViewDidEnter() {
    this.doRefresh(null);
  }

  async doRefresh(event) {
    this.page = 0;
    this.tracks = await this._geoHubService.getFavouriteTracks();
    if (event) {
      event.target.complete();
    }
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

  async loadData(event) {
    const newpageResults = await this._geoHubService.getFavouriteTracks(++this.page);
    newpageResults.forEach(fav => {
      this.tracks.push(fav);
    });
    event.target.complete();
  }
}
