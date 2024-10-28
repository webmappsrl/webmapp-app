import {Component, EventEmitter, Input, Output} from '@angular/core';
import {WmFeatureCollection} from '@wm-types/feature';

@Component({
  selector: 'webmapp-card-track',
  templateUrl: './card-track.component.html',
  styleUrls: ['./card-track.component.scss'],
})
export class CardTrackComponent {
  @Input('isDownload') isDownload: boolean = false;
  @Input('track') track: WmFeatureCollection;
  @Output('open') openClick: EventEmitter<WmFeatureCollection> =
    new EventEmitter<WmFeatureCollection>();
  @Output('remove') removeClick: EventEmitter<WmFeatureCollection> =
    new EventEmitter<WmFeatureCollection>();

  open(): void {
    this.openClick.emit(this.track);
  }

  remove(): void {
    this.removeClick.emit(this.track);
  }
}
