import {Component, ChangeDetectionStrategy, Input, ViewEncapsulation} from '@angular/core';
import {StorageService} from 'src/app/services/base/storage.service';
@Component({
  selector: 'wm-track-properties',
  templateUrl: './track-properties.component.html',
  styleUrls: ['./track-properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackPropertiesComponent {
  @Input() track;

  constructor(private _storageSvc: StorageService) {}
  getStorageImage = (url: string) => {
    return this._storageSvc.getImage(url) as Promise<any>;
  };
}
