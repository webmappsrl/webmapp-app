import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'webmapp-page-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public loggedIn: boolean;
  public loggedOutSliderOptions: any;

  constructor() {
    this.loggedOutSliderOptions = {
      initialSlide: 0,
      speed: 400,
      spaceBetween: 10,
      slidesOffsetAfter: 0,
      slidesOffsetBefore: 0,
      slidesPerView: 1,
    };
  }

  ngOnInit() {}
}
