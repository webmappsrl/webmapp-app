import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {MenuController, ModalController} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';
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
export class TrackdetailPage implements OnInit {
  public photos: IPhotoItem[] = [];
  public sliderOptions: any = {
    slidesPerView: 2.5,
  };
  track$: BehaviorSubject<ITrack | null> = new BehaviorSubject(null);
  public trackAvgSpeed: number;
  public trackDistance: number;
  public trackSlope: number;
  public trackTime = {hours: 0, minutes: 0, seconds: 0};
  public trackTopSpeed: number;

  constructor(
    private _route: ActivatedRoute,
    private _geoUtils: GeoutilsService,
    private _saveSvc: SaveService,
    private _menuCtrl: MenuController,
    private _modalCtrl: ModalController,
    private _sanitizer: DomSanitizer,
  ) {}

  closeMenu(): void {
    this._menuCtrl.close('optionMenu');
  }

  async edit(): Promise<void> {
    const modal = await this._modalCtrl.create({
      component: ModalSaveComponent,
      componentProps: {
        track: this.track$.value,
        photos: this.photos,
      },
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    if (!res.data.dismissed) {
      const track: ITrack = Object.assign(this.track$.value, res.data.trackData);
      await this._saveSvc.updateTrack(track);
      this.track$.next(track);
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

  ngOnInit(): void {
    this._route.queryParams.subscribe(async params => {
      const track = await this._saveSvc.getTrack(params.track);
      this.trackDistance = this._geoUtils.getLength(track.geojson);
      this.trackSlope = this._geoUtils.getSlope(track.geojson);
      this.trackAvgSpeed = this._geoUtils.getAverageSpeed(track.geojson);
      this.trackTopSpeed = this._geoUtils.getTopSpeed(track.geojson);
      this.trackTime = GeoutilsService.formatTime(this._geoUtils.getTime(track.geojson));
      console.log(track);
      this.track$.next(track);
    });
  }

  sanitize(url: string): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl(url);
  }
}
