import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {DEF_MAP_MAX_ZOOM, DEF_MAP_MIN_ZOOM} from '../../../../../constants/map';

import Collection from 'ol/Collection';
import {Extent} from 'ol/extent';
import {IMAP} from 'src/app/types/config';
import {Interaction} from 'ol/interaction';
import Map from 'ol/Map';
import {MapService} from 'src/app/services/base/map.service';
import ScaleLineControl from 'ol/control/ScaleLine';
import TileLayer from 'ol/layer/Tile';
import {TilesService} from 'src/app/services/tiles.service';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls} from 'ol/control';
import {defaults as defaultInteractions} from 'ol/interaction.js';
import {filter} from 'rxjs/operators';
import {initExtent} from '../../constants';

@Component({
  selector: 'wm-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WmMapComponent implements AfterViewInit {
  private _centerExtent: Extent;
  private _conf: IMAP;
  private _defZoom: number;
  private _map$: BehaviorSubject<Map> = new BehaviorSubject<Map | null>(null);
  private _view: View;

  @Input() isLoggedIn: boolean;
  @Output('start-recording') startRecording: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('olmap', {static: true}) olmap!: ElementRef;
  @ViewChild('scaleLineContainer') scaleLineContainer: ElementRef;

  isTrackRecordingEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  map: Map;
  map$: Observable<Map> = this._map$.pipe(filter(f => f != null));
  startRecording$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private _tilesService: TilesService, private _mapSvc: MapService) {}

  @Input() set conf(conf: IMAP) {
    this._conf = conf;
    if (conf.record_track_show) {
      this.isTrackRecordingEnable$.next(true);
    }
  }

  @Input() set reset(_) {
    this._reset();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initMap(this._conf);
    }, 0);
  }

  private _initDefaultInteractions(): Collection<Interaction> {
    return defaultInteractions({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
      pinchRotate: false,
      altShiftDragRotate: false,
    });
  }

  private _initMap(conf: IMAP): void {
    this._view = new View({
      zoom: conf.defZoom ?? 10,
      maxZoom: conf.maxZoom,
      minZoom: conf.minZoom,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
      extent: this._mapSvc.extentFromLonLat(conf.bbox ?? initExtent),
    });
    this._centerExtent = this._mapSvc.extentFromLonLat(conf.bbox ?? initExtent);
    if (conf.defZoom) {
      this._defZoom = conf.defZoom;
    }
    this._reset();

    this.map = new Map({
      view: this._view,
      controls: defaultControls({
        attribution: false,
        rotate: false,
        zoom: false,
      }).extend([
        new ScaleLineControl({
          units: 'metric',
          minWidth: 50,
          target: this.scaleLineContainer.nativeElement,
        }),
      ]),
      interactions: this._initDefaultInteractions(),
      layers: [
        new TileLayer({
          source: this._initializeBaseSource(),
          visible: true,
          zIndex: 0,
        }),
      ],
      target: this.olmap.nativeElement,
    });
    this._map$.next(this.map);
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

  private _reset(): void {
    if (this._view != null) {
      this._view.fit(this._centerExtent);
      this._view.setZoom(this._defZoom);
    }
  }
}
