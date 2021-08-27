import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { GeohubService } from 'src/app/services/geohub.service';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeature, iLocalString } from 'src/app/types/model';

@Component({
  selector: 'webmapp-card-big',
  templateUrl: './card-big.component.html',
  styleUrls: ['./card-big.component.scss'],
})
export class CardBigComponent implements OnInit {
  public imageUrl: string;
  public title: iLocalString;
  public where: any;

  private _item: IGeojsonFeature;

  constructor(
    private navCtrl: NavController,
    private _statusService: StatusService,
    private _geoHubService: GeohubService
  ) { }

  @Input('item') set item(value: IGeojsonFeature) {
    this._item = value;
    this.title = value.properties.name;
    if (value.properties.feature_image && value.properties.feature_image.url) {
      this.imageUrl = value.properties.feature_image.url;
    }
    this._setTaxonomy(value);
  }

  ngOnInit(
  ) { }

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
       const taxonomy  = await this._geoHubService.getWhereTaxonomy(id);
       this.where = taxonomy.name;
      }
  }
}
