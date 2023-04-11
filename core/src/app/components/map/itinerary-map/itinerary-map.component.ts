import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import defaultImage from '../../../../assets/images/defaultImageB64.json';
import {buffer, Extent} from 'ol/extent';
import FlowLine from 'ol-ext/style/FlowLine';
// ol imports
import {Coordinate} from 'ol/coordinate';
import Circle from 'ol/geom/Circle';
import Feature from 'ol/Feature';
import Icon from 'ol/style/Icon';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View, {FitOptions} from 'ol/View';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import {defaults as defaultInteractions} from 'ol/interaction.js';
import ScaleLineControl from 'ol/control/ScaleLine';
import {
  DEF_LOCATION_ACCURACY,
  DEF_LOCATION_Z_INDEX,
  DEF_MAP_CLUSTER_ZOOM_DURATION,
  DEF_MAP_CLUSTER_CLICK_TOLERANCE,
  DEF_MAP_MAX_ZOOM,
  DEF_MAP_MIN_ZOOM,
  DEF_MAP_MAX_CENTER_ZOOM,
  DEF_MAP_ROTATION_DURATION,
  DEF_LINE_COLOR,
  CIRCULARTOLERANCE,
  CLUSTERLAYERZINDEX,
  ALERT_POI_RADIUS,
  POISLAYERZINDEX,
  SELECTEDPOIANIMATIONDURATION,
  TRACKLAYERZINDEX,
  TRACKMARKERLAYERZINDEX,
} from '../../../constants/map';

import {ILocation} from 'src/app/types/location';
import {CLocation} from 'src/app/classes/clocation';
import {EMapLocationState} from 'src/app/types/emap-location-state.enum';
import {MapService} from 'src/app/services/base/map.service';
import Stroke from 'ol/style/Stroke';
import {ITrack} from 'src/app/types/track';
import {IGeojsonCluster, IGeojsonPoi, IGeojsonPoiDetailed, ILineString} from 'src/app/types/model';
import {fromLonLat, toLonLat} from 'ol/proj';
import {ClusterMarker, iMarker, MapMoveEvent, PoiMarker} from 'src/app/types/map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Geometry from 'ol/geom/Geometry';
import {AuthService} from 'src/app/services/auth.service';
import {take, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import Fill from 'ol/style/Fill';
import LineString from 'ol/geom/LineString';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {ISlopeChartHoverElements} from 'src/app/types/slope-chart';
import {GeohubService} from 'src/app/services/geohub.service';
import {MarkerService} from 'src/app/services/marker.service';
import {TilesService} from 'src/app/services/tiles.service';
import {ConfigService} from 'src/app/services/config.service';
import {Store} from '@ngrx/store';
import {IMapRootState} from 'src/app/store/map/map';
import {mapCurrentPoi, mapCurrentRelatedPoi} from 'src/app/store/map/map.selector';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import {IPoiMarker} from 'src/app/classes/features/cgeojson-feature';
import {getDistance} from 'ol/sphere';
import {GeolocationPage} from 'src/app/pages/abstract/geolocation';
import {BackgroundGeolocation} from '@awesome-cordova-plugins/background-geolocation/ngx';
import {Platform} from '@ionic/angular';

@Component({
  selector: 'itinerary-webmapp-map',
  templateUrl: './itinerary-map.component.html',
  styleUrls: ['./itinerary-map.component.scss'],
})
export class ItineraryMapComponent
  extends GeolocationPage
  implements AfterViewInit, OnDestroy, OnChanges
{
  private _bottomPadding: number = 0;
  private _clusterLayer: VectorLayer<VectorSource>;
  private _clusterMarkers: ClusterMarker[] = [];
  private _currentLocation;
  private _defaultFeatureColor = DEF_LINE_COLOR;
  private _destroyer: Subject<boolean> = new Subject<boolean>();
  private _height: number;
  private _lastClusterMarkerTransparency;
  private _leftPadding: number = 0;
  private _location: ILocation;
  private _locationAnimationState: {
    goalLocation?: ILocation;
    goalAccuracy?: number;
    animating: boolean;
    startTime?: number;
    startLocation?: ILocation;
  };
  private _locationIcon: {
    layer: VectorLayer<VectorSource>;
    location: Feature;
    accuracy: Feature;
    point: Point;
    circle: Circle;
    icon: string;
  };
  // Location Icon
  private _locationIconArrow: Icon;
  private _locationIconArrowStyle: Style;
  private _locationIconStyle: Style;
  private _map: Map;
  private _poiMarkers: PoiMarker[] = [];
  private _poisLayer: VectorLayer<VectorSource>;
  private _position: ILocation = null;
  private _rightPadding: number = 0;
  private _selectedPoi: {
    lastSelectedPoi?: IGeojsonPoi;
    newSelectedPoi?: IGeojsonPoi;
    marker?: PoiMarker;
    style?: Style;
    animating?;
    startTime?;
  } = {};
  private _selectedPoiLayer: VectorLayer<VectorSource>;
  private _selectedPoiMarker: IPoiMarker;
  private _slopeChartLayer: VectorLayer<VectorSource>;
  private _slopeChartPoint: Feature<Point>;
  private _slopeChartSource: VectorSource;
  private _slopeChartTrack: Feature<LineString>;
  private _topPadding: number = 0;
  private _track: {
    layer: VectorLayer<VectorSource>;
    markerslayer: VectorLayer<VectorSource>;
    track: Feature[];
    registeredTrack: ITrack;
  };
  private _view: View;

  @Input('bottomPadding') set bottomPadding(value: number) {
    if (this._bottomPadding != value) {
      this._bottomPadding = value;
      if (this._track.registeredTrack && this.centerToTrack) {
        this._centerMapToTrack();
      }
    }
  }

  @Input('boundingbox') set boundingbox(value: number[]) {
    if (value) {
      this._centerMapToBoundingBox(value);
    }
  }

  @Input('clusters') set clusters(value: Array<IGeojsonCluster>) {
    if (value) {
      setTimeout(() => {
        this._addClusterMarkers(value);
      }, 0);
    }
  }

  @Input('height') set height(value: number[] | number) {
    let height = value as number;
    let topPadding = this._bottomPadding;
    let bottomPadding = this._topPadding;
    if (Array.isArray(value)) {
      height = value[0];
      topPadding = value[1] ? value[1] : this._topPadding;
      bottomPadding = value[2] ? value[2] : this._bottomPadding;
    }
    if (
      this._height != height ||
      this._bottomPadding != bottomPadding ||
      this._topPadding != topPadding
    ) {
      this._height = height;
      this._bottomPadding = bottomPadding;
      this._topPadding = topPadding;
      if (this._track.registeredTrack && this.centerToTrack) {
        this._centerMapToTrack();
      }
    }
  }

  @Input('leftPadding') set leftPadding(value: number) {
    if (this._leftPadding != value) {
      this._leftPadding = value;
      if (this._track.registeredTrack && this.centerToTrack) this._centerMapToTrack();
    }
  }

  @Input('pois') set pois(value: IGeojsonPoi[]) {
    if (value) {
      const valueClone = JSON.parse(JSON.stringify(value));
      setTimeout(() => {
        this._addPoisMarkers(valueClone);
      }, 0);
    }
  }

  @Input('position') set position(value: ILocation) {
    if (value) {
      setTimeout(() => {
        this._position = value;
        this._location = value;
        this.animateLocation(value);
        this._centerMapToLocation();
      }, 0);
    }
  }

  @Input('rightPadding') set rightPadding(value: number) {
    if (this._rightPadding != value) {
      this._rightPadding = value;
      if (this._track.registeredTrack && this.centerToTrack) this._centerMapToTrack();
    }
  }

  @Input('selectedpoi') set selectedpoi(value: IGeojsonPoi) {
    if (this._selectedPoiLayer != null) {
      this._map.removeLayer(this._selectedPoiLayer);
      this._selectedPoiLayer = undefined;
    }
    if (value != null) {
      const currentPoi = this._poiMarkers.find(p => +p.id === value.properties.id);
      if (currentPoi != null) {
        this._fitView(currentPoi.icon.getGeometry() as any);
        this._selectCurrentPoi(currentPoi);
      }
    }
  }

  @Input('static') set setStatic(value: boolean) {
    this.static = value;
    if (this._map) {
      const interactions = defaultInteractions({
        doubleClickZoom: !value,
        dragPan: !value,
        mouseWheelZoom: !value,
        pinchRotate: false,
      });
      this._map.getInteractions().forEach(inter => {
        this._map.removeInteraction(inter);
      });
      interactions.forEach(interaction => {
        this._map.addInteraction(interaction);
      });
    }
  }

  @Input('slopeChartElements') set slopeChartElements(value: ISlopeChartHoverElements) {
    this._drawTemporaryLocationFeature(value?.location, value?.track);
  }

  @Input('track') set track(value: any) {
    if (value) {
      setTimeout(() => {
        this._track.registeredTrack = value;
        this.centerToTrack = true;
        if (value.geojson) {
          this.drawTrack(value.geojson);
        } else {
          this.drawTrack(value);
        }
      }, 400);
    } else {
      this.deleteTrack();
    }
  }

  get itineraryMap(): Map {
    return this._map;
  }

  @Input() alertPoiRadius: number = ALERT_POI_RADIUS;
  @Input('btnposition') btnposition: string = 'bottom';
  @Input() conf: IMAP;
  @Input() focus: boolean = false;
  @Input('hideEndMarker') hideEndMarker: boolean = false;
  @Input('hidePosition') hidePosition: boolean = false;
  @Input('hideRegister') hideRegister: boolean = false;
  @Input('noPoiSelection') nopoiSelection: boolean = false;
  @Input('registering') registering: boolean = false;
  @Input('showLayer') showLayer: boolean = false;
  @Input('start-view') startView: number[] = [10.4147, 43.7118, 9];
  @Input('animation') useAnimation: boolean = true;
  @Input('cache') useCache: boolean = false;
  @Output() clickcluster: EventEmitter<IGeojsonCluster> = new EventEmitter();
  @Output() clickpoi: EventEmitter<IGeojsonPoi> = new EventEmitter();
  @Output() move: EventEmitter<MapMoveEvent> = new EventEmitter();
  @Output() moveBtn: EventEmitter<number> = new EventEmitter();
  @Output() nearestPoiEvt: EventEmitter<Feature<Geometry>> = new EventEmitter();
  @Output() rotate: EventEmitter<number> = new EventEmitter();
  @Output() touch: EventEmitter<any> = new EventEmitter();
  @Output() unlocked: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('clusterContainer', {read: ViewContainerRef}) clusterContainer;
  @ViewChild('map') mapDiv: ElementRef;
  @ViewChild('scaleLineContainer') scaleLineContainer: ElementRef;

  public centerToTrack: boolean = false;
  currentPoi$: Observable<IGeojsonPoiDetailed> = this._storeMap.select(mapCurrentPoi);
  public isLoggedIn: boolean = false;
  public isRecordEnabled: boolean = false;
  public isRecording: boolean = false;
  public locationState: EMapLocationState;
  public mapDegrees: number;
  relatedPoi$: Observable<IGeojsonPoiDetailed[]> = this._storeMap.select(mapCurrentRelatedPoi);
  public showRecBtn: boolean = true;
  public sortedComponent: any[] = [];
  public static: boolean;
  public timer: any;

  constructor(
    private _authService: AuthService,
    private _configService: ConfigService,
    private _geohubService: GeohubService,
    private _mapService: MapService,
    private _markerService: MarkerService,
    private _tilesService: TilesService,
    private _storeMap: Store<IMapRootState>,
    private _cdr: ChangeDetectorRef,
    _backgroundGeolocation: BackgroundGeolocation,
    _platform: Platform,
  ) {
    super( _platform);
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
      markerslayer: null,
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

    this.isRecordEnabled = this._configService.isRecordEnabled();
  }

  _distance(c1: Coordinate, c2: Coordinate) {
    return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
  }

  _getNearest(features: Feature<Geometry>[], coordinate: Coordinate) {
    let ret: Feature<Geometry> = features[0];
    let minDistance = Number.MAX_VALUE;
    features.forEach(feature => {
      const geom = feature.getGeometry() as Point;
      let distance = this._distance(geom.getFlatCoordinates(), coordinate);
      if (distance < minDistance) {
        minDistance = distance;
        ret = feature;
      }
    });
    return ret;
  }

  _getNearestFeatureOfLayer(
    layer: VectorLayer<VectorSource>,
    evt: MapBrowserEvent<UIEvent>,
  ): Feature<Geometry> {
    const precision = this._view.getResolution() * DEF_MAP_CLUSTER_CLICK_TOLERANCE;
    let nearestFeature = null;
    const features: Feature<Geometry>[] = [];

    if (layer && layer.getSource()) {
      layer
        .getSource()
        .forEachFeatureInExtent(
          buffer(
            [evt.coordinate[0], evt.coordinate[1], evt.coordinate[0], evt.coordinate[1]],
            precision,
          ),
          feature => {
            features.push(feature);
          },
        );
    }

    if (features.length) {
      nearestFeature = this._getNearest(features, evt.coordinate);
    }

    return nearestFeature;
  }

  _getPoint(coordinates) {
    const position = fromLonLat(coordinates);
    return new Point([position[0], position[1]]);
  }

  _selectedPoiMove(event) {
    if (this._selectedPoi.animating) {
      const time = event.frameState.time;
      const elapsedTime = time - this._selectedPoi.startTime;
      const distance = elapsedTime / SELECTEDPOIANIMATIONDURATION;

      if (distance > 1) {
        this._selectedPoistopAnimation();
        return;
      }

      const newPositionCoords = this.newAnimationPosition(
        this._selectedPoi.lastSelectedPoi.geometry.coordinates,
        this._selectedPoi.newSelectedPoi.geometry.coordinates,
        distance,
      );

      this._selectedPoi.marker.icon.setGeometry(this._getPoint(newPositionCoords));

      // this._selectedPoi.marker.icon.setGeometry();
      // const vectorContext = getVectorContext(event);
      // vectorContext.setStyle(this._selectedPoi.style);
      // vectorContext.drawGeometry(this._selectedPoi.position);
      // tell OpenLayers to continue the postrender animation
      this._map.render();
    }
  }

  _selectedPoiStartAnimation() {
    this._selectedPoi.animating = true;
    this._selectedPoi.startTime = Date.now();
    this._selectedPoiLayer.on('postrender', event => {
      this._selectedPoiMove(event);
    });
    // this._selectedPoi.marker.icon.setGeometry(null);
  }

  _selectedPoistopAnimation() {
    this._selectedPoi.animating = false;

    this._selectedPoi.marker.icon.setGeometry(
      this._getPoint(this._selectedPoi.newSelectedPoi.geometry.coordinates),
    );

    this._selectedPoiLayer.un('postrender', event => {
      this._selectedPoiMove(event);
    });
    this._selectedPoi.lastSelectedPoi = this._selectedPoi.newSelectedPoi;
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
        this._locationIcon.point.getCoordinates(),
      );
      this._locationAnimationState.startLocation = new CLocation(
        coordinates[0],
        coordinates[1],
        undefined,
        this._locationIcon.circle.getRadius(),
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

  currentLocation(coords) {
    setTimeout(() => {
      this._currentLocation = fromLonLat([coords.longitude, coords.latitude]);
      const nearestPoi = this._calculateNearestPoint(
        this._currentLocation,
        this._poisLayer.getSource(),
      );
      if (nearestPoi != null) {
        ((nearestPoi.getStyle() as any).getImage() as any).setScale(1.2);
      }
      this.nearestPoiEvt.emit(nearestPoi);
    }, 500);
  }

  deleteTrack() {
    if (this._map && this._track.layer) {
      this._map.removeLayer(this._track.layer);
      this._map.removeLayer(this._track.markerslayer);
      this._selectedPoiLayer = undefined;
    }
    this._track.registeredTrack = null;
  }

  // isRecording() {
  //   return this.geolocationService.recording;
  // }

  /**
   * Draw a track in the map, remove a prevoius track
   *
   * @param geojson geojson of the track
   */
  async drawTrack(trackgeojson: any) {
    const geojson: any = this.getGeoJson(trackgeojson);
    const isFlowLine = this.conf?.flow_line_quote_show ?? false;
    const orangeTreshold = this.conf?.flow_line_quote_orange ?? 800;
    const redTreshold = this.conf?.flow_line_quote_red ?? 1500;
    const flowStyle = new FlowLine({
      lineCap: 'butt',
      color: function (f, step) {
        const geometry = f.getGeometry().getCoordinates();
        const position = +(geometry.length * step).toFixed();
        const currentLocation = geometry[position];
        let currentAltitude = 100;
        try {
          currentAltitude = currentLocation[2];
        } catch (_) {}

        if (currentAltitude >= orangeTreshold && currentAltitude < redTreshold) {
          return 'orange';
        }
        if (currentAltitude >= redTreshold) {
          return 'red';
        }
        return 'green';
      },
      width: 10,
    });
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
          return isFlowLine ? flowStyle : this._getLineStyle('#caaf15');
        },
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: TRACKLAYERZINDEX,
      });
    } else {
      this._track.layer.getSource().clear();
      this._track.layer.getSource().addFeatures(features);
    }

    this._track.markerslayer = this._createLayer(this._track.markerslayer, TRACKMARKERLAYERZINDEX);
    this._track.markerslayer.getSource().clear();

    if (!this.static) {
      const startmark = await this._createStartTrackIcon(trackgeojson);
      this._addIconToLayer(this._track.markerslayer, startmark.marker.icon);
      if (!this.isCircular(trackgeojson) && !this.hideEndMarker) {
        const endmark = await this._createEndTrackIcon(trackgeojson);
        this._addIconToLayer(this._track.markerslayer, endmark.marker.icon);
      }
    }

    try {
      this._map.addLayer(this._track.layer);
      this._map.addLayer(this._track.markerslayer);
    } catch (e) {}
    if (this.centerToTrack) {
      this._centerMapToTrack();
    }
  }

  ionViewWillLeave() {
    clearInterval(this.timer);
    this._destroyer.next(true);
  }

  newAnimationPosition(coordStart, coordEnd, distance) {
    const deltaX = (coordEnd[0] - coordStart[0]) * distance;
    const deltaY = (coordEnd[1] - coordStart[1]) * distance;

    return [coordStart[0] + deltaX, coordStart[1] + deltaY];
  }

  ngAfterViewInit() {
    this._authService.onStateChange.pipe(takeUntil(this._destroyer)).subscribe((user: IUser) => {
      this.isLoggedIn = this._authService.isLoggedIn;
    });

    if (!this.startView) this.startView = [10.4147, 43.7118, 9];

    this._view = new View({
      center: this._mapService.coordsFromLonLat([this.startView[0], this.startView[1]]),
      zoom: this.startView[2],
      maxZoom: DEF_MAP_MAX_ZOOM,
      minZoom: DEF_MAP_MIN_ZOOM,
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
        pinchRotate: false,
      });
    }

    this._map = new Map({
      target: this.mapDiv.nativeElement,
      view: this._view,
      controls: [
        new ScaleLineControl({
          units: 'metric',
          minWidth: 50,
          target: this.scaleLineContainer.nativeElement,
        }),
      ],
      moveTolerance: 3,
    });

    this._map.addLayer(
      new TileLayer({
        source: this._initializeBaseSource(),
        visible: true,
        zIndex: 1,
      }),
    );
    this.relatedPoi$.pipe(take(1)).subscribe(pois => {
      this._addPoisMarkers(pois);
    });

    //TODO: figure out why this must be called inside a timeout
    setTimeout(() => {
      this._map.updateSize();
      this._centerMapToTrack();
    }, 0);

    //TODO: test for ensure presence of map
    this.timer = setInterval(() => {
      if (this.static) {
        if (this._track.registeredTrack && this._track.registeredTrack.geojson) {
          this.centerToTrack = true;
          this.drawTrack(this._track.registeredTrack.geojson);
        }
      }
      this._map.updateSize();
    }, 1000);

    this._map.on('click', evt => {
      this._mapClick(evt);
    });
    this._map.on('pointermove', event => {
      this.touch.emit();
    });

    this._map.on('postrender', () => {
      const degree = (this._map.getView().getRotation() / (2 * Math.PI)) * 360;
      if (degree != this.mapDegrees) {
        this.rotate.emit(degree);
      }
      this.mapDegrees = degree;
    });

    if (this.registering) {
      this.locationState = EMapLocationState.FOLLOW;
      this._centerMapToLocation();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.focus != null) {
      if (changes.focus.currentValue == false) {
        this.btnposition = 'middle';
      }
      if (changes.focus.currentValue == true) {
        this.btnposition = 'bottom';
      }

      if (this._map != null) {
        this._cdr.detectChanges();
        this._map.updateSize();
      }
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    clearInterval(this.timer);
    this._destroyer.next(true);
  }

  public orientNorth() {
    this._view.animate({
      duration: DEF_MAP_ROTATION_DURATION,
      rotation: 0,
    });
  }

  recBtnMove(val) {
    this.moveBtn.emit(val);
  }

  recBtnUnlocked(val) {
    this.showRecBtn = false;
    this.unlocked.emit(val);
  }

  reset() {
    this.showRecBtn = true;
  }

  private async _addClusterMarkers(values: Array<IGeojsonCluster>) {
    let transparent: boolean = !!this._track.registeredTrack;
    this._clusterLayer = this._createLayer(this._clusterLayer, CLUSTERLAYERZINDEX);
    const reset = this._lastClusterMarkerTransparency != transparent;

    if (values) {
      for (let i = this._clusterMarkers.length - 1; i >= 0; i--) {
        const ov = this._clusterMarkers[i];
        if (
          !values.find(x => this._idOfClusterMarker(x) == this._idOfClusterMarker(ov.cluster)) ||
          reset
        ) {
          this._removeIconFromLayer(this._clusterLayer, ov.icon);
          this._clusterMarkers.splice(i, 1);
        }
      }

      for (const cluster of values) {
        if (
          !this._clusterMarkers.find(
            x => this._idOfClusterMarker(x.cluster) == this._idOfClusterMarker(cluster),
          )
        ) {
          const icon = await this._createClusterCanvasIcon(cluster, transparent);
          this._addIconToLayer(this._clusterLayer, icon.icon);
          this._clusterMarkers.push(icon);
        }
      }
    }

    this._lastClusterMarkerTransparency = transparent;
  }

  private _addIconToLayer(layer: VectorLayer<VectorSource>, icon: Feature<Geometry>) {
    const source = layer.getSource();
    layer.getSource().addFeature(icon);
  }

  private async _addPoisMarkers(poiCollection: Array<IGeojsonPoi>) {
    this._poisLayer = this._createLayer(this._poisLayer, POISLAYERZINDEX);

    if (poiCollection) {
      for (let i = this._poiMarkers.length - 1; i >= 0; i--) {
        const ov = this._poiMarkers[i];
        if (
          !poiCollection.find(x => x.properties.id + '' == ov.id && ov.poi.isSmall == x.isSmall)
        ) {
          this._removeIconFromLayer(this._poisLayer, ov.icon);
          this._poiMarkers.splice(i, 1);
        }
      }
      for (const poi of poiCollection) {
        if (
          !this._poiMarkers.find(
            x => x.id == poi.properties.id + '' && poi.isSmall == x.poi.isSmall,
          )
        ) {
          const {marker} = await this._createPoiCanvasIcon(poi);
          this._addIconToLayer(this._poisLayer, marker.icon);
          this._poiMarkers.push(marker);
        }
      }
    }
  }

  /**
   * Handle the location animation
   */
  private _animateLocation(): void {
    if (!this._locationAnimationState.startTime || !this._locationAnimationState.startLocation) {
      if (this._locationAnimationState.goalLocation) {
        this._setLocation(this._locationAnimationState.goalLocation);
      } else if (typeof this._locationAnimationState.goalAccuracy === 'number') {
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
        Math.min(Date.now() - this._locationAnimationState.startTime, 500) / 500;
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

          if (deltaLongitude === 0 && deltaLatitude === 0 && deltaAccuracy === 0) {
            // No movement needed
            this._stopLocationAnimation();
            this._updateLocationLayer();
          } else if (deltaLongitude === 0 && deltaLatitude === 0) {
            // Update accuracy
            this._locationAnimationState.goalAccuracy = this._locationAnimationState.goalAccuracy
              ? this._locationAnimationState.goalAccuracy
              : this._locationAnimationState.goalLocation.accuracy;
            this._locationAnimationState.goalLocation = undefined;
            this._setLocationAccuracy(
              this._locationAnimationState.startLocation.accuracy + delta * deltaAccuracy,
            );
          } else {
            // Update location
            const newLocation: CLocation = new CLocation(
              this._locationAnimationState.startLocation.longitude + delta * deltaLongitude,
              this._locationAnimationState.startLocation.latitude + delta * deltaLatitude,
              undefined,
              this._locationAnimationState.startLocation.accuracy + delta * deltaAccuracy,
            );
            this._setLocation(newLocation);
          }
        } else {
          const deltaAccuracy: number =
            typeof this._locationAnimationState.startLocation.accuracy === 'number'
              ? this._locationAnimationState.goalAccuracy -
                this._locationAnimationState.startLocation.accuracy
              : 0;

          if (deltaAccuracy === 0) {
            this._stopLocationAnimation();
            this._updateLocationLayer();
            return;
          }

          this._setLocationAccuracy(
            this._locationAnimationState.startLocation.accuracy + delta * deltaAccuracy,
          );
        }
        this._map.once('postrender', () => {
          this._animateLocation();
        });
      } else this._stopLocationAnimation();

      this._updateLocationLayer();
    }
  }

  private _calculateNearestPoint(
    coord: Coordinate,
    feature: VectorSource<Geometry>,
  ): Feature<Geometry> | null {
    const nFeature = feature.getClosestFeatureToCoordinate(coord);
    if (nFeature != null) {
      const nFeatureCoords = nFeature.getGeometry();
      const distanceFromUser = getDistance(
        toLonLat(coord),
        toLonLat((nFeatureCoords as Point).getCoordinates()),
      );
      if (distanceFromUser > this.alertPoiRadius) {
        return null;
      }
      const oldProperties = nFeature.getProperties();
      nFeature.setProperties({...oldProperties, ...{distance_from_user: distanceFromUser}});
      return nFeature;
    }
    return null;
  }

  /**
   * Set the current map view to a specific bounding box
   */
  private _centerMapToBoundingBox(boundingbox) {
    const latlon = this._mapService.extentFromLonLat(boundingbox);
    this._view.fit(latlon, {
      duration: this.useAnimation ? DEF_MAP_CLUSTER_ZOOM_DURATION : 0,
      maxZoom: DEF_MAP_MAX_ZOOM,
      padding: [50, 50, 50, 50],
    });
  }

  /**
   * Center the current map view to the current physical location
   */
  private _centerMapToLocation() {
    if (this._location) {
      this._view.animate({
        duration: this.useAnimation ? DEF_MAP_CLUSTER_ZOOM_DURATION : 0,
        center: this._mapService.coordsFromLonLat([
          this._location.longitude,
          this._location.latitude,
        ]),
        zoom:
          this._view.getZoom() >= DEF_MAP_MAX_CENTER_ZOOM
            ? this._view.getZoom()
            : DEF_MAP_MAX_CENTER_ZOOM,
      });
    }
  }

  /**
   * Center the current map view to the current physical location
   */
  private _centerMapToTrack() {
    if (this._track.layer) {
      const verticalPadding = !this._height || this._height > 500 ? 120 : this._height * 0.1;

      const padding = [
        verticalPadding + this._topPadding,
        this._rightPadding > 0
          ? this._rightPadding
          : Math.min(Math.max(this._map.getSize()[0] * 0.1, 10), 20),
        verticalPadding + this._bottomPadding,
        this._rightPadding > 0
          ? this._rightPadding
          : Math.min(Math.max(this._map.getSize()[0] * 0.1, 10), 20),
      ];

      this._view.fit(this._track.layer.getSource().getExtent(), {
        padding: padding,
        duration: this.useAnimation ? DEF_MAP_CLUSTER_ZOOM_DURATION : 0,
      });
    }
  }

  private async _createCanvasForHtml(html: string, size: number): Promise<HTMLImageElement> {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const canvasHtml =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      '<foreignObject width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
      html +
      '</div>' +
      '</foreignObject>' +
      '</svg>';

    const DOMURL = window.URL; // || window.webkitURL || window;

    const img = new Image();
    const svg = new Blob([canvasHtml], {
      type: 'image/svg+xml', //;charset=utf-8',
    });
    const url = DOMURL.createObjectURL(svg);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);
    };

    img.src = url;
    img.crossOrigin = 'Anonymous';

    return img;
  }

  private async _createClusterCanvasIcon(
    cluster: IGeojsonCluster,
    transparent: boolean = false,
  ): Promise<ClusterMarker> {
    const img = await this._createClusterCavasImage(cluster);

    const {iconFeature} = await this._createIconFeature(
      [cluster.geometry.coordinates[0] as number, cluster.geometry.coordinates[1] as number],
      img,
      this._markerService.clusterMarkerSize,
      transparent,
    );

    return {
      cluster,
      icon: iconFeature,
      // component: componentRef,
      id: this._idOfClusterMarker(cluster),
    };
  }

  private async _createClusterCavasImage(cluster: IGeojsonCluster): Promise<HTMLImageElement> {
    let isFavourite = false;
    if (cluster.properties.ids.length == 1) {
      isFavourite = await this._geohubService.isFavouriteTrack(cluster.properties.ids[0]);
    }
    const htmlTextCanvas = await this._markerService.createClusterMarkerHtmlForCanvas(
      cluster,
      isFavourite,
    );

    return this._createCanvasForHtml(htmlTextCanvas, this._markerService.clusterMarkerSize);
  }

  private async _createEndTrackIcon(
    trackgeojson,
    geometry = null,
  ): Promise<{marker: iMarker; style: Style}> {
    const img = await this._createEndTrackImage(trackgeojson);
    if (geometry == null && trackgeojson != null) {
      if (trackgeojson.coordinates != null) {
        geometry = trackgeojson.coordinates[trackgeojson.coordinates.length - 1];
      }
      if (trackgeojson.geometry != null && trackgeojson.geometry.coordinates != null) {
        geometry = trackgeojson.geometry.coordinates[trackgeojson.geometry.coordinates.length - 1];
      }
    }
    const {iconFeature, style} = await this._createIconFeature(
      geometry,
      img,
      this._markerService.trackMarkerSize,
      false,
      [0.2, 0.95],
    );
    return {
      marker: {
        icon: iconFeature,
        id: '',
      },
      style,
    };
  }

  private async _createEndTrackImage(trackgeojson: any): Promise<HTMLImageElement> {
    const htmlTextCanvas = await this._markerService.createEndTrackMarkerHtmlForCanvas(
      trackgeojson,
    );
    return this._createCanvasForHtml(htmlTextCanvas, this._markerService.poiMarkerSize);
  }

  private async _createIconFeature(
    coordinates: number[],
    img: HTMLImageElement,
    size: number,
    transparent: boolean = false,
    anchor: number[] = [0.5, 0.5],
  ): Promise<{iconFeature: Feature<Geometry>; style: Style}> {
    if (!coordinates) return;
    const position = fromLonLat([coordinates[0] as number, coordinates[1] as number]);

    const iconFeature = new Feature({
      geometry: new Point([position[0], position[1]]),
    });
    const style = new Style({
      image: new Icon({
        anchor,
        img: img,
        imgSize: [size, size],
        opacity: transparent ? 0.5 : 1,
      }),
    });

    iconFeature.setStyle(style);

    return {iconFeature, style};
  }

  private _createLayer(layer: VectorLayer<VectorSource>, zIndex: number) {
    if (!layer) {
      layer = new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex,
      });
      this._map.addLayer(layer);
    }
    return layer;
  }

  private async _createPoiCanvasIcon(
    poi: IGeojsonPoi,
    geometry = null,
    selected = false,
  ): Promise<{marker: PoiMarker; style: Style}> {
    const img = await this._createPoiCavasImage(poi, selected);
    const {iconFeature, style} = await this._createIconFeature(
      geometry
        ? geometry
        : [poi.geometry.coordinates[0] as number, poi.geometry.coordinates[1] as number],
      img,
      this._markerService.poiMarkerSize,
    );
    iconFeature.setProperties(poi.properties);
    return {
      marker: {
        poi,
        icon: iconFeature,
        id: poi.properties.id + '',
      },
      style,
    };
  }

  private async _createPoiCavasImage(
    poi: IGeojsonPoi,
    selected = false,
  ): Promise<HTMLImageElement> {
    const htmlTextCanvas = await this._createPoiMarkerHtmlForCanvas(poi, selected);
    return this._createCanvasForHtml(htmlTextCanvas, this._markerService.poiMarkerSize);
  }

  private async _createPoiMarkerHtmlForCanvas(value: any, selected = false): Promise<string> {
    let url = null;
    try {
      url = value.properties?.feature_image?.sizes['108x137'];
    } catch (e) {
      console.warn(
        `missed url properties?.feature_image?.sizes['108x137'] poi id ${value.properties.id}`,
        e,
      );
    }
    const img1b64: string | ArrayBuffer = await this._downloadBase64Img(url);

    let html = `
    <div class="webmapp-map-poimarker-container" style="position: relative;width: 30px;height: 60px;">`;

    html += `
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style=" position: absolute;  width: 46px;  height: 46px;  left: 0px;  top: 0px;">
          <circle opacity="${selected ? 1 : 0.2}" cx="23" cy="23" r="23" fill="${
      this._defaultFeatureColor
    }"/>
          <rect x="5" y="5" width="36" height="36" rx="18" fill="url(#img)" stroke="white" stroke-width="2"/>
          <defs>
            <pattern height="100%" width="100%" patternContentUnits="objectBoundingBox" id="img">
              <image height="1" width="1" preserveAspectRatio="xMidYMid slice" xlink:href="${img1b64}">
              </image>
            </pattern>
          </defs>
        </svg>`;
    html += ` </div>`;

    return html;
  }

  private async _createStartTrackIcon(
    trackgeojson,
    geometry = null,
  ): Promise<{marker: iMarker; style: Style}> {
    const img = await this._createStartTrackImage(trackgeojson);

    let coordinate = trackgeojson?.geometry?.coordinates[0]
      ? trackgeojson?.geometry?.coordinates[0]
      : trackgeojson?.coordinates[0];
    const {iconFeature, style} = await this._createIconFeature(
      geometry ? geometry : coordinate,
      img,
      this._markerService.trackMarkerSize,
      false,
      [0.45, 1],
    );
    return {
      marker: {
        icon: iconFeature,
        id: '',
      },
      style,
    };
  }

  private async _createStartTrackImage(trackgeojson: any): Promise<HTMLImageElement> {
    const htmlTextCanvas = await this._markerService.createStartTrackMarkerHtmlForCanvas(
      trackgeojson,
    );
    return this._createCanvasForHtml(htmlTextCanvas, this._markerService.poiMarkerSize);
  }

  private async _downloadBase64Img(url): Promise<string | ArrayBuffer> {
    if (url == null) {
      return defaultImage.image;
    }
    const opt = {};
    const data = await fetch(url, opt);
    const blob = await data.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      try {
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      } catch (error) {
        resolve('');
      }
    });
  }

  private _drawTemporaryLocationFeature(
    location?: ILocation,
    track?: CGeojsonLineStringFeature,
  ): void {
    if (location) {
      if (!this._slopeChartSource) {
        this._slopeChartSource = new VectorSource({
          format: new GeoJSON(),
        });
      }
      if (!this._slopeChartLayer) {
        this._slopeChartLayer = new VectorLayer({
          source: this._slopeChartSource,
          style: feature => {
            if (feature.getGeometry().getType() === 'Point') {
              return [
                new Style({
                  image: new CircleStyle({
                    fill: new Fill({
                      color: '#000',
                    }),
                    radius: 7,
                    stroke: new Stroke({
                      width: 2,
                      color: '#fff',
                    }),
                  }),
                  zIndex: 100,
                }),
              ];
            } else {
              return this._getLineStyle(this._slopeChartTrack.get('color'));
            }
          },
          updateWhileAnimating: false,
          updateWhileInteracting: false,
          zIndex: DEF_LOCATION_Z_INDEX - 1,
        });
        this._map.addLayer(this._slopeChartLayer);
      }

      if (location) {
        let pointGeometry: Point = new Point(
          this._mapService.coordsFromLonLat([location.longitude, location.latitude]),
        );

        if (this._slopeChartPoint) this._slopeChartPoint.setGeometry(pointGeometry);
        else {
          this._slopeChartPoint = new Feature(pointGeometry);
          this._slopeChartSource.addFeature(this._slopeChartPoint);
        }

        if (track) {
          let trackGeometry: LineString = new LineString(
              (<ILineString>track.geometry.coordinates).map(value =>
                this._mapService.coordsFromLonLat(value),
              ),
            ),
            trackColor: string = track?.properties?.color;

          if (this._slopeChartTrack) {
            this._slopeChartTrack.setGeometry(trackGeometry);
            this._slopeChartTrack.set('color', trackColor);
          } else {
            this._slopeChartTrack = new Feature(trackGeometry);
            this._slopeChartTrack.set('color', trackColor);
            this._slopeChartSource.addFeature(this._slopeChartTrack);
          }
        }
      } else {
        this._slopeChartPoint = undefined;
        this._slopeChartTrack = undefined;
        this._slopeChartSource.clear();
      }

      this._map.render();
    } else if (this._slopeChartSource && this._map) {
      this._slopeChartPoint = undefined;
      this._slopeChartTrack = undefined;
      this._slopeChartSource.clear();
      this._map.render();
    }
  }

  private _fitView(geometryOrExtent: SimpleGeometry | Extent, optOptions?: FitOptions): void {
    if (optOptions == null) {
      optOptions = {
        duration: DEF_MAP_CLUSTER_ZOOM_DURATION,
        maxZoom: this._view.getZoom(),
      };
    }
    this._view.fit(geometryOrExtent, optOptions);
  }

  private _getLineStyle(color?: string): Array<Style> {
    const style: Array<Style> = [],
      selected: boolean = false;

    if (!color) color = '255, 177, 0'; // this._featuresService.color(id),
    if (color[0] === '#') {
      color =
        parseInt(color.substring(1, 3), 16) +
        ', ' +
        parseInt(color.substring(3, 5), 16) +
        ', ' +
        parseInt(color.substring(5, 7), 16);
    }
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
        }),
      );
    }

    style.push(
      new Style({
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 0.9)',
          width: strokeWidth * 2,
        }),
        zIndex: zIndex + 1,
      }),
    );

    style.push(
      new Style({
        stroke: new Stroke({
          color,
          width: strokeWidth,
          lineDash,
          lineCap,
        }),
        zIndex: zIndex + 2,
      }),
    );

    return style;
  }

  private _idOfClusterMarker(ig: IGeojsonCluster): string {
    return ig.properties.ids.sort((a, b) => a - b).join('-');
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
          .getTile(coords, this.useCache)
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

  private _mapClick(evt: MapBrowserEvent<UIEvent>) {
    const clusterFeature = this._getNearestFeatureOfLayer(this._clusterLayer, evt);
    const poiFeature = this._getNearestFeatureOfLayer(this._poisLayer, evt);

    const clusterMarker = this._clusterMarkers.find(x => x.icon == clusterFeature);
    if (clusterMarker) {
      this.clickcluster.emit(clusterMarker.cluster);
    }

    const poiMarker = this._poiMarkers.find(x => x.icon == poiFeature);
    if (poiMarker) {
      this.clickpoi.emit(poiMarker.poi);
      this.selectedpoi = poiMarker.poi;
    }

    if (!clusterFeature && !poiFeature) {
      this.touch.emit();
    }
  }

  private _removeIconFromLayer(layer: VectorLayer<VectorSource>, icon: Feature<Geometry>) {
    const source = layer.getSource();
    if (source.hasFeature(icon)) {
      source.removeFeature(icon);
    }
    // this._map.removeOverlay(cm.icon);
    //cm.component.destroy();
  }

  private async _selectCurrentPoi(poiMarker: any) {
    if (this._selectedPoiMarker != null) {
      this._map.removeLayer(this._selectedPoiLayer);
      this._selectedPoiLayer = undefined;
    }
    this._selectedPoiLayer = this._createLayer(this._selectedPoiLayer, 9999);
    this._selectedPoiMarker = poiMarker;
    const {marker} = await this._createPoiCanvasIcon(
      poiMarker.poi,
      null,
      !this.nopoiSelection && true,
    );
    this._addIconToLayer(this._selectedPoiLayer, marker.icon);
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

  private isCircular(trackgeojson): boolean {
    let coordinates = trackgeojson.coordinates;
    if (!coordinates) {
      coordinates = trackgeojson.geometry.coordinates;
    }
    let ret =
      Math.abs(coordinates[coordinates.length - 1][0] - coordinates[0][0]) < CIRCULARTOLERANCE;
    ret = ret && coordinates[coordinates.length - 1][1] - coordinates[0][1] < CIRCULARTOLERANCE;
    return ret;
  }
}
