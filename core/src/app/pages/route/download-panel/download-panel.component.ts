import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DownloadService } from 'src/app/download.service';
import { StatusService } from 'src/app/services/status.service';
import { DownloadStatus } from 'src/app/types/download';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-download-panel',
  templateUrl: './download-panel.component.html',
  styleUrls: ['./download-panel.component.scss'],
})
export class DownloadPanelComponent implements OnInit {

  public track: IGeojsonFeature;
  public isInit = true;
  public isDownloading = false;
  public isDownloaded = false;

  public downloadElements;

  constructor(
    private _statusService: StatusService,
    private _downloadService :  DownloadService
  ) { }

  async ngOnInit() {
    setTimeout(() => {      
      this.track = this._statusService.route;  
      if(this._downloadService.isDownloadedTrack(this.track.properties.id)){
        this.gotoDownloads();
      }
    }, 500);

  }

  start() {
    this.isInit = false;
    this.isDownloading = true;
    this.isDownloaded = false;

    this._downloadService.onChangeStatus.subscribe(x=>{
      this.updateStatus(x);
    })

    this._downloadService.startDownload(this.track.properties.id);
    this.updateStatus(null);
  }

  updateStatus(status : DownloadStatus){
    console.log("------- ~ DownloadPanelComponent ~ updateStatus ~ status", status);
    this.downloadElements = [
      {
        name: 'downsetup',
        value: status? status.setup : 0
      },
      {
        name: 'downmap',
        value: status? status.map : 0
      },
      {
        name: 'downdata',
        value: status? status.data : 0
      },
      {
        name: 'downmedia',
        value: status? status.media : 0
      },
      {
        name: 'install',
        value: status? status.install : 0
      }
    ]
    if(status && status.finish){
      this.gotoDownloads();
    }
  }


  gotoDownloads() {

    this._downloadService.onChangeStatus.unsubscribe();

    this.isInit = false;
    this.isDownloading = false;
    this.isDownloaded = true;
  }

}
