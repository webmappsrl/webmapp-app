import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { buffer } from 'ol/extent';

// ol imports
import { Coordinate } from 'ol/coordinate';
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
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { defaults as defaultInteractions } from 'ol/interaction.js';

import {
  DEF_LOCATION_ACCURACY,
  DEF_LOCATION_Z_INDEX,
  DEF_MAP_CLUSTER_ZOOM_DURATION,
  DEF_MAP_CLUSTER_CLICK_TOLERANCE,
  DEF_MAP_MAX_ZOOM,
  DEF_MAP_MIN_ZOOM,
  DEF_MAP_MAX_CENTER_ZOOM,
} from '../../../constants/map';

import { GeolocationService } from 'src/app/services/geolocation.service';
import { ILocation } from 'src/app/types/location';
import { CLocation } from 'src/app/classes/clocation';
import { EMapLocationState } from 'src/app/types/emap-location-state.enum';
import { MapService } from 'src/app/services/base/map.service';
import Stroke from 'ol/style/Stroke';
import { ITrack } from 'src/app/types/track';
import { IGeojsonCluster, ILineString, IPoi } from 'src/app/types/model';
import { fromLonLat } from 'ol/proj';
import { ClusterMarkerComponent } from '../cluster-marker/cluster-marker.component';
import { ClusterMarker, MapMoveEvent } from 'src/app/types/map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Geometry from 'ol/geom/Geometry';
import { AuthService } from 'src/app/services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Fill from 'ol/style/Fill';
import LineString from 'ol/geom/LineString';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import { ISlopeChartHoverElements } from 'src/app/types/slope-chart';
import { GeohubService } from 'src/app/services/geohub.service';

@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map') mapDiv: ElementRef;

  @Output() unlocked: EventEmitter<boolean> = new EventEmitter();
  @Output() moveBtn: EventEmitter<number> = new EventEmitter();
  @Output() move: EventEmitter<MapMoveEvent> = new EventEmitter();
  @Output() clickcluster: EventEmitter<IGeojsonCluster> = new EventEmitter();
  @Output() touch: EventEmitter<any> = new EventEmitter();

  @Input('start-view') startView: number[] = [10.4147, 43.7118, 9];
  @Input('btnposition') btnposition: string = 'bottom';
  @Input('registering') registering: boolean = false;

  @Input('showLayer') showLayer: boolean = false;
  @Input('hideRegister') hideRegister: boolean = false;
  @Input('animation') useAnimation: boolean = true;

  @Input('static') set setStatic(value: boolean) {
    this.static = value;
    if (this._map) {
      const interactions = defaultInteractions({
        doubleClickZoom: !value,
        dragPan: !value,
        mouseWheelZoom: !value,
        pinchRotate: false
      });
      this._map.getInteractions().forEach((inter) => {
        this._map.removeInteraction(inter);
      });
      interactions.forEach((interaction) => {
        this._map.addInteraction(interaction);
      });
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
    if (this._height != height || this._bottomPadding != bottomPadding || this._topPadding != topPadding) {
      this._height = height;
      this._bottomPadding = bottomPadding;
      this._topPadding = topPadding;
      if (this._track.registeredTrack && this.centerToTrack) {
        this._centerMapToTrack();
      }
    }
  }

  @Input('bottomPadding') set bottomPadding(value: number) {
    if (this._bottomPadding != value) {
      this._bottomPadding = value;
      if (this._track.registeredTrack && this.centerToTrack) {
        this._centerMapToTrack();
      }
    }
  }

  @Input('track') set track(value: ITrack) {
    if (value) {
      setTimeout(() => {
        this._track.registeredTrack = value;
        this.centerToTrack = true;
        if (value.geojson) {
          this.drawTrack(value.geojson);
        } else {
          this.drawTrack(value);
        }
      }, 10);
    } else {
      this.deleteTrack();
    }
  }

  @Input('poismall') set poiSmall(value: IPoi[]) {
    if (value && value != this._poiSmallMarkers) {
      this._poiSmallMarkers = value;
      setTimeout(() => {
        this._addPoisMarkers(value, true);
      }, 10);
    } else {
      this._deletePoisMarkers(true);
    }
  }

  @Input('poibig') set poiBig(value: IPoi[]) {
    if (value && value != this._poiBigMarkers) {
      this._poiBigMarkers = value;
      setTimeout(() => {
        this._addPoisMarkers(value, false);
      }, 10);
    } else {
      this._deletePoisMarkers(false);
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

  @Input('boundigBox') set boundigBox(value: number[]) {
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

  @Input('slopeChartElements') set slopeChartElements(
    value: ISlopeChartHoverElements
  ) {
    this._drawTemporaryLocationFeature(value?.location, value?.track);
  }

  @ViewChild('clusterContainer', { read: ViewContainerRef }) clusterContainer;

  public locationState: EMapLocationState;

  public centerToTrack: boolean = false;

  public showRecBtn: boolean = true;

  public isRecording: boolean = false;

  public isLoggedIn: boolean = false;

  public sortedComponent: any[] = [];

  public timer: any;

  private _destroyer: Subject<boolean> = new Subject<boolean>();

  private _clusterMarkers: ClusterMarker[] = [];
  private _clusterLayer: VectorLayer;

  private _poiSmallMarkers: IPoi[] = [];
  // private _poiSmallLayer: VectorLayer;
  private _poiBigMarkers: IPoi[] = [];
  // private _poiBigLayer: VectorLayer;

  private _position: ILocation = null;
  private _height: number;
  private _bottomPadding: number = 0;
  private _topPadding: number = 0;

  private _view: View;
  private _map: Map;
  public static: boolean;

  private _lastlusterMarkerTransparency;

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
    registeredTrack: ITrack;
  };

  private _locationAnimationState: {
    goalLocation?: ILocation;
    goalAccuracy?: number;
    animating: boolean;
    startTime?: number;
    startLocation?: ILocation;
  };

  private _location: ILocation;

  private _slopeChartLayer: VectorLayer;
  private _slopeChartSource: VectorSource;
  private _slopeChartPoint: Feature<Point>;
  private _slopeChartTrack: Feature<LineString>;

  constructor(
    private geolocationService: GeolocationService,
    private _mapService: MapService,
    private geohubSErvice: GeohubService,
    // private resolver: ComponentFactoryResolver,
    private _authService: AuthService
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
    this._authService.onStateChange
      .pipe(takeUntil(this._destroyer))
      .subscribe((user: IUser) => {
        this.isLoggedIn = this._authService.isLoggedIn;
      });

    if (!this.startView) this.startView = [10.4147, 43.7118, 9];

    this._view = new View({
      center: this._mapService.coordsFromLonLat([
        this.startView[0],
        this.startView[1],
      ]),
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
        pinchRotate: false
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

    this.isRecording = this.geolocationService.recording;

    //TODO: figure out why this must be called inside a timeout
    setTimeout(() => {
      this._map.updateSize();
    }, 0);

    //TODO: test for ensure presence of map
    this.timer = setInterval(() => {
      if (this.static) {
        if (
          this._track.registeredTrack &&
          this._track.registeredTrack.geojson
        ) {
          this.centerToTrack = true;
          this.drawTrack(this._track.registeredTrack.geojson);
        }
      }
      this._map.updateSize();
    }, 1000);

    this._map.on('click', (evt) => {
      this._mapClick(evt);
    });

    if (!this.static) {
      this._map.on('moveend', () => {
        this.move.emit({
          boundigBox: this._mapService.extentToLonLat(
            this._map.getView().calculateExtent(this._map.getSize())
          ),
          zoom: this._view.getZoom(),
        });
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
        this.geolocationService.start();
        this.locationState = EMapLocationState.FOLLOW;
        this._centerMapToLocation();
      }

      this.geolocationService.onLocationChange.subscribe((location) => {
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
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this._destroyer.next(true);
  }

  /**
   * Draw a track in the map, remove a prevoius track
   *
   * @param geojson geojson of the track
   */
  drawTrack(trackgeojson: any) {
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
    } catch (e) { }
    if (this.centerToTrack) {
      this._centerMapToTrack();
    }
    //}
  }

  deleteTrack() {
    if (this._map && this._track.layer) {
      this._map.removeLayer(this._track.layer);
    }
    this._track.registeredTrack = null;
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
    this.moveBtn.emit(val);
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
        })
      );
    }

    style.push(
      new Style({
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 0.9)',
          width: strokeWidth * 2,
        }),
        zIndex: zIndex + 1,
      })
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
        duration: this.useAnimation ? DEF_MAP_CLUSTER_ZOOM_DURATION : 0,
        center: this._mapService.coordsFromLonLat([
          this._location.longitude,
          this._location.latitude,
        ]),
        zoom: this._view.getZoom() >= DEF_MAP_MAX_CENTER_ZOOM ? this._view.getZoom() : DEF_MAP_MAX_CENTER_ZOOM,
      });
    }
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
  private _centerMapToTrack() {
    if (this._track.layer) {
      const verticalPadding =
        !this._height || this._height > 500 ? 120 : this._height * 0.25;
      const padding = [verticalPadding + this._topPadding, 70, verticalPadding + this._bottomPadding, 20];

      this._view.fit(this._track.layer.getSource().getExtent(), {
        padding: padding,
        duration: this.useAnimation ? DEF_MAP_CLUSTER_ZOOM_DURATION : 0,
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
      maxZoom: DEF_MAP_MAX_ZOOM,
      minZoom: DEF_MAP_MIN_ZOOM,
      tileLoadFunction: (tile: any, url: string) => {
        tile.getImage().src = url;
      },
      tileUrlFunction: (c) => {
        return (
          'https://api.webmapp.it/tiles/' +
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
    } catch (e) { }
  }

  private _idOfClusterMarker(ig: IGeojsonCluster): string {
    return ig.properties.ids.sort((a, b) => a - b).join('-');
  }


  private async _addPoisMarkers(values: Array<IPoi>, isSmall: boolean) { }

  private async _deletePoisMarkers(isSmall: boolean) { }

  private async _addClusterMarkers(values: Array<IGeojsonCluster>) {
    let transparent: boolean = !!this._track.registeredTrack;
    this._createClusterLayer();
    if (values) {
      for (let i = this._clusterMarkers.length - 1; i >= 0; i--) {
        const ov = this._clusterMarkers[i];

        if (
          !values.find(
            (x) =>
              this._idOfClusterMarker(x) == this._idOfClusterMarker(ov.cluster)
          ) ||
          this._lastlusterMarkerTransparency != transparent
        ) {
          this._removeClusterIconFromLayer(ov);
          this._clusterMarkers.splice(i, 1);
        }
      }

      for (const cluster of values) {
        if (
          !this._clusterMarkers.find(
            (x) =>
              this._idOfClusterMarker(x.cluster) ==
              this._idOfClusterMarker(cluster)
          )
        ) {
          const icon = await this._createClusterCanvasIcon(
            cluster,
            transparent
          );

          this._addClusterIconToLayer(icon);

          this._clusterMarkers.push(icon);
        }
      }
    }

    this._lastlusterMarkerTransparency = transparent;
  }

  private async _createClusterCanvasIcon(
    cluster: IGeojsonCluster,
    transparent: boolean = false
  ): Promise<ClusterMarker> {
    const position = fromLonLat([
      cluster.geometry.coordinates[0] as number,
      cluster.geometry.coordinates[1] as number,
    ]); // TODO check object type
    const iconFeature = new Feature({
      geometry: new Point([position[0], position[1]]),
    });

    const img = await this._createClusterCavasImage(cluster);

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        img: img,
        imgSize: [100, 100],
        opacity: transparent ? 0.5 : 1,
      }),
    });

    iconFeature.setStyle(iconStyle);

    return {
      cluster,
      icon: iconFeature,
      // component: componentRef,
      id: this._idOfClusterMarker(cluster),
    };
  }

  private async _createClusterCavasImage(
    cluster: IGeojsonCluster
  ): Promise<HTMLImageElement> {
    let isFavourite = false;
    if (cluster.properties.ids.length == 1) {
      isFavourite = await this.geohubSErvice.isFavouriteTrack(cluster.properties.ids[0])
    }
    const htmlTextCanvas = await ClusterMarkerComponent.createMarkerHtmlForCanvas(cluster, isFavourite);

    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const canvasHtml =
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
      '<foreignObject width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
      htmlTextCanvas +
      '</div>' +
      '</foreignObject>' +
      '</svg>';

    const DOMURL = window.URL; // || window.webkitURL || window;

    const img = new Image();
    const svg = new Blob([canvasHtml], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = DOMURL.createObjectURL(svg);

    img.onload = function () {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);
    };

    img.src = url;
    img.crossOrigin = 'Anonymous';

    return img;
  }

  private _createClusterLayer() {
    if (!this._clusterLayer) {
      this._clusterLayer = new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: 400,
      });
      this._map.addLayer(this._clusterLayer);
    }
  }

  private _addClusterIconToLayer(cm: ClusterMarker) {
    const source = this._clusterLayer.getSource();
    this._clusterLayer.getSource().addFeature(cm.icon);
    // this._map.removeOverlay(cm.icon);
    // cm.component.destroy();
  }

  private _removeClusterIconFromLayer(cm: ClusterMarker) {
    const source = this._clusterLayer.getSource();
    if (source.hasFeature(cm.icon)) {
      source.removeFeature(cm.icon);
    }
    // this._map.removeOverlay(cm.icon);
    //cm.component.destroy();
  }

  private _mapClick(evt: MapBrowserEvent<UIEvent>) {
    const features: Feature<Geometry>[] = [];
    const precision =
      this._view.getResolution() * DEF_MAP_CLUSTER_CLICK_TOLERANCE;

    if (this._clusterLayer && this._clusterLayer.getSource()) {
      this._clusterLayer
        .getSource()
        .forEachFeatureInExtent(
          buffer(
            [
              evt.coordinate[0],
              evt.coordinate[1],
              evt.coordinate[0],
              evt.coordinate[1],
            ],
            precision
          ),
          (feature) => {
            features.push(feature);
          }
        );
      if (features.length) {
        const nearestFeature = this._getNearest(features, evt.coordinate);
        const clusterMarker = this._clusterMarkers.find(
          (x) => x.icon == nearestFeature
        );
        if (clusterMarker) {
          this.clickcluster.emit(clusterMarker.cluster);
        }
      } else { this.touch.emit(); }
    } else { this.touch.emit(); }
  }

  _getNearest(features: Feature<Geometry>[], coordinate: Coordinate) {
    let ret: Feature<Geometry> = features[0];
    let minDistance = Number.MAX_VALUE;
    features.forEach((feature) => {
      const geom = feature.getGeometry() as Point;
      let distance = this._distance(geom.getFlatCoordinates(), coordinate);
      if (distance < minDistance) {
        minDistance = distance;
        ret = feature;
      }
    });
    return ret;
  }

  _distance(c1: Coordinate, c2: Coordinate) {
    return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
  }

  private _drawTemporaryLocationFeature(
    location?: ILocation,
    track?: CGeojsonLineStringFeature
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
          style: (feature) => {
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
          this._mapService.coordsFromLonLat([
            location.longitude,
            location.latitude,
          ])
        );

        if (this._slopeChartPoint)
          this._slopeChartPoint.setGeometry(pointGeometry);
        else {
          this._slopeChartPoint = new Feature(pointGeometry);
          this._slopeChartSource.addFeature(this._slopeChartPoint);
        }

        if (track) {
          let trackGeometry: LineString = new LineString(
            (<ILineString>track.geometry.coordinates).map((value) =>
              this._mapService.coordsFromLonLat(value)
            )
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
}
