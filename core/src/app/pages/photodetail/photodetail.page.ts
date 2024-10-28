import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AlertController, MenuController, NavController, ToastController} from '@ionic/angular';
import {switchMap, take, tap} from 'rxjs/operators';
import {from, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import {online} from 'src/app/store/network/network.selector';
import {DetailPage} from '../abstract/detail.page';
import {getUgcMedia} from 'wm-core/utils/localForage';
import {UgcService} from 'wm-core/services/ugc.service';
import {Media, WmFeature} from '@wm-types/feature';
@Component({
  selector: 'webmapp-photodetail',
  templateUrl: './photodetail.page.html',
  styleUrls: ['./photodetail.page.scss'],
})
export class PhotodetailPage extends DetailPage {
  currentPhoto: WmFeature<Media>;
  online$ = this._store.select(online);
  photo$: Observable<WmFeature<Media>>;

  constructor(
    private _route: ActivatedRoute,
    private _ugcSvc: UgcService,
    private _navCtlr: NavController,
    private _store: Store,
    toastCtrl: ToastController,
    translateSvc: TranslateService,
    menuCtrl: MenuController,
    alertCtrl: AlertController,
  ) {
    super(menuCtrl, alertCtrl, translateSvc, toastCtrl);
    this.photo$ = this._route.queryParams.pipe(
      switchMap(param => from(getUgcMedia(param.photo))),
      tap(p => (this.currentPhoto = p)),
    );
  }

  delete(): void {
    super.delete('ATTENZIONE', 'Sei sicuro di voler cancellare questa foto?', () =>
      this.deleteAction(),
    );
  }

  deleteAction(): void {
    this._ugcSvc
      .deleteMedia(this.currentPhoto)
      .pipe(
        take(1),
        switchMap(_ => from(this.presentToast())),
      )
      .subscribe(() => {
        this._navCtlr.navigateForward('photolist');
      });
  }

  presentToast(): Observable<void> {
    return super.presentToast('Foto correttamente cancellata');
  }
}
