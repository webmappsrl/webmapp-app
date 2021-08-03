import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'webmapp-profile-records',
  templateUrl: './profile-records.component.html',
  styleUrls: ['./profile-records.component.scss'],
})
export class ProfileRecordsComponent implements OnInit {

  constructor(
    private navController: NavController,
    private _router: Router
  ) { }

  ngOnInit() { }

  open(section) {
    switch (section) {
      case 'tracks':
        this._router.navigate(['tracklist']);
        break;
      case 'photos':
        this._router.navigate(['photolist']);
        break;
      case 'waypoints':
        this._router.navigate(['waypointlist']);
        break;
      case 'vocals':
        this._router.navigate(['vocallist']);
        break;
    }
  }

}
