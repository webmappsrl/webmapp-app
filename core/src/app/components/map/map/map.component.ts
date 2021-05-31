import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { transform, transformExtent } from 'ol/proj';
import View from 'ol/View';
import Map from 'ol/Map';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';

@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {

  @ViewChild('map') mapDiv: ElementRef;

  @Input('start-view') startView: number[] = [11, 43, 10];

  private _view: View;
  private _map: Map;

  constructor() { }

  ngAfterViewInit() {

    this._view = new View({
      center: this._fromLonLat([this.startView[0], this.startView[1]]),
      zoom: this.startView[2],
      maxZoom: 16,
      minZoom: 1,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
      extent: this._extentFromLonLat([-180, -85, 180, 85]),
    });

    this._map = new Map({
      target: this.mapDiv.nativeElement,
      view: this._view,
      controls: [],
      moveTolerance: 3,
    });

    this._map.addLayer(new TileLayer({
      source: this._initializeBaseSource(),
      visible: true,
      zIndex: 1,
    }));

    //TODO
    setTimeout(() => {
      this._map.updateSize();
    }, 0);

  }

  private _initializeBaseSource() {
    return new XYZ({
      maxZoom: 16,
      minZoom: 1,
      tileLoadFunction: (tile: any, url: string) => {
        tile.getImage().src = url;
      },
      tileUrlFunction: (c) => {
        return 'https://api.webmapp.it/tiles/' + c[0] + '/' + c[1] + '/' + c[2] + '.png';
      },
      projection: 'EPSG:3857',
      tileSize: [256, 256],
    });

  }

  private _toLonLat(coordinates: Coordinate): Coordinate {
    return transform(coordinates, 'EPSG:3857', 'EPSG:4326');
  }
  private _fromLonLat(coordinates: Coordinate): Coordinate {
    return transform(coordinates, 'EPSG:4326', 'EPSG:3857');
  }
  private _extentToLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
  }
  private _extentFromLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
  }

}
