import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AlertController, MenuController, NavController, ToastController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {from, Observable} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {SaveService} from 'wm-core/services/save.service';
import {online} from 'src/app/store/network/network.selector';
import {WaypointSave} from 'src/app/types/waypoint';
import {confMAP, confPOIFORMS} from 'wm-core/store/conf/conf.selector';
import {DetailPage} from '../abstract/detail.page';
import {IPhotoItem} from 'wm-core/services/photo.service';
@Component({
  selector: 'wm-waypointdetail',
  templateUrl: './waypointdetail.page.html',
  styleUrls: ['./waypointdetail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WaypointdetailPage extends DetailPage {
  confMap$: Observable<any> = this._store.select(confMAP);
  confPOIFORMS$: Observable<any[]> = this._store.select(confPOIFORMS);
  currentWaypoint: WaypointSave;
  online$ = this._store.select(online);
  sliderOptions: any = {
    slidesPerView: 2.5,
  };
  waypoint$: Observable<WaypointSave>;

  constructor(
    private _route: ActivatedRoute,
    private _saveSvc: SaveService,
    private _navCtlr: NavController,
    private _store: Store<any>,
    toastCtrl: ToastController,
    translateSvc: TranslateService,
    menuCtrl: MenuController,
    alertCtrl: AlertController,
  ) {
    super(menuCtrl, alertCtrl, translateSvc, toastCtrl);
    this.waypoint$ = this._route.queryParams.pipe(
      switchMap(param => from(this._saveSvc.getWaypoint(param.waypoint))),
      map((waypoint: WaypointSave) => {
        if (waypoint.photos && Array.isArray(waypoint.photos)) {
          const uniquePhotos = new Map<string, IPhotoItem>();
          waypoint.photos.forEach(photo => {
            if (!uniquePhotos.has(photo.id)) {
              uniquePhotos.set(photo.id, photo);
            }
          });
          waypoint.photos = Array.from(uniquePhotos.values());
        }
        return waypoint;
      }),
      tap(w => (this.currentWaypoint = w)),
    );
    this.waypoint$.subscribe(w => console.log(w));
  }

  delete(): void {
    super.delete('ATTENZIONE', 'Sei sicuro di voler cancellare questo waypoint?', () =>
      this.deleteAction(),
    );
  }

  deleteAction(): void {
    this._saveSvc
      .deleteWaypoint(this.currentWaypoint)
      .pipe(
        take(1),
        switchMap(_ => from(this.presentToast())),
      )
      .subscribe(() => {
        this._navCtlr.navigateForward('waypointlist');
      });
  }

  presentToast(): Observable<void> {
    return super.presentToast('Elemento correttamente cancellato');
  }
}
