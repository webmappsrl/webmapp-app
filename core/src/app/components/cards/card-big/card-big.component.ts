import { Component, Input, OnInit } from '@angular/core';

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

  constructor() {}

  @Input('id') set id(value: string) {
    this._id = value;
    this.title = 'Al lago delle Malghette';
    this.subtitle = 'Trentino alto adige';
    this.imageUrl = '/assets/icon/icon.png';
  }

  ngOnInit() {}
}
