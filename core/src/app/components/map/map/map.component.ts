import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

// ol imports
import { Coordinate } from 'ol/coordinate';
import {
  containsCoordinate,
  Extent,
  boundingExtent,
  containsExtent,
} from 'ol/extent';
import { CustomTile } from 'ol/source/UTFGrid';
import { getDistance } from 'ol/sphere.js'; // Throws problems importing normally
import { transform, transformExtent } from 'ol/proj';
import Circle from 'ol/geom/Circle';
import CircleStyle from 'ol/style/Circle';
import Cluster from 'ol/source/Cluster';
import Feature from 'ol/Feature';
import Fill from 'ol/style/Fill';
import GeoJSON from 'ol/format/GeoJSON';
import Icon from 'ol/style/Icon';
import LineString from 'ol/geom/LineString';
import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import MultiLineString from 'ol/geom/MultiLineString';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Overlay from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import Rotate from 'ol/control/Rotate';
import ScaleLine from 'ol/control/ScaleLine';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import TileJSON from 'ol/source/TileJSON';
import TileWMS from 'ol/source/TileWMS';
import TileLayer from 'ol/layer/Tile';
import TileState from 'ol/TileState';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import Zoom from 'ol/control/Zoom';


import {
  DEF_LOCATION_ACCURACY,
  DEF_LOCATION_Z_INDEX,
} from '../../../constants/map_costants';




import { GeolocationService } from 'src/app/services/geolocation.service';
import { ILocation } from 'src/app/types/location';
import { CLocation } from 'src/app/types/clocation';

@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {

  @ViewChild('map') mapDiv: ElementRef;

  @Input('start-view') startView: number[] = [11, 43, 10];
  @Input('btnposition') btnposition: string = 'middle';

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

  private _locationState: {
    goalLocation?: ILocation;
    goalAccuracy?: number;
    animating: boolean;
    startTime?: number;
    startLocation?: ILocation;
  };

  constructor(
    private geolocationService: GeolocationService
  ) {

    this._locationIcon = {
      layer: null,
      location: null,
      accuracy: null,
      point: null,
      circle: null,
      icon: 'locationIcon',
    };

    this._locationState = {
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

    this.geolocationService.onLocationChange.subscribe(x => {
      this.newPosition(x);
    });

  }

  private newPosition(position: CLocation) {
    console.log('---- ~ file: btn-geolocation.component.ts ~ line 25 ~ BtnGeolocationComponent ~ locate ~ position', position);
    this._setLocation(position);
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


  /**
   * Handle the location animation
   */
  private _animateLocation(): void {
    if (!this._locationState.startTime || !this._locationState.startLocation) {
      if (this._locationState.goalLocation)
        this._setLocation(this._locationState.goalLocation);
      else if (typeof this._locationState.goalAccuracy === 'number')
        this._setLocationAccuracy(this._locationState.goalAccuracy);
      this._stopLocationAnimation();
    } else if (
      !this._locationState.goalLocation &&
      typeof this._locationState.goalAccuracy !== 'number'
    )
      this._stopLocationAnimation();
    else {
      const delta: number =
        Math.min(Date.now() - this._locationState.startTime, 500) / 500;

      if (delta < 1) {
        if (this._locationState.goalLocation) {
          const deltaLongitude: number =
            this._locationState.goalLocation.longitude -
            this._locationState.startLocation.longitude,
            deltaLatitude: number =
              this._locationState.goalLocation.latitude -
              this._locationState.startLocation.latitude,
            deltaAccuracy: number = this._locationState.goalAccuracy
              ? this._locationState.goalAccuracy -
              this._locationState.startLocation.accuracy
              : this._locationState.goalLocation.accuracy
                ? this._locationState.goalLocation.accuracy -
                this._locationState.startLocation.accuracy
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
            this._locationState.goalAccuracy = this._locationState.goalAccuracy
              ? this._locationState.goalAccuracy
              : this._locationState.goalLocation.accuracy;
            this._locationState.goalLocation = undefined;
            this._setLocationAccuracy(
              this._locationState.startLocation.accuracy + delta * deltaAccuracy
            );
          } else {
            // Update location
            const newLocation: CLocation = new CLocation(
              this._locationState.startLocation.longitude +
              delta * deltaLongitude,
              this._locationState.startLocation.latitude +
              delta * deltaLatitude,
              undefined,
              this._locationState.startLocation.accuracy + delta * deltaAccuracy
            );
            this._setLocation(newLocation);
          }
        } else {
          const deltaAccuracy: number =
            typeof this._locationState.startLocation.accuracy === 'number'
              ? this._locationState.goalAccuracy -
              this._locationState.startLocation.accuracy
              : 0;

          if (deltaAccuracy === 0) {
            this._stopLocationAnimation();
            this._updateLocationLayer();
            return;
          }

          this._setLocationAccuracy(
            this._locationState.startLocation.accuracy + delta * deltaAccuracy
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
    this._locationIcon.location.changed();
    this._locationIcon.accuracy.changed();
    this._locationIcon.point.changed();
    this._locationIcon.circle.changed();
    this._locationIcon.layer.changed();
    this._map.render();
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
    this._locationState.animating = false;
    this._locationState.startLocation = undefined;
    this._locationState.startTime = undefined;
    this._locationState.goalAccuracy = undefined;
    this._locationState.goalLocation = undefined;
  }


  /**
   * Show in the map the current location using the blue circle and the semi-transparent accuracy circle
   *
   * @param location the location
   */
  private _setLocation(location: ILocation): void {
    const mapLocation: Coordinate = this._fromLonLat([
      location.longitude,
      location.latitude,
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
        zIndex: 400,
      });
    }
    try {
      this._map.addLayer(this._locationIcon.layer);
    } catch (e) { }
  }


}
