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
import {Store} from '@ngrx/store';
import {goToHome, openDownloads} from '@wm-core/store/user-activity/user-activity.action';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {downloadOverlay} from '@map-core/utils';
import {currentHitmapFeature} from '@wm-core/store/user-activity/user-activity.selector';
import {take} from 'rxjs/operators';
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
  @Input() overlayUrls: {[featureName: string]: string};
  @Input() overlayGeometry: any;
  @Input() overlayXYZ: string = `https://api.webmapp.it/tiles`;
  @Output('changeStatus') changeStatus: EventEmitter<downloadPanelStatus> =
    new EventEmitter<downloadPanelStatus>();
  @Output('exit') exit: EventEmitter<any> = new EventEmitter<any>();

  downloadElements;
  isDownloaded = false;
  isDownloading = false;
  isInit = true;
  status: DownloadStatus = {finish: false, map: 0, data: 0, media: 0, install: 0};

  constructor(
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _urlHandlerSvc: UrlHandlerService,
  ) {
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
    if (this.overlayUrls != null) {
      this._urlHandlerSvc.changeURL('profile');
    } else {
      this._store.dispatch(goToHome());
      this._store.dispatch(openDownloads());
      this._urlHandlerSvc.changeURL('home');
    }
  }

  async start() {
    this.isInit = false;
    this.isDownloading = true;
    this.isDownloaded = false;
    this.status = {finish: false, map: 0, media: 0};

    if (this.track != null) {
      downloadEcTrack(`${this.track.properties.id}`, this.track, this.updateStatus.bind(this));
    }
    if (this.overlayUrls != null || this.overlayGeometry != null) {
      this.status = {finish: false, map: 0, data: 0};
      this._store
        .select(currentHitmapFeature)
        .pipe(take(1))
        .subscribe(current => {
          const properties = current.properties;
          downloadOverlay(current, this.overlayXYZ, this.updateStatus.bind(this));
        });
    }
  }

  updateStatus(status: DownloadStatus): void {
    this.status = {...this.status, ...status};
    const statusKeys = Object.keys(this.status);
    this.downloadElements = statusKeys
      .filter(k => k != 'finish')
      .map(key => ({
        name: `down${key}`,
        value: this.status[key],
      }));

    if (this.status && this.status.finish) {
      this.completeDownloads();
    }
    this._cdr.detectChanges();
  }
}
