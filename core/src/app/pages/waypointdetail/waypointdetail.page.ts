import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AlertController, MenuController, NavController, ToastController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {from, Observable} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
import {online} from 'src/app/store/network/network.selector';
import {confMAP, confPOIFORMS} from 'wm-core/store/conf/conf.selector';
import {DetailPage} from '../abstract/detail.page';
import {Point} from 'geojson';
import {UgcService} from 'wm-core/services/ugc.service';
import {WmFeature} from '@wm-types/feature';
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
  currentPoi: WmFeature<Point>;
  online$ = this._store.select(online);
  sliderOptions: any = {
    slidesPerView: 2.5,
  };
  waypoint$: Observable<WmFeature<Point>>;

  constructor(
    private _route: ActivatedRoute,
    private _ugcSvc: UgcService,
    private _navCtlr: NavController,
    private _store: Store<any>,
    toastCtrl: ToastController,
    translateSvc: TranslateService,
    menuCtrl: MenuController,
    alertCtrl: AlertController,
  ) {
    super(menuCtrl, alertCtrl, translateSvc, toastCtrl);
    this.waypoint$ = this._route.queryParams.pipe(
      switchMap(param => this._ugcSvc.getPoi(param.waypoint)),
      tap(w => (this.currentPoi = w)),
    );
    this.waypoint$.subscribe(w => console.log(w));
  }

  delete(): void {
    super.delete('ATTENZIONE', 'Sei sicuro di voler cancellare questo waypoint?', () =>
      this.deleteAction(),
    );
  }

  deleteAction(): void {
    this._ugcSvc
      .deletePoi(this.currentPoi)
      .pipe(
        take(1),
        switchMap(_ => from(this.presentToast())),
      )
      .subscribe(() => {
        this._navCtlr.navigateForward('waypointlist');
      });
  }

  presentToast(): Observable<void> {
    return super.presentToast('Waypoint correttamente cancellato');
  }
}
