import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Optional,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

import {DownloadStatus} from 'src/app/types/download';
import {downloadPanelStatus} from 'src/app/types/downloadpanel.enum';
import {LineString, MultiPolygon} from 'geojson';
import {downloadEcTrack} from '@wm-core/utils/localForage';
import {WmFeature} from '@wm-types/feature';
import {Store} from '@ngrx/store';
import {POSTHOG_CLIENT} from '@wm-core/store/conf/conf.token';
import {WmPosthogClient} from '@wm-types/posthog';
import {
  goToHome,
  openDownloads,
  setEnableTilesDownload,
} from '@wm-core/store/user-activity/user-activity.action';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {downloadOverlay, downloadTilesByBoundingBox} from '@map-core/utils';
import {currentHitmapFeature} from '@wm-core/store/user-activity/user-activity.selector';
import {take} from 'rxjs/operators';
import {from} from 'rxjs';
import {loadBoundingBoxes} from '@map-core/store/map-core.actions';
import {confMAP} from '@wm-core/store/conf/conf.selector';
@Component({
  standalone: false,
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
  @Input() boundingBox: WmFeature<MultiPolygon>;
  @Output('changeStatus') changeStatus: EventEmitter<downloadPanelStatus> =
    new EventEmitter<downloadPanelStatus>();
  @Output('closeDownload') closeDownload: EventEmitter<any> = new EventEmitter<any>();
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
    @Optional() @Inject(POSTHOG_CLIENT) private _posthogClient?: WmPosthogClient,
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
    } else if (this.boundingBox != null) {
      this._store.dispatch(setEnableTilesDownload({enableTilesDownload: true}));
      this.closeDownload.emit();
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

    this._store
      .select(confMAP)
      .pipe(take(1))
      .subscribe(map => {
        const firstEntry = map?.tiles?.[0];
        const firstEntryKey = firstEntry ? Object.keys(firstEntry)[0] : null;
        // TODO: dovrà essere gestito per scaricare le tiles del tipo selezionato o eventualmente di poter scegliere quale scaricare
        const tileUrlTemplate = firstEntry ? Object.values(firstEntry)[0] : null;
        
        // TODO: andrà gestita con un parametro delle tiles se è possibile o meno fare il download
        if (firstEntryKey === 'satellite') {
          console.error(
            'downloadPanel: confMAP.tiles[0] is "satellite", download not allowed. Aborting.',
          );
          return;
        }

        if (this.track != null) {
          if (!tileUrlTemplate) {
            console.error('downloadPanel: confMAP.tiles[0] is missing, aborting track download');
          } else {
            if (this._posthogClient) {
              this._posthogClient.capture('trackDownloaded', {
                track_id: `${this.track.properties.id}`,
              });
            }
            downloadEcTrack(
              `${this.track.properties.id}`,
              this.track,
              this.updateStatus.bind(this),
              tileUrlTemplate,
            );
          }
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
        if (this.boundingBox != null) {
          if (!tileUrlTemplate) {
            console.error(
              'downloadPanel: confMAP.tiles[0] is missing, aborting bounding box tiles download',
            );
            return;
          }
          this.status = {finish: false, map: 0};
          from(
            downloadTilesByBoundingBox(
              this.boundingBox,
              tileUrlTemplate,
              this.updateStatus.bind(this),
            ),
          )
            .pipe(take(1))
            .subscribe(() => this._store.dispatch(loadBoundingBoxes()));
        }
      });
  }

  updateStatus(status: DownloadStatus): void {
    this.status = {...this.status, ...status};
    const statusKeys = Object.keys(this.status).filter(k => k != 'finish');
    this.downloadElements = statusKeys.map(key => ({
      name: `down${key}`,
      value: this.status[key],
    }));

    // Verifica se tutti i valori di status (escluso finish e size) sono uguali a 1
    const allComplete = statusKeys
      .filter(key => key !== 'size')
      .every(key => this.status[key] === 1);
    if (allComplete) {
      this.status.finish = true;
      this.completeDownloads();
    }

    this._cdr.detectChanges();
  }
}
