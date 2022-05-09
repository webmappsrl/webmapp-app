import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {from, Observable} from 'rxjs';
import {DownloadService} from 'src/app/services/download.service';
import {IMapRootState} from 'src/app/store/map/map';
import {setCurrentTrackId} from 'src/app/store/map/map.actions';
import {IGeojsonFeatureDownloaded} from 'src/app/types/model';

@Component({
  selector: 'downloaded-tracks-box',
  templateUrl: './downloaded-tracks-box.component.html',
  styleUrls: ['./downloaded-tracks-box.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadedTracksBoxComponent {
  tracks$: Observable<IGeojsonFeatureDownloaded[]>;
  public selected: IGeojsonFeatureDownloaded[] = [];
  constructor(
    private _downloadService: DownloadService,
    private _storeMap: Store<IMapRootState>,
    private _navController: NavController,
  ) {
    this.tracks$ = from(this._downloadService.getDownloadedTracks());
  }

  open(track: IGeojsonFeatureDownloaded) {
    const clickedFeatureId = track.properties.id;
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: +clickedFeatureId, track}));
    this._navController.navigateForward('/itinerary');
  }
}
