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

import {DownloadStatus} from 'src/app/types/download';
import {downloadPanelStatus} from 'src/app/types/downloadpanel.enum';
import {LineString} from 'geojson';
import {downloadEcTrack} from '@wm-core/utils/localForage';
import {WmFeature} from '@wm-types/feature';
@Component({
  selector: 'wm-download-panel',
  templateUrl: './download-panel.component.html',
  styleUrls: ['./download-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WmDownloadPanelComponent implements OnChanges {
  private _myEventSubscription;

  @Input() track: WmFeature<LineString>;
  @Output('changeStatus') changeStatus: EventEmitter<downloadPanelStatus> =
    new EventEmitter<downloadPanelStatus>();
  @Output('exit') exit: EventEmitter<any> = new EventEmitter<any>();

  downloadElements;
  isDownloaded = false;
  isDownloading = false;
  isInit = true;
  status: DownloadStatus = {finish: false, map: 0, data: 0, media: 0, install: 0};

  constructor(private _cdr: ChangeDetectorRef) {
    this.changeStatus.emit(downloadPanelStatus.INITIALIZE);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.track != null && changes.track.currentValue != null) {
      this.start();
    }
  }

  completeDownloads(): void {
    if (this._myEventSubscription) {
      this._myEventSubscription.unsubscribe();
    }
    this.changeStatus.emit(downloadPanelStatus.FINISH);

    this.isInit = false;
    this.isDownloading = false;
    this.isDownloaded = true;
  }

  gotoDownloads(): void {
    this.exit.emit(null);
  }

  async start() {
    this.isInit = false;
    this.isDownloading = true;
    this.isDownloaded = false;

    this.status = {finish: false, map: 0, data: 0, media: 0, install: 0};
    downloadEcTrack(`${this.track.properties.id}`, this.track, this.updateStatus.bind(this));
  }

  updateStatus(status: DownloadStatus): void {
    this.status = {...this.status, ...status};
    this.downloadElements = [
      {
        name: 'downmap',
        value: this.status ? this.status.map : 0,
      },
      {
        name: 'downmedia',
        value: this.status ? this.status.media : 0,
      },
    ];
    if (this.status && this.status.media === 1 && this.status.map === 1) {
      this.completeDownloads();
    }
    this._cdr.detectChanges();
  }
}
