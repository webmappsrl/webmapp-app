import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature, IGeojsonPoi, IGeojsonPoiDetailed } from 'src/app/types/model';
import { Plugins } from '@capacitor/core';
import { DownloadService } from 'src/app/services/download.service';

const { Browser } = Plugins;

@Component({
  selector: 'app-poi',
  templateUrl: './poi.page.html',
  styleUrls: ['./poi.page.scss'],
})
export class PoiPage implements OnInit {

  public route: IGeojsonFeature;
  public pois: Array<IGeojsonPoiDetailed>;
  public selectedPoi: IGeojsonPoiDetailed;
  public track;

  public useCache = false;

  public useAnimation = false;

  public poiIdx: number;

  private cache = {};

  public sliderOptions: any = {
    slidesPerView: 2.2,
  };

  constructor(
    private _statusService: StatusService,
    private _navController: NavController,
    private downloadService: DownloadService,
    private download: DownloadService
  ) { }

  async ngOnInit() {
    this.route = this._statusService.route;
    this.pois = this._statusService.getRelatedPois();
    this.selectPoiById(this._statusService.getSelectedPoiId());
    
    this.useCache = await this.downloadService.isDownloadedTrack(this.route.properties.id);

    setTimeout(() => {
      this.track = this.route.geometry;
      this.updatePoiMarkers();
    }, 0);

    setTimeout(() => {
      this.useAnimation = true;
    }, 1000);
  }


  back() {
    this._navController.back();
  }

  private updatePoiMarkers() {
    const res = [];
    this.pois.forEach(poi => {
      poi.isSmall = true; // poi != this.selectedPoi;
      res.push(poi);
    });
    this.pois = res;
  }

  async clickPoi(poi: IGeojsonPoi) {
    this.selectPoi(poi)
    // this.updatePoiMarkers();
  }

  prevPoi() {
    this.selectPoi(this.pois[(this.poiIdx + this.pois.length - 1) % this.pois.length]);
  }

  nextPoi() {
    this.selectPoi(this.pois[(this.poiIdx + 1) % this.pois.length]);
  }

  selectPoiById(id: number) {
    const selectedPoi = this.pois.find(p => p.properties.id == id);
    this.selectPoi(selectedPoi)
  }

  selectPoi(poi: IGeojsonPoi) {
    this.selectedPoi = this.pois.find(p => p.properties.id == poi.properties.id);
    this.poiIdx = this.pois.findIndex(p => p.properties.id == poi.properties.id);
    // this.updatePoiMarkers();
  }

  phone(phoneNumber) {
    console.log('------- ~ file: poi.page.ts ~ line 75 ~ PoiPage ~ phone ~ phone', phoneNumber);

  }

  email(email) {
    console.log('------- ~ file: poi.page.ts ~ line 80 ~ PoiPage ~ email ~ email');

  }

  async url(url) {
    console.log('------- ~ file: poi.page.ts ~ line 85 ~ PoiPage ~ url ~ url', url);
    await Browser.open({ url });
  }

  getImage(url) {
    if (this.cache[url] && this.cache[url] != 'waiting') return this.cache[url]
    else {
      if (this.cache[url] !== 'waiting') {
        this.cache[url] = 'waiting';
        this.download.getB64img(url).then(val => {
          this.cache[url] = val;
        })
      }
    }
    return '';
  }



}
