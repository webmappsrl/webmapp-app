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
import {SaveService} from 'src/app/services/save.service';
import {confMAP} from 'src/app/shared/wm-core/store/conf/conf.selector';
import {WaypointSave} from 'src/app/types/waypoint';

@Component({
  selector: 'wm-waypointlist',
  templateUrl: './waypointlist.page.html',
  styleUrls: ['./waypointlist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WaypointlistPage {
  waypoints$: Observable<WaypointSave[]>;
  confMap$: Observable<any> = this._store.select(confMAP);

  constructor(
    private _saveSvc: SaveService,
    private _navCtrl: NavController,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
  ) {}

  open(waypoint): void {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        waypoint: waypoint.key,
      },
    };
    this._navCtrl.navigateForward('waypointdetail', navigationExtras);
  }

  ionViewWillEnter(): void {
    this.waypoints$ = from(this._saveSvc.getWaypoints());
    this._cdr.detectChanges();
  }
}
