/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

// ol imports
import { Coordinate } from 'ol/coordinate';
import Circle from 'ol/geom/Circle';
import Feature from 'ol/Feature';
import Icon from 'ol/style/Icon';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import TileJsonSource from 'ol/source/TileJSON';
import MVT from 'ol/format/MVT';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { defaults as defaultInteractions } from 'ol/interaction.js';

import {
  DEF_LOCATION_ACCURACY,
  DEF_LOCATION_Z_INDEX,
} from '../../../constants/map';

import { GeolocationService } from 'src/app/services/geolocation.service';
import { ILocation } from 'src/app/types/location';
import { CLocation } from 'src/app/classes/clocation';
import { EMapLocationState } from 'src/app/types/emap-location-state.enum';
import { MapService } from 'src/app/services/base/map.service';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { Track } from 'src/app/types/track';

import { createXYZ } from 'ol/tilegrid';
import { CommunicationService } from 'src/app/services/base/communication.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map') mapDiv: ElementRef;

  @Output() unlocked: EventEmitter<boolean> = new EventEmitter();
  @Output() move: EventEmitter<number> = new EventEmitter();

  @Input('start-view') startView: number[] = [10.4147, 43.7118, 9];
  @Input('btnposition') btnposition: string = 'bottom';
  @Input('registering') registering: boolean = false;
  @Input('static') static: boolean = false;

  @Input('showLayer') showLayer: boolean = false;
  @Input('hideRegister') hideRegister: boolean = false;

  @Input('track') set track(value: Track) {
    if (value) {
      setTimeout(() => {
        this._track.registeredTrack = value;
        this.drawTrack(value.geojson, true);
      }, 10);
    }
  }

  @Input('position') set position(value: ILocation) {
    if (value) {
      setTimeout(() => {
        this._position = value;
        this._location = value;
        this.animateLocation(value);
        this._centerMapToLocation();
      }, 10);
    }
  }

  public locationState: EMapLocationState;

  public showRecBtn: boolean = true;

  public isRecording: boolean = false;

  public sortedComponent: any[] = [];

  public timer: any;

  private _position: ILocation = null;

  private _view: View;
  private _map: Map;

  // Location Icon
  private _locationIconArrow: Icon;
  private _locationIconStyle: Style;
  private _locationIconArrowStyle: Style;
  private _locationIcon: {
    layer: VectorLayer;
    location: Feature;
    accuracy: Feature;
    point: Point;
    circle: Circle;
    icon: string;
  };

  private _track: {
    layer: VectorLayer;
    track: Feature[];
    registeredTrack: Track;
  };

  private _locationAnimationState: {
    goalLocation?: ILocation;
    goalAccuracy?: number;
    animating: boolean;
    startTime?: number;
    startLocation?: ILocation;
  };

  private _location: ILocation;

  constructor(
    private _communicationService: CommunicationService,
    private _geolocationService: GeolocationService,
    private _mapService: MapService
  ) {
    this._locationIcon = {
      layer: null,
      location: null,
      accuracy: null,
      point: null,
      circle: null,
      icon: 'locationIcon',
    };

    this._track = {
      layer: null,
      track: null,
      registeredTrack: null,
    };

    this._locationAnimationState = {
      animating: false,
    };
    this._locationIconArrow = new Icon({
      src: 'assets/images/location-icon-arrow.png',
      scale: 0.33,
      size: [125, 125],
      rotateWithView: false,
    });
    this._locationIconStyle = new Style({
      image: new Icon({
        src: 'assets/images/location-icon.png',
        scale: 0.29,
        size: [125, 125],
      }),
      zIndex: DEF_LOCATION_Z_INDEX,
    });
    this._locationIconArrowStyle = new Style({
      image: this._locationIconArrow,
      zIndex: DEF_LOCATION_Z_INDEX,
    });
  }

  ngAfterViewInit() {
    if (!this.startView) this.startView = [10.4147, 43.7118, 9];

    this._view = new View({
      center: this._mapService.coordsFromLonLat([
        this.startView[0],
        this.startView[1],
      ]),
      zoom: this.startView[2],
      maxZoom: 21,
      minZoom: 1,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
      extent: this._mapService.extentFromLonLat([-180, -85, 180, 85]),
    });

    let interactions = null;
    if (this.static) {
      interactions = defaultInteractions({
        doubleClickZoom: false,
        // dragAndDrop: false,
        dragPan: false,
        // keyboardPan: false,
        // keyboardZoom: false,
        mouseWheelZoom: false,
        // pointer: false,
        // select: false
      });
    }

    this._map = new Map({
      target: this.mapDiv.nativeElement,
      view: this._view,
      controls: [],
      interactions,
      moveTolerance: 3,
    });

    this._map.addLayer(
      new TileLayer({
        source: this._initializeBaseSource(),
        visible: true,
        zIndex: 1,
      })
    );
    this._communicationService
      .get('https://tiles.webmapp.it/italy/italy.json')
      .pipe(take(1))
      .subscribe((tileJSON) => {
        this._map.addLayer(this._initializeVectorTileBaseLayer(tileJSON));
      });
    // const tileJSON = {
    //   pixel_scale: '256',
    //   mtime: '1622892449791',
    //   name: 'OpenMapTiles',
    //   format: 'pbf',
    //   bounds: [6.602696, 35.07638, 19.12499, 47.10169],
    //   center: [12.9, 41.1, 1],
    //   minzoom: 0,
    //   maxzoom: 14,
    //   attribution:
    //     '<a href=\\"https://www.openmaptiles.org/\\" target=\\"_blank\\">&copy; OpenMapTiles</a> <a href=\\"https://www.openstreetmap.org/copyright\\" target=\\"_blank\\">&copy; OpenStreetMap contributors</a>',
    //   description:
    //     'A tileset showcasing all layers in OpenMapTiles. https://openmaptiles.org',
    //   version: '3.12.1',
    //   id: 'openmaptiles',
    //   filesize: '1565237248',
    //   basename: 'italy',
    //   profile: 'mercator',
    //   scale: 1,
    //   tiles: ['https://tiles.webmapp.it/italy/italy/{z}/{x}/{y}.pbf'],
    //   tilejson: '2.0.0',
    //   scheme: 'xyz',
    //   grids: ['https://tiles.webmapp.it/italy/italy/{z}/{x}/{y}.grid.json'],
    //   vector_layers: [
    //     {
    //       id: 'water',
    //       description:
    //         'Water polygons representing oceans and lakes. Covered watered areas are excluded (`covered=yes`).nOn low zoom levels all water originates from Natural Earth. To get a more correct display of the south pole you should alsonstyle the covering ice shelves over the water.nOn higher zoom levels water polygons from [OpenStreetMapData](http://osmdata.openstreetmap.de/) are used.nThe polygons are split into many smaller polygons to improve rendering performance.nThis however can lead to less rendering options in clients since these boundaries show up. So you might not benable to use border styling for ocean water features.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         class: 'String',
    //         intermittent: 'Number',
    //         brunnel: 'String',
    //       },
    //     },
    //     {
    //       id: 'waterway',
    //       description:
    //         'OpenStreetMap [waterways](https://wiki.openstreetmap.org/wiki/Waterways) for higher zoom levels (z9 and more)nand Natural Earth rivers and lake centerlines for low zoom levels (z3 - z8).nLinestrings without a name or which are too short are filterednout at low zoom levels.nTill z11 there is `river` class only, in z12 there is also `canal` generated,nstarting z13 there is no generalization according to `class` field applied.nWaterways do not have a `subclass` field.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         name: 'String',
    //         name_en: 'String',
    //         name_de: 'String',
    //         'name:am': 'String',
    //         'name:ar': 'String',
    //         'name:az': 'String',
    //         'name:be': 'String',
    //         'name:bg': 'String',
    //         'name:br': 'String',
    //         'name:bs': 'String',
    //         'name:ca': 'String',
    //         'name:co': 'String',
    //         'name:cs': 'String',
    //         'name:cy': 'String',
    //         'name:da': 'String',
    //         'name:de': 'String',
    //         'name:el': 'String',
    //         'name:en': 'String',
    //         'name:eo': 'String',
    //         'name:es': 'String',
    //         'name:et': 'String',
    //         'name:eu': 'String',
    //         'name:fi': 'String',
    //         'name:fr': 'String',
    //         'name:fy': 'String',
    //         'name:ga': 'String',
    //         'name:gd': 'String',
    //         'name:he': 'String',
    //         'name:hi': 'String',
    //         'name:hr': 'String',
    //         'name:hu': 'String',
    //         'name:hy': 'String',
    //         'name:id': 'String',
    //         'name:is': 'String',
    //         'name:it': 'String',
    //         'name:ja': 'String',
    //         'name:ja_kana': 'String',
    //         'name:ja_rm': 'String',
    //         'name:ja-Latn': 'String',
    //         'name:ja-Hira': 'String',
    //         'name:ka': 'String',
    //         'name:kk': 'String',
    //         'name:kn': 'String',
    //         'name:ko': 'String',
    //         'name:ko-Latn': 'String',
    //         'name:ku': 'String',
    //         'name:la': 'String',
    //         'name:lb': 'String',
    //         'name:lt': 'String',
    //         'name:lv': 'String',
    //         'name:mk': 'String',
    //         'name:mt': 'String',
    //         'name:ml': 'String',
    //         'name:nl': 'String',
    //         'name:no': 'String',
    //         'name:oc': 'String',
    //         'name:pl': 'String',
    //         'name:pt': 'String',
    //         'name:rm': 'String',
    //         'name:ro': 'String',
    //         'name:ru': 'String',
    //         'name:sk': 'String',
    //         'name:sl': 'String',
    //         'name:sq': 'String',
    //         'name:sr': 'String',
    //         'name:sr-Latn': 'String',
    //         'name:sv': 'String',
    //         'name:ta': 'String',
    //         'name:te': 'String',
    //         'name:th': 'String',
    //         'name:tr': 'String',
    //         'name:uk': 'String',
    //         'name:zh': 'String',
    //         name_int: 'String',
    //         'name:latin': 'String',
    //         'name:nonlatin': 'String',
    //         class: 'String',
    //         brunnel: 'String',
    //         intermittent: 'Number',
    //       },
    //     },
    //     {
    //       id: 'landcover',
    //       description:
    //         'Landcover is used to describe the physical material at the surface of the earth. At lower zoom levels this isnfrom Natural Earth data for glaciers and ice shelves and at higher zoom levels the landcover is [implied by OSM tags](http://wiki.openstreetmap.org/wiki/Landcover). The most common use case for this layern  is to style wood (`class=wood`) and grass (`class=grass`) areas.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: { class: 'String', subclass: 'String' },
    //     },
    //     {
    //       id: 'landuse',
    //       description:
    //         'Landuse is used to describe use of land by humans. At lower zoom levels this isnfrom Natural Earth data for residential (urban) areas and at higher zoom levels mostly OSM `landuse` tags.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: { class: 'String' },
    //     },
    //     {
    //       id: 'mountain_peak',
    //       description:
    //         '[Natural peaks](http://wiki.openstreetmap.org/wiki/Tag:natural%3Dpeak)',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         osm_id: 'Number',
    //         name: 'String',
    //         name_en: 'String',
    //         name_de: 'String',
    //         'name:am': 'String',
    //         'name:ar': 'String',
    //         'name:az': 'String',
    //         'name:be': 'String',
    //         'name:bg': 'String',
    //         'name:br': 'String',
    //         'name:bs': 'String',
    //         'name:ca': 'String',
    //         'name:co': 'String',
    //         'name:cs': 'String',
    //         'name:cy': 'String',
    //         'name:da': 'String',
    //         'name:de': 'String',
    //         'name:el': 'String',
    //         'name:en': 'String',
    //         'name:eo': 'String',
    //         'name:es': 'String',
    //         'name:et': 'String',
    //         'name:eu': 'String',
    //         'name:fi': 'String',
    //         'name:fr': 'String',
    //         'name:fy': 'String',
    //         'name:ga': 'String',
    //         'name:gd': 'String',
    //         'name:he': 'String',
    //         'name:hi': 'String',
    //         'name:hr': 'String',
    //         'name:hu': 'String',
    //         'name:hy': 'String',
    //         'name:id': 'String',
    //         'name:is': 'String',
    //         'name:it': 'String',
    //         'name:ja': 'String',
    //         'name:ja_kana': 'String',
    //         'name:ja_rm': 'String',
    //         'name:ja-Latn': 'String',
    //         'name:ja-Hira': 'String',
    //         'name:ka': 'String',
    //         'name:kk': 'String',
    //         'name:kn': 'String',
    //         'name:ko': 'String',
    //         'name:ko-Latn': 'String',
    //         'name:ku': 'String',
    //         'name:la': 'String',
    //         'name:lb': 'String',
    //         'name:lt': 'String',
    //         'name:lv': 'String',
    //         'name:mk': 'String',
    //         'name:mt': 'String',
    //         'name:ml': 'String',
    //         'name:nl': 'String',
    //         'name:no': 'String',
    //         'name:oc': 'String',
    //         'name:pl': 'String',
    //         'name:pt': 'String',
    //         'name:rm': 'String',
    //         'name:ro': 'String',
    //         'name:ru': 'String',
    //         'name:sk': 'String',
    //         'name:sl': 'String',
    //         'name:sq': 'String',
    //         'name:sr': 'String',
    //         'name:sr-Latn': 'String',
    //         'name:sv': 'String',
    //         'name:ta': 'String',
    //         'name:te': 'String',
    //         'name:th': 'String',
    //         'name:tr': 'String',
    //         'name:uk': 'String',
    //         'name:zh': 'String',
    //         name_int: 'String',
    //         'name:latin': 'String',
    //         'name:nonlatin': 'String',
    //         class: 'String',
    //         ele: 'Number',
    //         ele_ft: 'Number',
    //         rank: 'Number',
    //       },
    //     },
    //     {
    //       id: 'park',
    //       description:
    //         'The park layer contains parks from OpenStreetMap tagged withn[`boundary=national_park`](http://wiki.openstreetmap.org/wiki/Tag:boundary%3Dnational_park),n[`boundary=protected_area`](http://wiki.openstreetmap.org/wiki/Tag:boundary%3Dprotected_area),nor [`leisure=nature_reserve`](http://wiki.openstreetmap.org/wiki/Tag:leisure%3Dnature_reserve).',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         class: 'String',
    //         name: 'String',
    //         name_en: 'String',
    //         name_de: 'String',
    //         'name:am': 'String',
    //         'name:ar': 'String',
    //         'name:az': 'String',
    //         'name:be': 'String',
    //         'name:bg': 'String',
    //         'name:br': 'String',
    //         'name:bs': 'String',
    //         'name:ca': 'String',
    //         'name:co': 'String',
    //         'name:cs': 'String',
    //         'name:cy': 'String',
    //         'name:da': 'String',
    //         'name:de': 'String',
    //         'name:el': 'String',
    //         'name:en': 'String',
    //         'name:eo': 'String',
    //         'name:es': 'String',
    //         'name:et': 'String',
    //         'name:eu': 'String',
    //         'name:fi': 'String',
    //         'name:fr': 'String',
    //         'name:fy': 'String',
    //         'name:ga': 'String',
    //         'name:gd': 'String',
    //         'name:he': 'String',
    //         'name:hi': 'String',
    //         'name:hr': 'String',
    //         'name:hu': 'String',
    //         'name:hy': 'String',
    //         'name:id': 'String',
    //         'name:is': 'String',
    //         'name:it': 'String',
    //         'name:ja': 'String',
    //         'name:ja_kana': 'String',
    //         'name:ja_rm': 'String',
    //         'name:ja-Latn': 'String',
    //         'name:ja-Hira': 'String',
    //         'name:ka': 'String',
    //         'name:kk': 'String',
    //         'name:kn': 'String',
    //         'name:ko': 'String',
    //         'name:ko-Latn': 'String',
    //         'name:ku': 'String',
    //         'name:la': 'String',
    //         'name:lb': 'String',
    //         'name:lt': 'String',
    //         'name:lv': 'String',
    //         'name:mk': 'String',
    //         'name:mt': 'String',
    //         'name:ml': 'String',
    //         'name:nl': 'String',
    //         'name:no': 'String',
    //         'name:oc': 'String',
    //         'name:pl': 'String',
    //         'name:pt': 'String',
    //         'name:rm': 'String',
    //         'name:ro': 'String',
    //         'name:ru': 'String',
    //         'name:sk': 'String',
    //         'name:sl': 'String',
    //         'name:sq': 'String',
    //         'name:sr': 'String',
    //         'name:sr-Latn': 'String',
    //         'name:sv': 'String',
    //         'name:ta': 'String',
    //         'name:te': 'String',
    //         'name:th': 'String',
    //         'name:tr': 'String',
    //         'name:uk': 'String',
    //         'name:zh': 'String',
    //         name_int: 'String',
    //         'name:latin': 'String',
    //         'name:nonlatin': 'String',
    //         rank: 'Number',
    //       },
    //     },
    //     {
    //       id: 'boundary',
    //       description:
    //         'Contains administrative boundaries as linestrings.nUntil z4 [Natural Earth data](http://www.naturalearthdata.com/downloads/) is used after whichnOSM boundaries ([`boundary=administrative`](http://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative))nare present from z5 to z14 (also for maritime boundaries with `admin_level <= 2` at z4).nOSM data contains several [`admin_level`](http://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative#admin_level)nbut for most styles it makes sense to just style `admin_level=2` and `admin_level=4`.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         admin_level: 'Number',
    //         adm0_l: 'String',
    //         adm0_r: 'String',
    //         disputed: 'Number',
    //         disputed_name: 'String',
    //         claimed_by: 'String',
    //         maritime: 'Number',
    //       },
    //     },
    //     {
    //       id: 'aeroway',
    //       description:
    //         'Aeroway polygons based of OpenStreetMap [aeroways](http://wiki.openstreetmap.org/wiki/Aeroways).nAirport buildings are contained in the **building** layer but allnother airport related polygons can be found in the **aeroway** layer.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: { ref: 'String', class: 'String' },
    //     },
    //     {
    //       id: 'transportation',
    //       description:
    //         '**transportation** contains roads, railways, aerial ways, and shippingn lines.nThis layer is directly derived from the OSM road hierarchy.nAt lower zoom levels major highways from Natural Earth are used.nIt contains all roads from motorways to primary, secondary andntertiary roads to residential roads andnfoot paths. Styling the roads is the most essential part of the map.nThe `transportation` layer also contains polygons for features like plazas.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         class: 'String',
    //         subclass: 'String',
    //         oneway: 'Number',
    //         ramp: 'Number',
    //         brunnel: 'String',
    //         service: 'String',
    //         layer: 'Number',
    //         level: 'Number',
    //         indoor: 'Number',
    //         bicycle: 'String',
    //         foot: 'String',
    //         horse: 'String',
    //         mtb_scale: 'String',
    //         surface: 'String',
    //       },
    //     },
    //     {
    //       id: 'building',
    //       description:
    //         'All [OSM Buildings](http://wiki.openstreetmap.org/wiki/Buildings). All building tags are imported ([`building=*`](http://wiki.openstreetmap.org/wiki/Key:building)). The buildings are not yet ready for 3D rendering support and any help to improventhis is welcomed.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         osm_id: 'Number',
    //         render_height: 'Number',
    //         render_min_height: 'Number',
    //         colour: 'String',
    //         hide_3d: 'Boolean',
    //       },
    //     },
    //     {
    //       id: 'water_name',
    //       description:
    //         'Lake center lines for labelling lake bodies.nThis is based of the [osm-lakelines](https://github.com/lukasmartinelli/osm-lakelines) projectnwhich derives nice centerlines from OSM water bodies. Only the most important lakes contain labels.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         osm_id: 'Number',
    //         name: 'String',
    //         name_en: 'String',
    //         name_de: 'String',
    //         'name:am': 'String',
    //         'name:ar': 'String',
    //         'name:az': 'String',
    //         'name:be': 'String',
    //         'name:bg': 'String',
    //         'name:br': 'String',
    //         'name:bs': 'String',
    //         'name:ca': 'String',
    //         'name:co': 'String',
    //         'name:cs': 'String',
    //         'name:cy': 'String',
    //         'name:da': 'String',
    //         'name:de': 'String',
    //         'name:el': 'String',
    //         'name:en': 'String',
    //         'name:eo': 'String',
    //         'name:es': 'String',
    //         'name:et': 'String',
    //         'name:eu': 'String',
    //         'name:fi': 'String',
    //         'name:fr': 'String',
    //         'name:fy': 'String',
    //         'name:ga': 'String',
    //         'name:gd': 'String',
    //         'name:he': 'String',
    //         'name:hi': 'String',
    //         'name:hr': 'String',
    //         'name:hu': 'String',
    //         'name:hy': 'String',
    //         'name:id': 'String',
    //         'name:is': 'String',
    //         'name:it': 'String',
    //         'name:ja': 'String',
    //         'name:ja_kana': 'String',
    //         'name:ja_rm': 'String',
    //         'name:ja-Latn': 'String',
    //         'name:ja-Hira': 'String',
    //         'name:ka': 'String',
    //         'name:kk': 'String',
    //         'name:kn': 'String',
    //         'name:ko': 'String',
    //         'name:ko-Latn': 'String',
    //         'name:ku': 'String',
    //         'name:la': 'String',
    //         'name:lb': 'String',
    //         'name:lt': 'String',
    //         'name:lv': 'String',
    //         'name:mk': 'String',
    //         'name:mt': 'String',
    //         'name:ml': 'String',
    //         'name:nl': 'String',
    //         'name:no': 'String',
    //         'name:oc': 'String',
    //         'name:pl': 'String',
    //         'name:pt': 'String',
    //         'name:rm': 'String',
    //         'name:ro': 'String',
    //         'name:ru': 'String',
    //         'name:sk': 'String',
    //         'name:sl': 'String',
    //         'name:sq': 'String',
    //         'name:sr': 'String',
    //         'name:sr-Latn': 'String',
    //         'name:sv': 'String',
    //         'name:ta': 'String',
    //         'name:te': 'String',
    //         'name:th': 'String',
    //         'name:tr': 'String',
    //         'name:uk': 'String',
    //         'name:zh': 'String',
    //         name_int: 'String',
    //         'name:latin': 'String',
    //         'name:nonlatin': 'String',
    //         class: 'String',
    //         intermittent: 'Number',
    //       },
    //     },
    //     {
    //       id: 'transportation_name',
    //       description:
    //         'This is the layer for labelling the highways. Only highways that are named `name=*` and are long enoughnto place text upon appear. The OSM roads are stitched together if they contain the same namento have better label placement than having many small linestrings.nFor motorways you should use the `ref` field to label them while for other roads you should use `name`.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         name: 'String',
    //         name_en: 'String',
    //         name_de: 'String',
    //         'name:am': 'String',
    //         'name:ar': 'String',
    //         'name:az': 'String',
    //         'name:be': 'String',
    //         'name:bg': 'String',
    //         'name:br': 'String',
    //         'name:bs': 'String',
    //         'name:ca': 'String',
    //         'name:co': 'String',
    //         'name:cs': 'String',
    //         'name:cy': 'String',
    //         'name:da': 'String',
    //         'name:de': 'String',
    //         'name:el': 'String',
    //         'name:en': 'String',
    //         'name:eo': 'String',
    //         'name:es': 'String',
    //         'name:et': 'String',
    //         'name:eu': 'String',
    //         'name:fi': 'String',
    //         'name:fr': 'String',
    //         'name:fy': 'String',
    //         'name:ga': 'String',
    //         'name:gd': 'String',
    //         'name:he': 'String',
    //         'name:hi': 'String',
    //         'name:hr': 'String',
    //         'name:hu': 'String',
    //         'name:hy': 'String',
    //         'name:id': 'String',
    //         'name:is': 'String',
    //         'name:it': 'String',
    //         'name:ja': 'String',
    //         'name:ja_kana': 'String',
    //         'name:ja_rm': 'String',
    //         'name:ja-Latn': 'String',
    //         'name:ja-Hira': 'String',
    //         'name:ka': 'String',
    //         'name:kk': 'String',
    //         'name:kn': 'String',
    //         'name:ko': 'String',
    //         'name:ko-Latn': 'String',
    //         'name:ku': 'String',
    //         'name:la': 'String',
    //         'name:lb': 'String',
    //         'name:lt': 'String',
    //         'name:lv': 'String',
    //         'name:mk': 'String',
    //         'name:mt': 'String',
    //         'name:ml': 'String',
    //         'name:nl': 'String',
    //         'name:no': 'String',
    //         'name:oc': 'String',
    //         'name:pl': 'String',
    //         'name:pt': 'String',
    //         'name:rm': 'String',
    //         'name:ro': 'String',
    //         'name:ru': 'String',
    //         'name:sk': 'String',
    //         'name:sl': 'String',
    //         'name:sq': 'String',
    //         'name:sr': 'String',
    //         'name:sr-Latn': 'String',
    //         'name:sv': 'String',
    //         'name:ta': 'String',
    //         'name:te': 'String',
    //         'name:th': 'String',
    //         'name:tr': 'String',
    //         'name:uk': 'String',
    //         'name:zh': 'String',
    //         name_int: 'String',
    //         'name:latin': 'String',
    //         'name:nonlatin': 'String',
    //         ref: 'String',
    //         ref_length: 'Number',
    //         network: 'String',
    //         class: 'String',
    //         subclass: 'String',
    //         brunnel: 'String',
    //         layer: 'Number',
    //         level: 'Number',
    //         indoor: 'Number',
    //       },
    //     },
    //     {
    //       id: 'place',
    //       description:
    //         'The place layer consists out of [countries](http://wiki.openstreetmap.org/wiki/Tag:place%3Dcountry),n[states](http://wiki.openstreetmap.org/wiki/Tag:place%3Dstate) and [cities](http://wiki.openstreetmap.org/wiki/Key:place).nApart from the roads this is also one of the more important layers to create a beautiful map.nWe suggest you use different font styles and sizes to create a text hierarchy.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         osm_id: 'Number',
    //         name: 'String',
    //         name_en: 'String',
    //         name_de: 'String',
    //         'name:am': 'String',
    //         'name:ar': 'String',
    //         'name:az': 'String',
    //         'name:be': 'String',
    //         'name:bg': 'String',
    //         'name:br': 'String',
    //         'name:bs': 'String',
    //         'name:ca': 'String',
    //         'name:co': 'String',
    //         'name:cs': 'String',
    //         'name:cy': 'String',
    //         'name:da': 'String',
    //         'name:de': 'String',
    //         'name:el': 'String',
    //         'name:en': 'String',
    //         'name:eo': 'String',
    //         'name:es': 'String',
    //         'name:et': 'String',
    //         'name:eu': 'String',
    //         'name:fi': 'String',
    //         'name:fr': 'String',
    //         'name:fy': 'String',
    //         'name:ga': 'String',
    //         'name:gd': 'String',
    //         'name:he': 'String',
    //         'name:hi': 'String',
    //         'name:hr': 'String',
    //         'name:hu': 'String',
    //         'name:hy': 'String',
    //         'name:id': 'String',
    //         'name:is': 'String',
    //         'name:it': 'String',
    //         'name:ja': 'String',
    //         'name:ja_kana': 'String',
    //         'name:ja_rm': 'String',
    //         'name:ja-Latn': 'String',
    //         'name:ja-Hira': 'String',
    //         'name:ka': 'String',
    //         'name:kk': 'String',
    //         'name:kn': 'String',
    //         'name:ko': 'String',
    //         'name:ko-Latn': 'String',
    //         'name:ku': 'String',
    //         'name:la': 'String',
    //         'name:lb': 'String',
    //         'name:lt': 'String',
    //         'name:lv': 'String',
    //         'name:mk': 'String',
    //         'name:mt': 'String',
    //         'name:ml': 'String',
    //         'name:nl': 'String',
    //         'name:no': 'String',
    //         'name:oc': 'String',
    //         'name:pl': 'String',
    //         'name:pt': 'String',
    //         'name:rm': 'String',
    //         'name:ro': 'String',
    //         'name:ru': 'String',
    //         'name:sk': 'String',
    //         'name:sl': 'String',
    //         'name:sq': 'String',
    //         'name:sr': 'String',
    //         'name:sr-Latn': 'String',
    //         'name:sv': 'String',
    //         'name:ta': 'String',
    //         'name:te': 'String',
    //         'name:th': 'String',
    //         'name:tr': 'String',
    //         'name:uk': 'String',
    //         'name:zh': 'String',
    //         name_int: 'String',
    //         'name:latin': 'String',
    //         'name:nonlatin': 'String',
    //         class: 'String',
    //         rank: 'Number',
    //         capital: 'Number',
    //         iso_a2: 'String',
    //       },
    //     },
    //     {
    //       id: 'housenumber',
    //       description:
    //         'Everything in OpenStreetMap which contains a `addr:housenumber` tag useful for labelling housenumbers on a map.nThis adds significant size to *z14*. For buildings the centroid of the building is used as housenumber.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: { housenumber: 'String' },
    //     },
    //     {
    //       id: 'poi',
    //       description:
    //         '[Points of interests](http://wiki.openstreetmap.org/wiki/Points_of_interest) containingna of a variety of OpenStreetMap tags. Mostly contains amenities, sport, shop and tourist POIs.',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         osm_id: 'Number',
    //         name: 'String',
    //         name_en: 'String',
    //         name_de: 'String',
    //         'name:am': 'String',
    //         'name:ar': 'String',
    //         'name:az': 'String',
    //         'name:be': 'String',
    //         'name:bg': 'String',
    //         'name:br': 'String',
    //         'name:bs': 'String',
    //         'name:ca': 'String',
    //         'name:co': 'String',
    //         'name:cs': 'String',
    //         'name:cy': 'String',
    //         'name:da': 'String',
    //         'name:de': 'String',
    //         'name:el': 'String',
    //         'name:en': 'String',
    //         'name:eo': 'String',
    //         'name:es': 'String',
    //         'name:et': 'String',
    //         'name:eu': 'String',
    //         'name:fi': 'String',
    //         'name:fr': 'String',
    //         'name:fy': 'String',
    //         'name:ga': 'String',
    //         'name:gd': 'String',
    //         'name:he': 'String',
    //         'name:hi': 'String',
    //         'name:hr': 'String',
    //         'name:hu': 'String',
    //         'name:hy': 'String',
    //         'name:id': 'String',
    //         'name:is': 'String',
    //         'name:it': 'String',
    //         'name:ja': 'String',
    //         'name:ja_kana': 'String',
    //         'name:ja_rm': 'String',
    //         'name:ja-Latn': 'String',
    //         'name:ja-Hira': 'String',
    //         'name:ka': 'String',
    //         'name:kk': 'String',
    //         'name:kn': 'String',
    //         'name:ko': 'String',
    //         'name:ko-Latn': 'String',
    //         'name:ku': 'String',
    //         'name:la': 'String',
    //         'name:lb': 'String',
    //         'name:lt': 'String',
    //         'name:lv': 'String',
    //         'name:mk': 'String',
    //         'name:mt': 'String',
    //         'name:ml': 'String',
    //         'name:nl': 'String',
    //         'name:no': 'String',
    //         'name:oc': 'String',
    //         'name:pl': 'String',
    //         'name:pt': 'String',
    //         'name:rm': 'String',
    //         'name:ro': 'String',
    //         'name:ru': 'String',
    //         'name:sk': 'String',
    //         'name:sl': 'String',
    //         'name:sq': 'String',
    //         'name:sr': 'String',
    //         'name:sr-Latn': 'String',
    //         'name:sv': 'String',
    //         'name:ta': 'String',
    //         'name:te': 'String',
    //         'name:th': 'String',
    //         'name:tr': 'String',
    //         'name:uk': 'String',
    //         'name:zh': 'String',
    //         name_int: 'String',
    //         'name:latin': 'String',
    //         'name:nonlatin': 'String',
    //         class: 'String',
    //         subclass: 'String',
    //         agg_stop: 'Number',
    //         layer: 'Number',
    //         level: 'Number',
    //         indoor: 'Number',
    //         rank: 'Number',
    //       },
    //     },
    //     {
    //       id: 'aerodrome_label',
    //       description:
    //         '[Aerodrome labels](http://wiki.openstreetmap.org/wiki/Tag:aeroway%3Daerodrome)',
    //       minzoom: 0,
    //       maxzoom: 14,
    //       fields: {
    //         osm_id: 'Number',
    //         name: 'String',
    //         name_en: 'String',
    //         name_de: 'String',
    //         'name:am': 'String',
    //         'name:ar': 'String',
    //         'name:az': 'String',
    //         'name:be': 'String',
    //         'name:bg': 'String',
    //         'name:br': 'String',
    //         'name:bs': 'String',
    //         'name:ca': 'String',
    //         'name:co': 'String',
    //         'name:cs': 'String',
    //         'name:cy': 'String',
    //         'name:da': 'String',
    //         'name:de': 'String',
    //         'name:el': 'String',
    //         'name:en': 'String',
    //         'name:eo': 'String',
    //         'name:es': 'String',
    //         'name:et': 'String',
    //         'name:eu': 'String',
    //         'name:fi': 'String',
    //         'name:fr': 'String',
    //         'name:fy': 'String',
    //         'name:ga': 'String',
    //         'name:gd': 'String',
    //         'name:he': 'String',
    //         'name:hi': 'String',
    //         'name:hr': 'String',
    //         'name:hu': 'String',
    //         'name:hy': 'String',
    //         'name:id': 'String',
    //         'name:is': 'String',
    //         'name:it': 'String',
    //         'name:ja': 'String',
    //         'name:ja_kana': 'String',
    //         'name:ja_rm': 'String',
    //         'name:ja-Latn': 'String',
    //         'name:ja-Hira': 'String',
    //         'name:ka': 'String',
    //         'name:kk': 'String',
    //         'name:kn': 'String',
    //         'name:ko': 'String',
    //         'name:ko-Latn': 'String',
    //         'name:ku': 'String',
    //         'name:la': 'String',
    //         'name:lb': 'String',
    //         'name:lt': 'String',
    //         'name:lv': 'String',
    //         'name:mk': 'String',
    //         'name:mt': 'String',
    //         'name:ml': 'String',
    //         'name:nl': 'String',
    //         'name:no': 'String',
    //         'name:oc': 'String',
    //         'name:pl': 'String',
    //         'name:pt': 'String',
    //         'name:rm': 'String',
    //         'name:ro': 'String',
    //         'name:ru': 'String',
    //         'name:sk': 'String',
    //         'name:sl': 'String',
    //         'name:sq': 'String',
    //         'name:sr': 'String',
    //         'name:sr-Latn': 'String',
    //         'name:sv': 'String',
    //         'name:ta': 'String',
    //         'name:te': 'String',
    //         'name:th': 'String',
    //         'name:tr': 'String',
    //         'name:uk': 'String',
    //         'name:zh': 'String',
    //         name_int: 'String',
    //         'name:latin': 'String',
    //         'name:nonlatin': 'String',
    //         class: 'String',
    //         iata: 'String',
    //         icao: 'String',
    //         ele: 'Number',
    //         ele_ft: 'Number',
    //       },
    //     },
    //   ],
    //   zoom: 7,
    //   tileUrl: 'https://tiles.webmapp.it/italy/italy/1/1/0.pbf',
    // };

    this.isRecording = this._geolocationService.recording;

    //TODO: figure out why this must be called inside a timeout
    setTimeout(() => {
      this._map.updateSize();
    }, 0);

    //TODO: test for ensure presence of map
    this.timer = setInterval(() => {
      if (this.static) {
        if (this._track.registeredTrack && this._track.registeredTrack.geojson)
          this.drawTrack(this._track.registeredTrack.geojson, true);
      }
      this._map.updateSize();
    }, 1000);

    if (!this.static) {
      this._map.on('moveend', () => {
        if (
          [EMapLocationState.FOLLOW, EMapLocationState.ROTATE].indexOf(
            this.locationState
          ) !== -1 &&
          this._location?.latitude &&
          this._location?.longitude
        ) {
          const centerCoordinates: Coordinate = this._mapService.coordsToLonLat(
            this._view.getCenter()
          );

          if (
            this._mapService.getFixedDistance(
              new CLocation(centerCoordinates[0], centerCoordinates[1]),
              this._location,
              this._view.getResolution()
            ) > 30
          )
            this.locationState = EMapLocationState.ACTIVE;
        }
      });

      if (this.registering) {
        this._geolocationService.start();
        this.locationState = EMapLocationState.FOLLOW;
        this._centerMapToLocation();
      }

      this._geolocationService.onLocationChange.subscribe((location) => {
        this._location = location;
        this.animateLocation(this._location);

        if (
          [EMapLocationState.FOLLOW, EMapLocationState.ROTATE].indexOf(
            this.locationState
          ) !== -1
        )
          this._centerMapToLocation();
      });
    }

    // this.initLayer(tileJSON);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  /**
   * Draw a track in the map, remove a prevoius track
   *
   * @param geojson geojson of the track
   */
  drawTrack(trackgeojson: any, centerToTrack: boolean = false) {
    const geojson: any = this.getGeoJson(trackgeojson);
    const features = new GeoJSON({
      featureProjection: 'EPSG:3857',
    }).readFeatures(geojson);
    if (!this._track.layer) {
      this._track.layer = new VectorLayer({
        source: new VectorSource({
          format: new GeoJSON(),
          features,
        }),
        style: () => {
          return this._getLineStyle();
        },
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: 450,
      });
    } else {
      this._track.layer.getSource().clear();
      this._track.layer.getSource().addFeatures(features);
    }
    try {
      this._map.addLayer(this._track.layer);
    } catch (e) {}
    if (centerToTrack) {
      this._centerMapToTrack();
    }
  }

  /**
   * Move the location icon to the specified new location
   *
   * @param location the new location
   */
  animateLocation(location?: ILocation) {
    if (typeof location?.accuracy === 'number' && location.accuracy >= 0)
      this._locationAnimationState.goalAccuracy = location.accuracy;

    if (location?.latitude && location?.longitude)
      this._locationAnimationState.goalLocation = location;

    if (!this._locationIcon.layer) this._setLocation(location);
    else {
      this._locationAnimationState.startTime = Date.now();
      const coordinates: Coordinate = this._mapService.coordsToLonLat(
        this._locationIcon.point.getCoordinates()
      );
      this._locationAnimationState.startLocation = new CLocation(
        coordinates[0],
        coordinates[1],
        undefined,
        this._locationIcon.circle.getRadius()
      );
      if (!this._locationAnimationState.animating) {
        this._locationAnimationState.animating = true;
      }

      this._map.once('postrender', () => {
        this._animateLocation();
      });
    }
    this._updateLocationLayer();
  }

  /**
   * Make the map follow the location icon
   */
  btnLocationClick(): void {
    if (this.locationState === EMapLocationState.FOLLOW) {
      this.locationState = EMapLocationState.ACTIVE;
    } else {
      this.locationState = EMapLocationState.FOLLOW;
      this._centerMapToLocation();
    }
  }

  recBtnMove(val) {
    this.move.emit(val);
  }

  recBtnUnlocked(val) {
    this.showRecBtn = false;
    this.unlocked.emit(val);
  }

  private getGeoJson(trackgeojson: any): any {
    if (trackgeojson?.geoJson) {
      return trackgeojson.geoJson;
    }
    if (trackgeojson?.geometry) {
      return trackgeojson.geometry;
    }
    if (trackgeojson?._geometry) {
      return trackgeojson._geometry;
    }
    return trackgeojson;
  }

  private _getLineStyle(): Array<Style> {
    const style: Array<Style> = [],
      selected: boolean = false;

    let color: string = '255,0,0'; // this._featuresService.color(id),
    const strokeWidth: number = 3, // this._featuresService.strokeWidth(id),
      strokeOpacity: number = 1, // this._featuresService.strokeOpacity(id),
      lineDash: Array<number> = [], // this._featuresService.lineDash(id),
      lineCap: CanvasLineCap = 'round', // this._featuresService.lineCap(id),
      currentZoom: number = this._view.getZoom();

    color = 'rgba(' + color + ',' + strokeOpacity + ')';

    // if (
    //   ("" + this._selectedFeatureId === "" + id ||
    //     "" + this._hoveredFeatureId === "" + id) &&
    //   !forceDeselect
    // ) {
    //   selected = true;
    //   strokeWidth = useWmtStyle ? strokeWidth : Math.min(5, strokeWidth + 2);
    //   strokeOpacity = useWmtStyle
    //     ? strokeOpacity
    //     : Math.min(1, strokeOpacity + 0.1);
    //   if (!useWmtStyle) color = this._themeService.getSelectColor();
    // }

    const zIndex: number = 50; //this._getZIndex(id, "line", selected);

    if (selected) {
      style.push(
        new Style({
          stroke: new Stroke({
            color: 'rgba(226, 249, 0, 0.6)',
            width: 10,
          }),
          zIndex: zIndex + 5,
        })
      );
    }

    style.push(
      new Style({
        stroke: new Stroke({
          color,
          width: strokeWidth,
          lineDash,
          lineCap,
        }),
        zIndex: zIndex + 2,
      })
    );

    return style;
  }

  /**
   * Center the current map view to the current physical location
   */
  private _centerMapToLocation() {
    if (this._location) {
      this._view.animate({
        center: this._mapService.coordsFromLonLat([
          this._location.longitude,
          this._location.latitude,
        ]),
        zoom: this._view.getZoom() >= 14 ? this._view.getZoom() : 14,
      });
    }
  }

  /**
   * Center the current map view to the current physical location
   */
  private _centerMapToTrack() {
    if (this._track.layer) {
      this._view.fit(this._track.layer.getSource().getExtent(), {
        padding: [10, 10, 10, 10],
      });
    }
  }

  /**
   * Initialize the base source of the map
   *
   * @returns the XYZ source to use
   */
  private _initializeBaseSource() {
    return new XYZ({
      maxZoom: 16,
      minZoom: 1,
      tileLoadFunction: (tile: any, url: string) => {
        tile.getImage().src = url;
      },
      tileUrlFunction: (c) => {
        return (
          'https://tiles.webmapp.it/blankmap/' +
          c[0] +
          '/' +
          c[1] +
          '/' +
          c[2] +
          '.png'
        );
      },
      projection: 'EPSG:3857',
      tileSize: [256, 256],
    });
  }

  private _generateColor(str) {
    const rgb = [0, 0, 0];
    for (let i = 0; i < str.length; i++) {
      const v = str.charCodeAt(i);
      rgb[v % 3] = (rgb[i % 3] + 13 * (v % 13)) % 12;
    }
    let r = 4 + rgb[0];
    let g = 4 + rgb[1];
    let b = 4 + rgb[2];
    r = r * 16 + r;
    g = g * 16 + g;
    b = b * 16 + b;
    return [r, g, b, 1];
  }

  private _initializeVectorTileBaseLayer(data): VectorTileLayer {
    const layerStyleMap = {},
      layerStyleVisibility = {};
    data.vector_layers.forEach((el) => {
      const color = this._generateColor(el.id);
      if (el.id === 'water') {
        layerStyleMap[el.id] = new Style({
          fill: new Fill({ color }),
        });
      } else {
        layerStyleMap[el.id] = new Style({
          stroke: new Stroke({ color, width: 1 }),
        });
      }
      layerStyleVisibility[el.id] = true;
    });

    return new VectorTileLayer({
      preload: 1,
      source: new VectorTileSource({
        format: new MVT(),
        tileGrid: createXYZ({
          minZoom: data.minzoom,
          maxZoom: data.maxzoom,
        }),
        urls: data.tiles,
      }),
      //extent: ol.proj.transformExtent(data['bounds'], 'EPSG:4326', 'EPSG:3857'),
      style: (feature, resolution) => {
        const layerId = feature.get('layer');
        if (!layerStyleVisibility[layerId]) return null;
        const style = layerStyleMap[layerId];
        return [style];
      },
      zIndex: 10000,
    });
  }

  /**
   * Initialize the base source of the map
   *
   * @returns the VectorTile source to use
   */
  private _initializeVectorTileBaseSource(): VectorTileSource {
    // return new VectorTileSource({
    //   // format: new MVT(),
    //   format: new GML
    //   url: 'https://tiles.webmapp.it/tiles/{z}/{y}/{x}.pbf',
    // });
    return undefined;
  }

  /**
   * Handle the location animation
   */
  private _animateLocation(): void {
    if (
      !this._locationAnimationState.startTime ||
      !this._locationAnimationState.startLocation
    ) {
      if (this._locationAnimationState.goalLocation) {
        this._setLocation(this._locationAnimationState.goalLocation);
      } else if (
        typeof this._locationAnimationState.goalAccuracy === 'number'
      ) {
        this._setLocationAccuracy(this._locationAnimationState.goalAccuracy);
      }
      this._stopLocationAnimation();
    } else if (
      !this._locationAnimationState.goalLocation &&
      typeof this._locationAnimationState.goalAccuracy !== 'number'
    ) {
      this._stopLocationAnimation();
    } else {
      const delta: number =
        Math.min(Date.now() - this._locationAnimationState.startTime, 500) /
        500;
      if (delta < 1) {
        if (this._locationAnimationState.goalLocation) {
          const deltaLongitude: number =
              this._locationAnimationState.goalLocation.longitude -
              this._locationAnimationState.startLocation.longitude,
            deltaLatitude: number =
              this._locationAnimationState.goalLocation.latitude -
              this._locationAnimationState.startLocation.latitude,
            deltaAccuracy: number = this._locationAnimationState.goalAccuracy
              ? this._locationAnimationState.goalAccuracy -
                this._locationAnimationState.startLocation.accuracy
              : this._locationAnimationState.goalLocation.accuracy
              ? this._locationAnimationState.goalLocation.accuracy -
                this._locationAnimationState.startLocation.accuracy
              : 0;

          if (
            deltaLongitude === 0 &&
            deltaLatitude === 0 &&
            deltaAccuracy === 0
          ) {
            // No movement needed
            this._stopLocationAnimation();
            this._updateLocationLayer();
          } else if (deltaLongitude === 0 && deltaLatitude === 0) {
            // Update accuracy
            this._locationAnimationState.goalAccuracy = this
              ._locationAnimationState.goalAccuracy
              ? this._locationAnimationState.goalAccuracy
              : this._locationAnimationState.goalLocation.accuracy;
            this._locationAnimationState.goalLocation = undefined;
            this._setLocationAccuracy(
              this._locationAnimationState.startLocation.accuracy +
                delta * deltaAccuracy
            );
          } else {
            // Update location
            const newLocation: CLocation = new CLocation(
              this._locationAnimationState.startLocation.longitude +
                delta * deltaLongitude,
              this._locationAnimationState.startLocation.latitude +
                delta * deltaLatitude,
              undefined,
              this._locationAnimationState.startLocation.accuracy +
                delta * deltaAccuracy
            );
            this._setLocation(newLocation);
          }
        } else {
          const deltaAccuracy: number =
            typeof this._locationAnimationState.startLocation.accuracy ===
            'number'
              ? this._locationAnimationState.goalAccuracy -
                this._locationAnimationState.startLocation.accuracy
              : 0;

          if (deltaAccuracy === 0) {
            this._stopLocationAnimation();
            this._updateLocationLayer();
            return;
          }

          this._setLocationAccuracy(
            this._locationAnimationState.startLocation.accuracy +
              delta * deltaAccuracy
          );
        }
        this._map.once('postrender', () => {
          this._animateLocation();
        });
      } else this._stopLocationAnimation();

      this._updateLocationLayer();
    }
  }

  /**
   * Force the location layer update
   */
  private _updateLocationLayer(): void {
    this._locationIcon?.location?.changed();
    this._locationIcon?.accuracy?.changed();
    this._locationIcon?.point?.changed();
    this._locationIcon?.circle?.changed();
    this._locationIcon?.layer?.changed();
    this._map?.render();
  }

  /**
   * Change the accuracy around the location visible in the map
   *
   * @param accuracy the accuracy of the position
   */
  private _setLocationAccuracy(accuracy: number): void {
    if (!this._locationIcon.accuracy) return;
    else {
      if (typeof accuracy === 'number' && !Number.isNaN(accuracy))
        this._locationIcon.circle.setRadius(accuracy);
      else this._locationIcon.circle.setRadius(DEF_LOCATION_ACCURACY);
    }
  }

  /**
   * Perform the needed actions to stop the current location animation
   */
  private _stopLocationAnimation(): void {
    this._locationAnimationState.animating = false;
    this._locationAnimationState.startLocation = undefined;
    this._locationAnimationState.startTime = undefined;
    this._locationAnimationState.goalAccuracy = undefined;
    this._locationAnimationState.goalLocation = undefined;
  }

  /**
   * Show in the map the current location using the blue circle and the semi-transparent accuracy circle
   *
   * @param location the location
   */
  private _setLocation(location: ILocation): void {
    const mapLocation: Coordinate = this._mapService.coordsFromLonLat([
        location?.longitude,
        location?.latitude,
      ]),
      accuracy: number =
        typeof location !== 'undefined' && typeof location.accuracy === 'number'
          ? location.accuracy
          : DEF_LOCATION_ACCURACY;

    // Handle point
    if (!this._locationIcon.location) {
      this._locationIcon.location = new Feature();
      this._locationIcon.point = new Point(mapLocation);
      this._locationIcon.location.setGeometry(this._locationIcon.point);
      this._locationIcon.location.setStyle(this._locationIconStyle);
    } else this._locationIcon.point.setCoordinates(mapLocation);

    // Handle accuracy
    if (!this._locationIcon.accuracy) {
      this._locationIcon.accuracy = new Feature();
      this._locationIcon.circle = new Circle(mapLocation, accuracy);
      this._locationIcon.accuracy.setGeometry(this._locationIcon.circle);
    } else this._locationIcon.circle.setCenterAndRadius(mapLocation, accuracy);

    if (!this._locationIcon.layer) {
      this._locationIcon.layer = new VectorLayer({
        source: new VectorSource({
          features: [this._locationIcon.location, this._locationIcon.accuracy],
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Number.MAX_SAFE_INTEGER,
      });
    }
    try {
      this._map.addLayer(this._locationIcon.layer);
    } catch (e) {}
  }
}
