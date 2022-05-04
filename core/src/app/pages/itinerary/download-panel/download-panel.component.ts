import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {filter, switchMap, take, tap} from 'rxjs/operators';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {DownloadService} from 'src/app/services/download.service';
import {StatusService} from 'src/app/services/status.service';
import {IMapRootState} from 'src/app/store/map/map';
import {mapCurrentTrack} from 'src/app/store/map/map.selector';
import {DownloadStatus} from 'src/app/types/download';
import {downloadPanelStatus} from 'src/app/types/downloadpanel.enum';
import {IGeojsonFeature} from 'src/app/types/model';

@Component({
  selector: 'webmapp-download-panel',
  templateUrl: './download-panel.component.html',
  styleUrls: ['./download-panel.component.scss'],
})
export class DownloadPanelComponent {
  public track: IGeojsonFeature;
  public isInit = true;
  public isDownloading = false;
  public isDownloaded = false;

  public downloadElements;

  private myEventSubscription;

  private _currentTrack$: Observable<CGeojsonLineStringFeature> =
    this._storeMap.select(mapCurrentTrack);

  @Output('exit') exit: EventEmitter<any> = new EventEmitter<any>();
  @Output('changeStatus') changeStatus: EventEmitter<downloadPanelStatus> =
    new EventEmitter<downloadPanelStatus>();

  constructor(
    private _statusService: StatusService,
    private _downloadService: DownloadService,
    private _navController: NavController,
    private _storeMap: Store<IMapRootState>,
  ) {
    this._currentTrack$
      .pipe(
        filter(f => f != null),
        take(1),
        tap(t => (this.track = t)),
        switchMap(t => this._downloadService.isDownloadedTrack(t.properties.id)),
      )
      .subscribe(res => {
        if (this.track && res) {
          this.completeDownloads();
        }
      });
    this.changeStatus.emit(downloadPanelStatus.INITIALIZE);
  }

  start() {
    // console.log("------- ~ DownloadPanelComponent ~ start ~ start");
    this.isInit = false;
    this.isDownloading = true;
    this.isDownloaded = false;

    this.changeStatus.emit(downloadPanelStatus.DOWNLOADING);

    this.updateStatus(null);
    this.myEventSubscription = this._downloadService.onChangeStatus.subscribe(x => {
      this.updateStatus(x);
    });

    this._downloadService.startDownload(this.track);
    // this.updateStatus(null);
  }

  updateStatus(status: DownloadStatus) {
    this.downloadElements = [
      {
        name: 'downsetup',
        value: status ? status.setup : 0,
      },
      {
        name: 'downmap',
        value: status ? status.map : 0,
      },
      {
        name: 'downdata',
        value: status ? status.data : 0,
      },
      {
        name: 'downmedia',
        value: status ? status.media : 0,
      },
      {
        name: 'install',
        value: status ? status.install : 0,
      },
    ];
    if (status && status.finish) {
      this.completeDownloads();
    }
  }
  gotoDownloads() {
    this._navController.navigateForward(['/downloadlist']);
    this.exit.emit(null);
  }

  completeDownloads() {
    if (this.myEventSubscription) {
      this.myEventSubscription.unsubscribe();
    }
    this.changeStatus.emit(downloadPanelStatus.FINISH);

    this.isInit = false;
    this.isDownloading = false;
    this.isDownloaded = true;
  }
}
