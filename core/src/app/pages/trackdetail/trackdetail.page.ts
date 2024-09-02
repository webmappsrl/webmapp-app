import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
  AlertController,
  MenuController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import {from, Observable, of} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {ModalSaveComponent} from '../register/modal-save/modal-save.component';
import {TranslateService} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import {confMAP} from 'wm-core/store/conf/conf.selector';
import {online} from 'src/app/store/network/network.selector';
import {DetailPage} from '../abstract/detail.page';
import { SaveService } from 'wm-core/services/save.service';
import { IPhotoItem } from 'wm-core/services/photo.service';
import { ITrack } from 'wm-core/types/track';
@Component({
  selector: 'wm-trackdetail',
  templateUrl: './trackdetail.page.html',
  styleUrls: ['./trackdetail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackdetailPage extends DetailPage {
  confMap$: Observable<any> = this._store.select(confMAP);
  currentTrack: ITrack;
  online$ = this._store.select(online);
  public photos: IPhotoItem[] = [];
  public sliderOptions: any = {
    slidesPerView: 2.5,
  };
  track$: Observable<ITrack>;
  trackAvgSpeed$: Observable<number>;
  trackDistance$: Observable<number>;
  trackSlope$: Observable<number>;
  trackTime$: Observable<{
    seconds: number;
    minutes: number;
    hours: number;
  }> = of({hours: 0, minutes: 0, seconds: 0});
  trackTopSpeed$: Observable<number>;

  constructor(
    private _route: ActivatedRoute,
    private _geoUtils: GeoutilsService,
    private _saveSvc: SaveService,
    private _menuCtrl: MenuController,
    private _modalCtrl: ModalController,
    private _navCtlr: NavController,
    private _store: Store,
    toastCtrl: ToastController,
    translateSvc: TranslateService,
    menuCtrl: MenuController,
    alertCtrl: AlertController,
  ) {
    super(menuCtrl, alertCtrl, translateSvc, toastCtrl);
    this.track$ = this._route.queryParams.pipe(
      switchMap(param => from(this._saveSvc.getTrack(param.track))),
      tap(t => (this.currentTrack = t)),
    );
    this.track$.subscribe(track => console.log(track));
    this.trackDistance$ = this.track$.pipe(map(track => this._geoUtils.getLength(track.geojson)));
    this.trackSlope$ = this.track$.pipe(
      map(track => this._geoUtils.getSlope(track.geojson ?? null)),
    );

    this.trackAvgSpeed$ = this.track$.pipe(
      map(track => this._geoUtils.getAverageSpeed(track.geojson)),
    );
    this.trackTopSpeed$ = this.track$.pipe(map(track => this._geoUtils.getTopSpeed(track.geojson)));
    this.trackTime$ = this.track$.pipe(
      map(track => GeoutilsService.formatTime(this._geoUtils.getTime(track.geojson))),
    );
  }

  delete(): void {
    super.delete('ATTENZIONE', 'Sei sicuro di voler cancellare questa traccia?', () =>
      this.deleteAction(),
    );
  }

  deleteAction(): void {
    this._saveSvc
      .deleteTrack(this.currentTrack)
      .pipe(
        take(1),
        switchMap(_ => from(this.presentToast())),
      )
      .subscribe(() => {
        this._navCtlr.navigateForward('tracklist');
      });
  }

  async edit(): Promise<void> {
    const modal = await this._modalCtrl.create({
      component: ModalSaveComponent,
      componentProps: {
        track: this.currentTrack,
        photos: this.photos,
      },
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    if (!res.data.dismissed) {
      const track: ITrack = Object.assign(this.currentTrack, res.data.trackData);
      await this._saveSvc.updateTrack(track);
    }
  }

  menu(): void {
    this._menuCtrl.enable(true, 'optionMenu');
    this._menuCtrl.open('optionMenu');
  }

  presentToast(): Observable<void> {
    return super.presentToast('Foto correttamente cancellata');
  }
}
