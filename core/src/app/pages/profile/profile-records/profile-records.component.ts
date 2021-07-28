import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'webmapp-profile-records',
  templateUrl: './profile-records.component.html',
  styleUrls: ['./profile-records.component.scss'],
})
export class ProfileRecordsComponent implements OnInit {

  constructor(
    private navController: NavController
  ) { }

  ngOnInit() { }

  open(section) {
    switch (section) {
      case 'tracks':
        this.navController.navigateForward('tracklist');
        break;
      case 'photos':
        this.navController.navigateForward('photolist');
        break;
      case 'waypoints':
        this.navController.navigateForward('waypointlist');
        break;
      case 'vocals':
        this.navController.navigateForward('vocallist');
        break;
    }
  }

}
