import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { IPhotoItem } from 'src/app/services/photo.service';
import { SaveService } from 'src/app/services/save.service';
import { ITrack } from 'src/app/types/track';
import { ModalSaveComponent } from '../register/modal-save/modal-save.component';

@Component({
  selector: 'webmapp-trackdetail',
  templateUrl: './trackdetail.page.html',
  styleUrls: ['./trackdetail.page.scss'],
})
export class TrackdetailPage implements OnInit {
  public track: ITrack;

  public trackTime = { hours: 0, minutes: 0, seconds: 0 };
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
    private _modalController: ModalController
  ) {}

  ngOnInit() {
    this._route.queryParams.subscribe(async (params) => {
      const t = JSON.parse(params.track);
      this.track = await this._saveService.getTrack(t.key);
      console.log(
        '------- ~ file: trackdetail.page.ts ~ line 35 ~ TrackdetailPage ~ this.track',
        this.track
      );
      this.trackDistance = this._geoUtils.getLength(this.track.geojson);
      this.trackSlope = this._geoUtils.getSlope(this.track.geojson);
      this.trackAvgSpeed = this._geoUtils.getAverageSpeed(this.track.geojson);
      this.trackTopSpeed = this._geoUtils.getTopSpeed(this.track.geojson);
      this.trackTime = GeoutilsService.formatTime(
        this._geoUtils.getTime(this.track.geojson)
      );

      this.getPhotos();
    });
  }

  async getPhotos() {
    this.photos = await this._saveService.getTrackPhotos(this.track);
    console.log(
      '------- ~ file: trackdetail.page.ts ~ line 63 ~ TrackdetailPage ~ getPhotos ~ this.photos',
      this.photos
    );
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
        track: this.track,
        photos: this.photos,
      },
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    console.log(
      '------- ~ file: trackdetail.page.ts ~ line 88 ~ TrackdetailPage ~ edit ~ res',
      res
    );

    if (!res.data.dismissed) {
      const track: ITrack = Object.assign(this.track, res.data.trackData);

      await this._saveService.updateTrack(track);

      //await this.openModalSuccess(track);
    }
  }
}
