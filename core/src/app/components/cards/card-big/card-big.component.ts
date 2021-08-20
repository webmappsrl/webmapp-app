import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
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
  public subtitle: any;

  private _item: IGeojsonFeature;

  constructor(
    private navCtrl: NavController,
    private _statusService: StatusService
  ) { }

  @Input('item') set item(value: IGeojsonFeature) {
    this._item = value;
    this.title = value.properties.name;
    this.subtitle = value.properties.created_at;
    if (value.properties.feature_image  && value.properties.feature_image .url) {
      this.imageUrl = value.properties.feature_image .url;
    }
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
}
