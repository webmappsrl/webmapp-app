import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
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
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';

import {
  DEF_LOCATION_ACCURACY,
  DEF_LOCATION_Z_INDEX,
} from '../../../constants/map';

import { GeolocationService } from 'src/app/services/geolocation.service';
import { ILocation } from 'src/app/types/location';
import { CLocation } from 'src/app/classes/clocation';
import { EMapLocationState } from 'src/app/types/emap-location-state.enum';
import { MapService } from 'src/app/services/base/map.service';

@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapDiv: ElementRef;

  @Input('start-view') startView: number[] = [11, 43, 10];
  @Input('btnposition') btnposition: string = 'bottom';
  @Input('registering') registering: boolean = false;

  public locationState: EMapLocationState;

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

  private _locationAnimationState: {
    goalLocation?: ILocation;
    goalAccuracy?: number;
    animating: boolean;
    startTime?: number;
    startLocation?: ILocation;
  };

  private _location: ILocation;

  constructor(
    private geolocationService: GeolocationService,
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
    this._view = new View({
      center: this._mapService.coordsFromLonLat([
        this.startView[0],
        this.startView[1],
      ]),
      zoom: this.startView[2],
      maxZoom: 16,
      minZoom: 1,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
      extent: this._mapService.extentFromLonLat([-180, -85, 180, 85]),
    });

    this._map = new Map({
      target: this.mapDiv.nativeElement,
      view: this._view,
      controls: [],
      moveTolerance: 3,
    });

    this._map.addLayer(
      new TileLayer({
        source: this._initializeBaseSource(),
        visible: true,
        zIndex: 1,
      })
    );

    //TODO: figure out why this must be called inside a timeout
    setTimeout(() => {
      this._map.updateSize();
    }, 0);

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

    if (this.registering) {
      this.geolocationService.start();
      this.locationState = EMapLocationState.FOLLOW;
      this._centerMapToLocation();
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

        this._map.once('postrender', () => {
          this._animateLocation();
        });
      }
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
      if (this._locationAnimationState.goalLocation)
        this._setLocation(this._locationAnimationState.goalLocation);
      else if (typeof this._locationAnimationState.goalAccuracy === 'number')
        this._setLocationAccuracy(this._locationAnimationState.goalAccuracy);
      this._stopLocationAnimation();
    } else if (
      !this._locationAnimationState.goalLocation &&
      typeof this._locationAnimationState.goalAccuracy !== 'number'
    )
      this._stopLocationAnimation();
    else {
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
