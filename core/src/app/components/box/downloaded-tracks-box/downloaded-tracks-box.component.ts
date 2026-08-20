import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {NavController} from '@ionic/angular';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NavigationExtras} from '@angular/router';
import {getEcTracks} from '@wm-core/utils/localForage';
import {Hit} from '@wm-types/elastic';
@Component({
  standalone: false,
  selector: 'downloaded-tracks-box',
  templateUrl: './downloaded-tracks-box.component.html',
  styleUrls: ['./downloaded-tracks-box.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadedTracksBoxComponent {
  tracks$: Observable<Hit[]>;

  constructor(private _navCtrl: NavController) {
    this.tracks$ = from(getEcTracks()).pipe(
      map(t => t.map(track => track.properties as unknown as Hit)),
    );
  }

  open(id: number | string): void {
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
}
