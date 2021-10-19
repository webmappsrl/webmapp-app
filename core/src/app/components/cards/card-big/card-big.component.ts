import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { GeohubService } from 'src/app/services/geohub.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature, iLocalString } from 'src/app/types/model';

@Component({
  selector: 'webmapp-card-big',
  templateUrl: './card-big.component.html',
  styleUrls: ['./card-big.component.scss'],
})
export class CardBigComponent implements OnInit {
  @Input('showDistance') showDistance: boolean;

  public imageUrl: string;
  public title: iLocalString;
  public where: any;

  public distance: number = 0;

  private _item: IGeojsonFeature;

  constructor(
    private navCtrl: NavController,
    private _statusService: StatusService,
    private _geoHubService: GeohubService,
    private geolocationService: GeolocationService,
    private geolocationUtils: GeoutilsService
  ) { }

  @Input('item') set item(value: IGeojsonFeature) {
    this._item = value;
    this.title = value.properties.name;
    if (value.properties.feature_image && value.properties.feature_image.url) {
      this.imageUrl = value.properties.feature_image.url;
    }
    this._setTaxonomy(value);
  }

  async ngOnInit(
  ) {
    if (this.showDistance) {
      const loc = await this.geolocationService.location;
      const distance = this.geolocationUtils.getDistance(loc.getLatLng(), this.geolocationUtils.getFirstPoint(this._item.geometry.coordinates))
      if (distance > 10000) {
        this.distance = Math.round(distance / 1000)
      }
      else {
        this.distance = Math.round(distance / 100) / 10
      }
    }
  }

  open() {
    this._statusService.route = this._item;
    // const navigationExtras: NavigationOptions = {
    //   queryParams: {
    //     id: this._id
    //   }
    // };
    // this.navCtrl.navigateForward('route', navigationExtras);
    this.navCtrl.navigateForward('route');
  }


  private async _setTaxonomy(value: IGeojsonFeature) {
    if (value.properties?.taxonomy?.where && value.properties.taxonomy.where.length) {
      let id = value.properties.taxonomy.where[0];
      const taxonomy = await this._geoHubService.getWhereTaxonomy(id);
      this.where = taxonomy.name;
    }
  }
}
