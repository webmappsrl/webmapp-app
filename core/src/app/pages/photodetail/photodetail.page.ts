import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IPhotoItem} from 'src/app/services/photo.service';
import {AlertController, MenuController, NavController, ToastController} from '@ionic/angular';
import {SaveService} from 'src/app/services/save.service';
import {switchMap, take, tap} from 'rxjs/operators';
import {from, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'webmapp-photodetail',
  templateUrl: './photodetail.page.html',
  styleUrls: ['./photodetail.page.scss'],
})
export class PhotodetailPage {
  photo$: Observable<IPhotoItem>;
  currentPhoto: IPhotoItem;

  constructor(
    private _route: ActivatedRoute,
    private _menuController: MenuController,
    private _saveSvc: SaveService,
    private _alertCtrl: AlertController,
    private _translateSvc: TranslateService,
    private _navCtlr: NavController,
    private _toastCtrl: ToastController,
  ) {
    this.photo$ = this._route.queryParams.pipe(
      switchMap(param => from(this._saveSvc.getPhoto(param.photo))),
      tap(p => (this.currentPhoto = p)),
    );
  }

  closeMenu(): void {
    this._menuController.close('optionMenu');
  }

  menu(): void {
    this._menuController.enable(true, 'optionMenu');
    this._menuController.open('optionMenu');
  }

  delete(): void {
    from(
      this._alertCtrl.create({
        cssClass: 'my-custom-class',
        header: this._translateSvc.instant('ATTENZIONE'),
        message: this._translateSvc.instant('Sei sicuro di voler cancellare questa foto?'),
        buttons: [
          {
            text: this._translateSvc.instant('cancella'),
            cssClass: 'webmapp-modalconfirm-btn',
            role: 'destructive',
            handler: () => this.deleteAction(),
          },
          {
            text: this._translateSvc.instant('Annulla'),
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
      .deletePhoto(this.currentPhoto)
      .pipe(
        take(1),
        switchMap(_ => from(this.presentToast())),
      )
      .subscribe(() => {
        this._navCtlr.navigateForward('photolist');
      });
  }

  presentToast(): Observable<void> {
    return from(
      this._toastCtrl.create({
        message: this._translateSvc.instant('Foto correttamente cancellata'),
        duration: 1500,
        position: 'bottom',
      }),
    ).pipe(switchMap(t => t.present()));
  }
}
