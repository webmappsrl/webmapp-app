import {DEF_MAP_MAX_ZOOM, DEF_MAP_MIN_ZOOM} from 'src/app/constants/map';
import {Directive, EventEmitter, Input, OnInit, Output} from '@angular/core';
import View, {FitOptions} from 'ol/View';

import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import {TilesService} from 'src/app/services/tiles.service';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls} from 'ol/control';
import {defaults as defaultInteracion} from 'ol/interaction';
import {fromLonLat} from 'ol/proj';
@Directive({
  selector: '[wmMap]',
})
export class WmMapDirective implements OnInit {
  private _view: View;
  map: Map;
  @Input() padding: number[];

  @Output() public initMap: EventEmitter<Map> = new EventEmitter<Map>();

  constructor(private _tilesService: TilesService) {}

  ngOnInit(): void {
    this._initMap();
  }

  private _fitView(geometryOrExtent: Point, optOptions?: FitOptions): void {
    if (optOptions == null) {
      const size = this.map.getSize();
      const height = size != null && size.length > 0 ? size[1] : 0;
      optOptions = {
        maxZoom: this.map.getView().getZoom(),
        duration: 500,
        padding: this.padding,
        size,
      };
    }
    this.map.getView().fit(geometryOrExtent, optOptions);
  }

  private _initMap(): void {
    (this._view = new View({
      zoom: 16,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
    })),
      (this.map = new Map({
        view: this._view,
        controls: defaultControls({
          attribution: false,
          rotate: false,
          zoom: false,
        }),
        interactions: defaultInteracion({
          altShiftDragRotate: false,
          onFocusOnly: true,
          doubleClickZoom: false,
          keyboard: false,
          mouseWheelZoom: false,
          shiftDragZoom: false,
          dragPan: false,
          pinchRotate: false,
          pinchZoom: false,
        }),
        layers: [
          new TileLayer({
            source: this._initializeBaseSource(),
            visible: true,
            zIndex: 0,
          }),
        ],
        target: 'ol-map',
      }));

    setTimeout(() => {
      this.map.updateSize();
      const point = new Point(fromLonLat([12.496366, 41.902782]));
      this._fitView(point);
      this.initMap.emit(this.map);
    }, 100);
  }

  /**
   * Initialize the base source of the map
   *
   * @returns the XYZ source to use
   */
  private _initializeBaseSource() {
    return new XYZ({
      maxZoom: DEF_MAP_MAX_ZOOM,
      minZoom: DEF_MAP_MIN_ZOOM,
      tileLoadFunction: (tile: any, url: string) => {
        const coords = this._tilesService.getCoordsFromUr(url);

        this._tilesService
          .getTile(coords, true)
          .then((tileString: string) => {
            tile.getImage().src = tileString;
          })
          .catch(() => {
            tile.getImage().src = url;
          });
      },
      tileUrlFunction: c => {
        return this._tilesService.getTileFromWeb(c);
      },
      projection: 'EPSG:3857',
      tileSize: [256, 256],
    });
  }
}
