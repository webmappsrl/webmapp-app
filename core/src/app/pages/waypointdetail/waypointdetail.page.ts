import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AlertController, MenuController, NavController, ToastController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {from, Observable} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
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
  currentWaypoint: WaypointSave;
  sliderOptions: any = {
    slidesPerView: 2.5,
  };
  constructor(
    private _route: ActivatedRoute,
    private _menuCtrl: MenuController,
    private _alertCtrl: AlertController,
    private _translateSvc: TranslateService,
    private _saveSvc: SaveService,
    private _navCtlr: NavController,
    private _toastCtrl: ToastController,
  ) {
    this.waypoint$ = this._route.queryParams.pipe(
      switchMap(param => from(this._saveSvc.getWaypoint(param.waypoint))),
      tap(w => (this.currentWaypoint = w)),
    );
  }

  closeMenu(): void {
    this._menuCtrl.close('optionMenu');
  }

  menu(): void {
    this._menuCtrl.enable(true, 'optionMenu');
    this._menuCtrl.open('optionMenu');
  }

  delete(): void {
    from(
      this._alertCtrl.create({
        cssClass: 'my-custom-class',
        header: this._translateSvc.instant('ATTENZIONE'),
        message: this._translateSvc.instant('Sei sicuro di voler cancellare questo waypoint?'),
        buttons: [
          {
            text: this._translateSvc.instant('cancella'),
            cssClass: 'webmapp-modalconfirm-btn',
            role: 'destructive',
            handler: () => this.deleteAction(),
          },
          {
            text: this._translateSvc.instant('annulla'),
            cssClass: 'webmapp-modalconfirm-btn',
            role: 'cancel',
            handler: () => {},
          },
        ],
      }),
    )
      .pipe(
        switchMap(alert => {
          alert.present();
          return from(alert.onWillDismiss());
        }),
        take(1),
      )
      .subscribe(() => {});
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
    return from(
      this._toastCtrl.create({
        message: this._translateSvc.instant('Waypoint correttamente cancellato'),
        duration: 1500,
        position: 'bottom',
      }),
    ).pipe(switchMap(t => t.present()));
  }
}
