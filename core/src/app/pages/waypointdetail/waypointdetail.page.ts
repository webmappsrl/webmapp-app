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
    private route: ActivatedRoute,
    private menuController: MenuController
  ) {
    this.route.queryParams.subscribe(params => {
      this.waypoint = JSON.parse(params['waypoint']);
    });
  }

  ngOnInit() {
    this.displayPosition = this.waypoint.displayPosition;
  }

  menu() {
    this.menuController.enable(true, 'optionMenu');
    this.menuController.open('optionMenu');
  }

  closeMenu() {
    this.menuController.close('optionMenu');
  }

}
