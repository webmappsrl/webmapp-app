import {ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation} from '@angular/core';
import {NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {from, Observable, of} from 'rxjs';
import {DownloadService} from 'src/app/services/download.service';
import {IMapRootState} from 'src/app/store/map/map';
import {setCurrentTrackId} from 'src/app/store/map/map.actions';
import {IGeojsonFeatureDownloaded} from 'src/app/types/model';
import {offline} from 'src/app/store/network/network.selector';
import {INetworkRootState} from 'src/app/store/network/netwotk.reducer';
import {switchMap} from 'rxjs/operators';
import {NavigationExtras} from '@angular/router';
@Component({
  selector: 'downloaded-tracks-box',
  templateUrl: './downloaded-tracks-box.component.html',
  styleUrls: ['./downloaded-tracks-box.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadedTracksBoxComponent {
  offline$: Observable<boolean> = this._storeNetwork.select(offline);
  tracks$: Observable<IGeojsonFeatureDownloaded[] | null>;

  constructor(
    private _downloadService: DownloadService,
    private _storeNetwork: Store<INetworkRootState>,
    private _navCtrl: NavController,
  ) {
    this.tracks$ = this.offline$.pipe(
      switchMap(off => {
        if (off) {
          return from(this._downloadService.getDownloadedTracks());
        } else {
          return of(null);
        }
      }),
    );
  }

  open(track: IGeojsonFeatureDownloaded) {
    const id = track.properties.id;
    if (id != null) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          track: id,
        },
        queryParamsHandling: 'merge',
      };
      this._navCtrl.navigateForward('map', navigationExtras);
    }
  }

  sizeInMB(size) {
    const million = 1000000;
    if (size > million) {
      return Math.round(size / million);
    } else {
      return Math.round((size * 100) / million) / 100;
    }
  }
}
