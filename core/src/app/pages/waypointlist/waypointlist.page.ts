import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { SaveService } from 'src/app/services/save.service';
import { WaypointSave } from 'src/app/types/waypoint';

@Component({
  selector: 'webmapp-waypointlist',
  templateUrl: './waypointlist.page.html',
  styleUrls: ['./waypointlist.page.scss'],
})
export class WaypointlistPage implements OnInit {

  public waypoints: WaypointSave[];

  constructor(
    private saveService: SaveService,
    private navController: NavController
  ) { }

  async ngOnInit() {
    this.waypoints = await this.saveService.getWaypoints();
    }

  open(waypoint) {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        waypoint: JSON.stringify(waypoint)
      }
    };
    this.navController.navigateForward('waypointdetail', navigationExtras);
  }

}
