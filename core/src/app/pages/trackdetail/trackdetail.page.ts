import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { PhotoItem } from 'src/app/services/photo.service';
import { SaveService } from 'src/app/services/save.service';
import { Track } from 'src/app/types/track.d.';
import { ModalSaveComponent } from '../register/modal-save/modal-save.component';

@Component({
  selector: 'webmapp-trackdetail',
  templateUrl: './trackdetail.page.html',
  styleUrls: ['./trackdetail.page.scss'],
})
export class TrackdetailPage implements OnInit {

  public track: Track;

  public trackTime = { hours: 0, minutes: 0, seconds: 0 };;
  public trackDistance: number;
  public trackSlope: number;
  public trackAvgSpeed: number;
  public trackTopSpeed: number;

  public photos: PhotoItem[] = [];

  public sliderOptions: any = {
    slidesPerView: 2.5,
  };


  constructor(
    private route: ActivatedRoute,
    private menuController: MenuController,
    private geoUtils: GeoutilsService,
    private saveService: SaveService,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const t = JSON.parse(params['track']);
      this.track = await this.saveService.getTrack(t.key);
      this.trackDistance = this.geoUtils.getLength(this.track.geojson);
      this.trackSlope = this.geoUtils.getSlope(this.track.geojson);
      this.trackAvgSpeed = this.geoUtils.getAverageSpeed(this.track.geojson);
      this.trackTopSpeed = this.geoUtils.getTopSpeed(this.track.geojson);
      this.trackTime = GeoutilsService.formatTime(this.geoUtils.getTime(this.track.geojson));

      this.getPhotos();
    });

  }

  async getPhotos() {
    this.photos = await this.saveService.getTrackPhotos(this.track);
    }

  menu() {
    this.menuController.enable(true, 'optionMenu');
    this.menuController.open('optionMenu');
  }

  closeMenu() {
    this.menuController.close('optionMenu');
  }

  async edit() {

    const modal = await this.modalController.create({
      component: ModalSaveComponent,
      componentProps: {
        track: this.track,
        photos: this.photos
      }
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    
    if (!res.data.dismissed) {
      const track: Track = Object.assign(this.track, res.data.trackData);
      
      await this.saveService.updateTrack(track);

      //await this.openModalSuccess(track);

    }


  }

}
