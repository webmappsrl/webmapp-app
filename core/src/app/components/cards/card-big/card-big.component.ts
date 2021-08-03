import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';

@Component({
  selector: 'webmapp-card-big',
  templateUrl: './card-big.component.html',
  styleUrls: ['./card-big.component.scss'],
})
export class CardBigComponent implements OnInit {
  public imageUrl: string;
  public title: string;
  public subtitle: string;

  private _id: string;

  constructor(
    private navCtrl: NavController
  ) { }

  @Input('id') set id(value: string) {
    this._id = value;
    this.title = 'Al lago delle Malghette';
    this.subtitle = 'Trentino alto adige';
    this.imageUrl = '/assets/icon/icon.png';
  }

  ngOnInit() { }

  open() {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        id: this._id
      }
    };
    this.navCtrl.navigateForward('route', navigationExtras);
  }
}
