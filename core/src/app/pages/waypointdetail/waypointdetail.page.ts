import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { ILocation } from 'src/app/types/location';
import { WaypointSave } from 'src/app/types/waypoint';

@Component({
  selector: 'webmapp-waypointdetail',
  templateUrl: './waypointdetail.page.html',
  styleUrls: ['./waypointdetail.page.scss'],
})
export class WaypointdetailPage implements OnInit {
  public waypoint: WaypointSave;
  public displayPosition: ILocation;

  constructor(
    private _route: ActivatedRoute,
    private _menuController: MenuController
  ) {
    this._route.queryParams.subscribe((params) => {
      this.waypoint = JSON.parse(params.waypoint);
    });
  }

  ngOnInit() {
    this.displayPosition = this.waypoint.displayPosition;
  }

  menu() {
    this._menuController.enable(true, 'optionMenu');
    this._menuController.open('optionMenu');
  }

  closeMenu() {
    this._menuController.close('optionMenu');
  }
}
