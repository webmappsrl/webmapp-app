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

  public tracks: IGeojsonFeatureDownloaded[] = [];

  public selected: IGeojsonFeatureDownloaded[] = [];


  public isSelectedActive = false;

  constructor(
    private _downloadService: DownloadService,
    private _statusService: StatusService,
    private _navController: NavController
  ) { }

  async ngOnInit() {
    this.tracks = await this._downloadService.getDownloadedTracks();
  }

  open(track: IGeojsonFeatureDownloaded) {
    this._statusService.route = track;
    this._navController.navigateForward('/route');
  }

  select(ev, track) {
    if (ev.detail.checked) {
      this.selected.push(track);
    } else {
      this.selected.splice(this.selected.indexOf(track), 1);
    }
  }

  deleteSelected() {
    console.log("------- ~ DownloadlistPage ~ deleteSelected ~ deleteSelected", this.selected);
    this.selected.forEach(track => {
      this.remove(track);
    });
    this.isSelectedActive = false;
  }

  async remove(track: IGeojsonFeatureDownloaded) {
    await this._downloadService.removeDownload(track.properties.id);
    const idx = this.tracks.findIndex(x => x.properties.id == track.properties.id);
    this.tracks.splice(idx, 1);
  }

  gotoMap(){
    this._navController.navigateForward('/map');
  }

}
