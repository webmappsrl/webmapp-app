import {AlertController, NavController} from '@ionic/angular';
import {Component, OnInit} from '@angular/core';
import {IGeojsonFeature, IGeojsonFeatureDownloaded} from 'src/app/types/model';

import {DownloadService} from 'src/app/services/download.service';
import {IMapRootState} from 'src/app/store/map/map';
import {Store} from '@ngrx/store';
import {setCurrentTrackId} from 'src/app/store/map/map.actions';

@Component({
  selector: 'app-downloadlist',
  templateUrl: './downloadlist.page.html',
  styleUrls: ['./downloadlist.page.scss'],
})
export class DownloadlistPage implements OnInit {
  public tracks: IGeojsonFeatureDownloaded[] = [];

  public selected: IGeojsonFeatureDownloaded[] = [];

  public isSelectedActive = false;

  constructor(
    private _downloadService: DownloadService,
    private _navController: NavController,
    private _storeMap: Store<IMapRootState>,
    private _alertCtrl: AlertController,
  ) {}

  async ngOnInit() {
    this.tracks = await this._downloadService.getDownloadedTracks();
  }

  open(track: IGeojsonFeature) {
    const clickedFeatureId = track.properties.id;
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: +clickedFeatureId, track}));
    this._navController.navigateForward('/itinerary');
  }

  select(ev, track) {
    if (ev.detail.checked) {
      this.selected.push(track);
    } else {
      this.selected.splice(this.selected.indexOf(track), 1);
    }
  }

  async deleteSelected() {
    const alert = await this._alertCtrl.create({
      header: 'Attenzione',
      message: 'Sei sicuro di voler eliminare le tracce?',
      buttons: [
        'Annulla',
        {
          text: 'Elimina',
          handler: () => {
            this.selected.forEach(track => {
              this._remove(track);
            });
            this.isSelectedActive = false;
          },
        },
      ],
    });
    alert.present().then();
  }

  private async _remove(track: IGeojsonFeatureDownloaded) {
    await this._downloadService.removeDownload(track.properties.id);
    const idx = this.tracks.findIndex(x => x.properties.id == track.properties.id);
    this.tracks.splice(idx, 1);
  }

  async remove(track: IGeojsonFeature) {
    const alert = await this._alertCtrl.create({
      header: 'Attenzione',
      message: 'Sei sicuro di voler eliminare la traccia?',
      buttons: [
        'Annulla',
        {
          text: 'Elimina',
          handler: () => {
            this._remove(track as IGeojsonFeatureDownloaded);
          },
        },
      ],
    });
    alert.present().then();
  }

  gotoMap() {
    this._navController.navigateForward('/map');
  }
}
