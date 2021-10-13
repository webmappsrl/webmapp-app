import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DownloadService } from 'src/app/services/download.service';
import { StatusService } from 'src/app/services/status.service';
import { DownloadStatus } from 'src/app/types/download';
import { downloadPanelStatus } from 'src/app/types/downloadpanel.enum';
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

  @Output('exit') exit: EventEmitter<any> = new EventEmitter<any>();
  @Output('changeStatus') changeStatus: EventEmitter<downloadPanelStatus> = new EventEmitter<downloadPanelStatus>();

  constructor(
    private _statusService: StatusService,
    private _downloadService: DownloadService,
    private _navController: NavController
  ) { }

  async ngOnInit() {
    setTimeout(async () => {
      this.track = this._statusService.route;
      if (this.track && await this._downloadService.isDownloadedTrack(this.track.properties.id)) {
        this.completeDownloads();
      }
    }, 1000);
    this.changeStatus.emit(downloadPanelStatus.INITIALIZE);

  }

  start() {
    this.isInit = false;
    this.isDownloading = true;
    this.isDownloaded = false;

    this.changeStatus.emit(downloadPanelStatus.DOWNLOADING);

    this._downloadService.onChangeStatus.subscribe(x => {
      this.updateStatus(x);
    })

    this._downloadService.startDownload(this.track);
    this.updateStatus(null);
  }

  updateStatus(status: DownloadStatus) {
    this.downloadElements = [
      {
        name: 'downsetup',
        value: status ? status.setup : 0
      },
      {
        name: 'downmap',
        value: status ? status.map : 0
      },
      {
        name: 'downdata',
        value: status ? status.data : 0
      },
      {
        name: 'downmedia',
        value: status ? status.media : 0
      },
      {
        name: 'install',
        value: status ? status.install : 0
      }
    ]
    if (status && status.finish) {
      this.completeDownloads();
    }
  }
  gotoDownloads() {
    this._navController.navigateForward(['/downloadlist']);
    this.exit.emit(null);
  }

  completeDownloads() {
    this._downloadService.onChangeStatus.unsubscribe();
    this.changeStatus.emit(downloadPanelStatus.FINISH);

    this.isInit = false;
    this.isDownloading = false;
    this.isDownloaded = true;
  }

}
