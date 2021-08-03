import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { SaveService } from 'src/app/services/save.service';
import { Track } from 'src/app/types/track.d.';

@Component({
  selector: 'webmapp-tracklist',
  templateUrl: './tracklist.page.html',
  styleUrls: ['./tracklist.page.scss'],
})
export class TracklistPage implements OnInit {

  public tracks: Track[];

  constructor(
    private saveService: SaveService,
    private navController: NavController
  ) { }

  async ngOnInit() {
    this.tracks = await this.saveService.getTracks();
    }

  open(track) {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        track: JSON.stringify(track)
      }
    };
    this.navController.navigateForward('trackdetail', navigationExtras);
  }

}
