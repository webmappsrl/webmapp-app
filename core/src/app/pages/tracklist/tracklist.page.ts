import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {Store} from '@ngrx/store';
import {from, Observable} from 'rxjs';
import {confMAP} from 'wm-core/store/conf/conf.selector';
import {getUgcTracks} from 'wm-core/utils/localForage';
import {LineString} from 'geojson';
import {WmFeature} from '@wm-types/feature';
@Component({
  selector: 'wm-tracklist',
  templateUrl: './tracklist.page.html',
  styleUrls: ['./tracklist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TracklistPage {
  confMap$: Observable<any> = this._store.select(confMAP);
  tracks$: Observable<WmFeature<LineString>[]>;

  constructor(
    private _navCtrl: NavController,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
  ) {}

  ionViewWillEnter(): void {
    this.tracks$ = from(getUgcTracks());
    this._cdr.detectChanges();
  }

  open(track: WmFeature<LineString>): void {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        track: track.properties.id,
      },
    };
    this._navCtrl.navigateForward('trackdetail', navigationExtras);
  }
}
