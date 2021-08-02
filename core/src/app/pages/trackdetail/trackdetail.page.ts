import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { PhotoItem } from 'src/app/services/photo.service';
import { SaveService } from 'src/app/services/save.service';
import { Track } from 'src/app/types/track.d.';

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
    private saveService: SaveService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const t = JSON.parse(params['track']);
      this.track = await this.saveService.getTrack(t.key);
      console.log('------- ~ file: trackdetail.page.ts ~ line 35 ~ TrackdetailPage ~ this.track', this.track);
      this.trackDistance = this.geoUtils.getLength(this.track.geojson);
      this.trackSlope = this.geoUtils.getSlope(this.track.geojson);
      this.trackAvgSpeed = this.geoUtils.getAverageSpeed(this.track.geojson);
      this.trackTopSpeed = this.geoUtils.getTopSpeed(this.track.geojson);
      this.trackTime = GeoutilsService.formatTime(this.geoUtils.getTime(this.track.geojson));

      this.getPhotos();
    });

  }

  async getPhotos() {
    const coll = [];
    for (const photoKey of this.track.photos) {
      const photo = await this.saveService.getTrackPhoto(photoKey);
      coll.push(photo);
    }
    this.photos = coll;
    console.log('------- ~ file: trackdetail.page.ts ~ line 63 ~ TrackdetailPage ~ getPhotos ~ this.photos', this.photos);

  }

  menu() {
    this.menuController.enable(true, 'optionMenu');
    this.menuController.open('optionMenu');
  }

  closeMenu() {
    this.menuController.close('optionMenu');
  }

}
