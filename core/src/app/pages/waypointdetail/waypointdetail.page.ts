import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MenuController} from '@ionic/angular';
import {from, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {IPhotoItem} from 'src/app/services/photo.service';
import {SaveService} from 'src/app/services/save.service';
import {WaypointSave} from 'src/app/types/waypoint';

@Component({
  selector: 'wm-waypointdetail',
  templateUrl: './waypointdetail.page.html',
  styleUrls: ['./waypointdetail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WaypointdetailPage {
  waypoint$: Observable<WaypointSave>;
  sliderOptions: any = {
    slidesPerView: 2.5,
  };
  constructor(
    private _route: ActivatedRoute,
    private _menuController: MenuController,
    private _saveSvc: SaveService,
  ) {
    this.waypoint$ = this._route.queryParams.pipe(
      switchMap(param => from(this._saveSvc.getWaypoint(param.waypoint))),
    );
  }

  closeMenu(): void {
    this._menuController.close('optionMenu');
  }
  getPhoto(photo: IPhotoItem): string {
    if (photo.rawData) {
      return photo.rawData;
    } else {
      return photo.datasrc;
    }
  }

  menu(): void {
    this._menuController.enable(true, 'optionMenu');
    this._menuController.open('optionMenu');
  }
}
