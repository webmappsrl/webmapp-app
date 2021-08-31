import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import { GeohubService } from 'src/app/services/geohub.service';

@Component({
  selector: 'webmapp-map-track-card',
  templateUrl: './map-track-card.component.html',
  styleUrls: ['./map-track-card.component.scss'],
})
export class MapTrackCardComponent implements OnInit {


  @Input('track') track: CGeojsonLineStringFeature;

  @Output() close = new EventEmitter();
  @Output() openClick = new EventEmitter();

  constructor(
    private _geohubService: GeohubService
  ) { }

  ngOnInit() {

  }

  async setFavourite() {
    await this._geohubService.setFavouriteTrack(this.track.properties.id, !this.track.properties.isFavourite);
    this.track.properties.isFavourite = !this.track.properties.isFavourite;
  }

  exit() {
    this.close.emit()
  }

  open(){    
    this.openClick.emit()
  }

}
