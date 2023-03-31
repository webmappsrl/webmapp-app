import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StorageService} from 'src/app/services/base/storage.service';
import {IGeojsonFeature} from 'src/app/types/model';

@Component({
  selector: 'webmapp-card-track',
  templateUrl: './card-track.component.html',
  styleUrls: ['./card-track.component.scss'],
})
export class CardTrackComponent {
  @Input('isDownload') isDownload: boolean = false;
  @Input('track') track: IGeojsonFeature;
  @Output('open') openClick: EventEmitter<IGeojsonFeature> = new EventEmitter<IGeojsonFeature>();
  @Output('remove') removeClick: EventEmitter<IGeojsonFeature> =
    new EventEmitter<IGeojsonFeature>();

  getStorageImage = (url: string) => {
    return this._storageSvc.getImage(url) as Promise<any>;
  };

  constructor(private _storageSvc: StorageService) {}

  open(): void {
    this.openClick.emit(this.track);
  }

  remove(): void {
    this.removeClick.emit(this.track);
  }
}
