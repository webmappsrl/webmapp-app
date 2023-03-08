import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {from, Observable} from 'rxjs';
import {SaveService} from 'src/app/services/save.service';
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

  constructor(
    private _saveSvc: SaveService,
    private _navCtrl: NavController,
    private _cdr: ChangeDetectorRef,
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
