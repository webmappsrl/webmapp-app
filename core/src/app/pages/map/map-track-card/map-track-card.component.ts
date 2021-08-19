import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';

@Component({
  selector: 'webmapp-map-track-card',
  templateUrl: './map-track-card.component.html',
  styleUrls: ['./map-track-card.component.scss'],
})
export class MapTrackCardComponent implements OnInit {


  @Input('track') track: CGeojsonLineStringFeature;

  @Output() close = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  exit() {
    this.close.emit()
  }

}
