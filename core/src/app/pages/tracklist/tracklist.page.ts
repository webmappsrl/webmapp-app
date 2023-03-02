import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {SaveService} from 'src/app/services/save.service';
import {ITrack} from 'src/app/types/track';

@Component({
  selector: 'webmapp-tracklist',
  templateUrl: './tracklist.page.html',
  styleUrls: ['./tracklist.page.scss'],
})
export class TracklistPage implements OnInit {
  public tracks: ITrack[];

  constructor(private _saveService: SaveService, private _navController: NavController) {}

  async ngOnInit() {
    this.tracks = await this._saveService.getTracks();
    console.log(
      '------- ~ file: tracklist.page.ts ~ line 23 ~ TracklistPage ~ ngOnInit ~ this.tracks',
      this.tracks,
    );
  }

  open(track) {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        track: track.key,
      },
    };
    this._navController.navigateForward('trackdetail', navigationExtras);
  }
}
