import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MenuController, ModalController} from '@ionic/angular';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {IPhotoItem} from 'src/app/services/photo.service';
import {SaveService} from 'src/app/services/save.service';
import {ITrack} from 'src/app/types/track';
import {ModalSaveComponent} from '../register/modal-save/modal-save.component';

@Component({
  selector: 'wm-trackdetail',
  templateUrl: './trackdetail.page.html',
  styleUrls: ['./trackdetail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackdetailPage {
  public photos: IPhotoItem[] = [];
  public sliderOptions: any = {
    slidesPerView: 2.5,
  };
  track$: Observable<ITrack>;
  currentTrack: ITrack;
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
      // this.track$.next(track);
    }
  }

  getPhoto(photo: IPhotoItem): string {
    if (photo.rawData) {
      return photo.rawData;
    } else {
      return photo.datasrc;
    }
  }

  menu(): void {
    this._menuCtrl.enable(true, 'optionMenu');
    this._menuCtrl.open('optionMenu');
  }
}
