import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-card-track',
  templateUrl: './card-track.component.html',
  styleUrls: ['./card-track.component.scss'],
})
export class CardTrackComponent implements OnInit {

  @Input('track') track : IGeojsonFeature;
  @Input('isDownload') isDownload : boolean = false;
  @Output('open') openClick: EventEmitter<IGeojsonFeature> =  new EventEmitter<IGeojsonFeature>();
  @Output('remove') removeClick: EventEmitter<IGeojsonFeature> =  new EventEmitter<IGeojsonFeature>();
  
  constructor() { }

  ngOnInit() {}

  open(){
    this.openClick.emit(this.track);
  }

  remove(){
    this.removeClick.emit(this.track);
  }

}
