import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {MenuController, ModalController} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';
import {GeoutilsService} from 'src/app/services/geoutils.service';
import {IPhotoItem} from 'src/app/services/photo.service';
import {SaveService} from 'src/app/services/save.service';
import {ITrack} from 'src/app/types/track';
import {ModalSaveComponent} from '../register/modal-save/modal-save.component';

@Component({
  selector: 'webmapp-trackdetail',
  templateUrl: './trackdetail.page.html',
  styleUrls: ['./trackdetail.page.scss'],
})
export class TrackdetailPage implements OnInit {
  track$: BehaviorSubject<ITrack | null> = new BehaviorSubject(null);

  public trackTime = {hours: 0, minutes: 0, seconds: 0};
  public trackDistance: number;
  public trackSlope: number;
  public trackAvgSpeed: number;
  public trackTopSpeed: number;

  public photos: IPhotoItem[] = [];

  public sliderOptions: any = {
    slidesPerView: 2.5,
  };

  constructor(
    private _route: ActivatedRoute,
    private _menuController: MenuController,
    private _geoUtils: GeoutilsService,
    private _saveService: SaveService,
    private _modalController: ModalController,
    private _sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this._route.queryParams.subscribe(async params => {
      const track = await this._saveService.getTrack(params.track);
      console.log(
        '------- ~ file: trackdetail.page.ts ~ line 35 ~ TrackdetailPage ~ this.track',
        track,
      );
      this.trackDistance = this._geoUtils.getLength(track.geojson);
      this.trackSlope = this._geoUtils.getSlope(track.geojson);
      this.trackAvgSpeed = this._geoUtils.getAverageSpeed(track.geojson);
      this.trackTopSpeed = this._geoUtils.getTopSpeed(track.geojson);
      this.trackTime = GeoutilsService.formatTime(this._geoUtils.getTime(track.geojson));
      console.log(track);
      this.track$.next(track);
    });
  }
  sanitize(url: string) {
    return this._sanitizer.bypassSecurityTrustUrl(url);
  }
  menu() {
    this._menuController.enable(true, 'optionMenu');
    this._menuController.open('optionMenu');
  }

  closeMenu() {
    this._menuController.close('optionMenu');
  }

  async edit() {
    const modal = await this._modalController.create({
      component: ModalSaveComponent,
      componentProps: {
        track: this.track$.value,
        photos: this.photos,
      },
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    console.log(
      '------- ~ file: trackdetail.page.ts ~ line 88 ~ TrackdetailPage ~ edit ~ res',
      res,
    );

    if (!res.data.dismissed) {
      const track: ITrack = Object.assign(this.track$.value, res.data.trackData);

      await this._saveService.updateTrack(track);

      this.track$.next(track);

      //await this.openModalSuccess(track);
    }
  }

  getPhoto(photo: IPhotoItem): string {
    if (photo.rawData) {
      return photo.rawData;
    } else {
      return photo.datasrc;
    }
  }
}
