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
import {IPhotoItem} from 'src/app/services/photo.service';
import {SaveService} from 'src/app/services/save.service';
import {ITrack} from 'src/app/types/track';
import {ModalSaveComponent} from '../register/modal-save/modal-save.component';
import {TranslateService} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import {confMAP} from 'wm-core/store/conf/conf.selector';
import {Share} from '@capacitor/share';

import {Filesystem, Directory, Encoding, FilesystemEncoding} from '@capacitor/filesystem';
@Component({
  selector: 'wm-trackdetail',
  templateUrl: './trackdetail.page.html',
  styleUrls: ['./trackdetail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackdetailPage {
  confMap$: Observable<any> = this._store.select(confMAP);
  currentTrack: ITrack;
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
    private _alertCtrl: AlertController,
    private _translateSvc: TranslateService,
    private _navCtlr: NavController,
    private _toastCtrl: ToastController,
    private _store: Store,
  ) {
    this.track$ = this._route.queryParams.pipe(
      switchMap(param => from(this._saveSvc.getTrack(param.track))),
      tap(t => (this.currentTrack = t)),
    );
    this.trackDistance$ = this.track$.pipe(map(track => this._geoUtils.getLength(track.geojson)));
    this.trackSlope$ = this.track$.pipe(map(track => this._geoUtils.getSlope(track.geojson)));
    this.trackAvgSpeed$ = this.track$.pipe(
      map(track => this._geoUtils.getAverageSpeed(track.geojson)),
    );
    this.trackTopSpeed$ = this.track$.pipe(map(track => this._geoUtils.getTopSpeed(track.geojson)));
    this.trackTime$ = this.track$.pipe(
      map(track => GeoutilsService.formatTime(this._geoUtils.getTime(track.geojson))),
    );
  }

  closeMenu(): void {
    this._menuCtrl.close('optionMenu');
  }

  delete(): void {
    from(
      this._alertCtrl.create({
        cssClass: 'my-custom-class',
        header: this._translateSvc.instant('ATTENZIONE'),
        message: this._translateSvc.instant('Sei sicuro di voler cancellare questa traccia?'),
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
    return from(
      this._toastCtrl.create({
        message: this._translateSvc.instant('Foto correttamente cancellata'),
        duration: 1500,
        position: 'bottom',
      }),
    ).pipe(switchMap(t => t.present()));
  }

  async saveFileCallback(data, format, track) {
    const name = (track != null && track.title) ?? 'export';
    const fileName = `${name}.${format}`;
    try {
      // Scrivi il file nel filesystem
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      // Prepara il file per la condivisione
      const fileUrl = writeResult.uri;

      // Apri il menu di condivisione
      await Share.share({
        title: `Condividi il file ${fileName}`,
        url: fileUrl,
        dialogTitle: `Condividi il tuo file ${fileName}`,
      });
    } catch (e) {
      console.error("Errore durante l'esportazione e la condivisione:", e);
    }
  }
}
