import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'webmapp-page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public ids: Array<string>;
  public ids2: Array<string>;
  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.ids = ['1', '2', '3', '4', '5'];
    }, 2500);
    setTimeout(() => {
      this.ids2 = ['1', '2', '3', '4', '5'];
    }, 4000);
  }
}
