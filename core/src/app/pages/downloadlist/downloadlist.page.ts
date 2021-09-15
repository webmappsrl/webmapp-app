import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DownloadService } from 'src/app/services/download.service';
import { StatusService } from 'src/app/services/status.service';
import { IGeojsonFeatureDownloaded } from 'src/app/types/model';

@Component({
  selector: 'app-downloadlist',
  templateUrl: './downloadlist.page.html',
  styleUrls: ['./downloadlist.page.scss'],
})
export class DownloadlistPage implements OnInit {

  public tracks = [];

  constructor(
    private _downloadService: DownloadService,
    private _statusService:StatusService,
    private _navController:NavController
  ) { }

  async ngOnInit() {
    this.tracks = await this._downloadService.getDownloadedTracks();
  }

  open(track: IGeojsonFeatureDownloaded) {
    this._statusService.route = track;
    this._navController.navigateForward('/route');
  }

  async remove(track: IGeojsonFeatureDownloaded) {    
    await this._downloadService.removeDownload(track.properties.id);
    const idx = this.tracks.findIndex(x => x.properties.id == track.properties.id);
    this.tracks.splice(idx, 1);
  }

}
