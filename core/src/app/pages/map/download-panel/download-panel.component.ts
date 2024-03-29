import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {DownloadService} from 'src/app/services/download.service';
import {DownloadStatus} from 'src/app/types/download';
import {downloadPanelStatus} from 'src/app/types/downloadpanel.enum';

@Component({
  selector: 'wm-download-panel',
  templateUrl: './download-panel.component.html',
  styleUrls: ['./download-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WmDownloadPanelComponent implements OnChanges {
  public isInit = true;
  public isDownloading = false;
  public isDownloaded = false;

  public downloadElements;

  private myEventSubscription;

  @Input() track: CGeojsonLineStringFeature;

  @Output('exit') exit: EventEmitter<any> = new EventEmitter<any>();
  @Output('changeStatus') changeStatus: EventEmitter<downloadPanelStatus> =
    new EventEmitter<downloadPanelStatus>();

  constructor(private _downloadSvc: DownloadService, private _cdr: ChangeDetectorRef) {
    this.changeStatus.emit(downloadPanelStatus.INITIALIZE);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.track != null && changes.track.currentValue != null) {
      this.start();
    }
  }
  start() {
    this.isInit = false;
    this.isDownloading = true;
    this.isDownloaded = false;

    this.changeStatus.emit(downloadPanelStatus.DOWNLOADING);

    this.updateStatus(null);
    this.myEventSubscription = this._downloadSvc.onChangeStatus.subscribe(x => {
      this.updateStatus(x);
    });

    this._downloadSvc.startDownload(this.track);
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
    this._cdr.detectChanges();
  }
  gotoDownloads() {
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
