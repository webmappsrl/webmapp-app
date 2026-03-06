import {Component, EventEmitter, Input, Output} from '@angular/core';
import {WmFeature, WmFeatureCollection} from '@wm-types/feature';
import {LineString} from 'geojson';

@Component({
  standalone: false,
  selector: 'webmapp-card-track',
  templateUrl: './card-track.component.html',
  styleUrls: ['./card-track.component.scss'],
})
export class CardTrackComponent {
  @Input('isDownload') isDownload: boolean = false;
  @Input('track') track: WmFeature<LineString>;
  @Output('open') openClick: EventEmitter<WmFeature<LineString>> =
    new EventEmitter<WmFeature<LineString>>();
  @Output('remove') removeClick: EventEmitter<WmFeature<LineString>> =
    new EventEmitter<WmFeature<LineString>>();

  open(): void {
    this.openClick.emit(this.track);
  }

  remove(): void {
    this.removeClick.emit(this.track);
  }
}
