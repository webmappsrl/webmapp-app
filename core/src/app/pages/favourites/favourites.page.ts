import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GeohubService } from 'src/app/services/geohub.service';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {

  public tracks: IGeojsonFeature[] = [];

  constructor(
    private _geoHubService: GeohubService,
    private _statusService: StatusService,
    private _navController: NavController
  ) { }

  async ngOnInit() {
    this.tracks = await this._geoHubService.getFavouriteTracks();
  }

  open(track: IGeojsonFeature) {
    console.log('------- ~ file: favourites.page.ts ~ line 27 ~ FavouritesPage ~ open ~ track', track);
    this._statusService.route = track;
    this._navController.navigateForward('/route');
  }

  async remove($event: Event, track: IGeojsonFeature) {
    $event.preventDefault();
    await this._geoHubService.setFavouriteTrack(track.properties.id, false);
    const idx = this.tracks.findIndex(x => x.properties.id == track.properties.id);
    this.tracks.splice(idx, 1);
  }

}
