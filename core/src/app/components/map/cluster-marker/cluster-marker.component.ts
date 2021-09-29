import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeohubService } from 'src/app/services/geohub.service';
import { IGeojsonCluster } from 'src/app/types/model';

@Component({
  selector: 'webmapp-cluster-marker',
  templateUrl: './cluster-marker.component.html',
  styleUrls: ['./cluster-marker.component.scss'],
})
export class ClusterMarkerComponent implements OnInit {

  // public static markerSize = 100;

  @Output('clickcluster') clickcluster: EventEmitter<IGeojsonCluster> =
    new EventEmitter<IGeojsonCluster>();

  public img1: string;
  public img2: string;
  public img3: string;
  public count: number;
  public id: string;
  public isFavourite: boolean = false;
  private _item: IGeojsonCluster;

  @Input('item') set item(value: IGeojsonCluster) {
    this._item = value;
    this.img1 = value.properties.images[0];
    if (value.properties.images.length > 1) {
      this.img2 = value.properties.images[1];
    }
    if (value.properties.images.length > 2) {
      this.img3 = value.properties.images[2];
    }
    this.count = value.properties.ids.length;
    this.id = value.properties.ids.join('-');

    if (this.count == 1)
      this._geoHubService.isFavouriteTrack(value.properties.ids[0]).then(b => {
        this.isFavourite = b;
      })
  }


  constructor(
    private _geoHubService: GeohubService
  ) { }

  ngOnInit() { }

  click() {
    this.clickcluster.emit(this._item);
  }

  

}
