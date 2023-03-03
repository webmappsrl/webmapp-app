import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {from, Observable} from 'rxjs';
import {SaveService} from 'src/app/services/save.service';
import {ITrack} from 'src/app/types/track';

@Component({
  selector: 'wm-tracklist',
  templateUrl: './tracklist.page.html',
  styleUrls: ['./tracklist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TracklistPage {
  public tracks$: Observable<ITrack[]>;

  constructor(private _saveSvc: SaveService, private _navCtrl: NavController) {
    this.tracks$ = from(this._saveSvc.getTracks());
  }

  open(track): void {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        track: track.key,
      },
    };
    this._navCtrl.navigateForward('trackdetail', navigationExtras);
  }
}
