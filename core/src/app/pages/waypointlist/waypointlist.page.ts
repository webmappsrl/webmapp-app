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
import {confMAP} from '@wm-core/store/conf/conf.selector';
import {getUgcPois} from '@wm-core/utils/localForage';
import {Point} from 'geojson';
import {WmFeature} from '@wm-types/feature';
@Component({
  selector: 'wm-waypointlist',
  templateUrl: './waypointlist.page.html',
  styleUrls: ['./waypointlist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WaypointlistPage {
  confMap$: Observable<any> = this._store.select(confMAP);
  waypoints$: Observable<WmFeature<Point>[]>;

  constructor(
    private _navCtrl: NavController,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
  ) {}

  ionViewWillEnter(): void {
    this.waypoints$ = from(getUgcPois());
    this._cdr.detectChanges();
  }

  open(ugcPoi: WmFeature<Point>): void {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        waypoint: ugcPoi.properties.id ?? ugcPoi.properties.uuid,
      },
    };
    this._navCtrl.navigateForward('waypointdetail', navigationExtras);
  }
}
