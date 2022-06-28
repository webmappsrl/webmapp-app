import {Directive, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Feature} from 'ol';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import {FitOptions} from 'ol/View';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationEvents,
  BackgroundGeolocationResponse,
  BackgroundGeolocationLocationProvider,
} from '@awesome-cordova-plugins/background-geolocation/ngx';
import {POSITION_ZINDEX} from './zIndex';
import {from, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

interface Bearing {
  cos: number;
  sin: number;
}
@Directive({
  selector: '[navMapPosition]',
})
export class NavMapPositionDirective implements OnDestroy {
  private _bgLocSub: Subscription = Subscription.EMPTY;
  private _bgCurrentLocSub: Subscription = Subscription.EMPTY;
  private _map: Map;
  private _lastBearings: Bearing[] = [];
  @Output() locationEvt: EventEmitter<BackgroundGeolocationResponse> = new EventEmitter();

  private _locationIcon = new Icon({
    src: 'assets/images/location-icon-arrow.png',
    scale: 0.4,
    size: [125, 125],
  });
  private _locationFeature = new Feature();
  private _locationLayer = new VectorLayer({
    source: new VectorSource({
      features: [this._locationFeature],
    }),
    style: new Style({
      image: this._locationIcon,
    }),
    zIndex: POSITION_ZINDEX,
  });
  @Input() set map(map: Map) {
    if (map != null) {
      this._map = map;
      this._map.addLayer(this._locationLayer);
      this._map.render();
      this._locationLayer.getSource().changed();
    }
  }

  constructor(private _backgroundGeolocation: BackgroundGeolocation) {
    const androidConfig: BackgroundGeolocationConfig = {
      startOnBoot: false,
      interval: 1500,
      fastestInterval: 1500,
      startForeground: false,
    };
    const commonConfig: BackgroundGeolocationConfig = {
      desiredAccuracy: 0,
      activityType: 'OtherNavigation',
      stationaryRadius: 0,
      locationProvider: BackgroundGeolocationLocationProvider.RAW_PROVIDER,
      debug: false,
      stopOnTerminate: true,
    };
    const config: BackgroundGeolocationConfig = {
      ...commonConfig,
      ...androidConfig,
    };
    from(this._backgroundGeolocation.getCurrentLocation())
      .pipe(take(1))
      .subscribe((loc: BackgroundGeolocationResponse) => {
        console.log('current position');
        this._setPositionByLocation(loc);
      });
    this._backgroundGeolocation
      .configure(config)
      .then(() => {
        console.log('BACKGROUND CONFIGURED 2');
        this._bgLocSub = this._backgroundGeolocation
          .on(BackgroundGeolocationEvents.location)
          .subscribe((loc: BackgroundGeolocationResponse) => {
            this._setPositionByLocation(loc);
          });
      })
      .catch((e: Error) => {
        console.log('ERROR', e);
        navigator.geolocation.watchPosition(
          res => {
            this.locationEvt.emit(res.coords as any);
            console.log('*************************************');
            console.log('->BROWSER location');
            console.log(res.coords);
            console.log('*************************************');
            let bearing: number = Math.random() * 360;
            const point = new Point(fromLonLat([res.coords.longitude, res.coords.latitude]));
            this._locationFeature.setGeometry(point);
            // this._rotate(bearing, 500);
          },
          function errorCallback(error) {
            // console.log(error);
          },
          {maximumAge: 60000, timeout: 100, enableHighAccuracy: true},
        );
      });
    this._backgroundGeolocation.start();
  }
  private _setPositionByLocation(loc: BackgroundGeolocationResponse): void {
    console.log('*************************************');
    console.log('->locationnnnnnn');
    console.log(JSON.stringify(loc));
    console.log('*************************************');
    let location = loc as any;
    const runningAvg = this._runningAvg(location.bearing);
    location.runningAvg = this._radiansToDegrees(runningAvg);
    this.locationEvt.emit(location);
    const point = new Point(fromLonLat([location.longitude, location.latitude]));
    this._locationFeature.setGeometry(point);
    this._fitView(point);
    this._rotate(-runningAvg, 500);
  }
  private _fitView(geometryOrExtent: Point, optOptions?: FitOptions): void {
    if (optOptions == null) {
      const size = this._map.getSize();
      const height = size != null && size.length > 0 ? size[1] : 0;
      optOptions = {
        maxZoom: this._map.getView().getZoom(),
        duration: 500,
        size,
      };
    }
    this._map.getView().fit(geometryOrExtent, optOptions);
  }
  private _degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  private _radiansToDegrees(radians): number {
    return radians * (180 / Math.PI);
  }
  private _runningAvg(bearing: number): number {
    try {
      if (typeof bearing === 'number' && Number.isNaN(bearing) === false && bearing >= 0) {
        const bearingInRadians = this._degreesToRadians(bearing);
        const newBearing: Bearing = {
          cos: Math.cos(bearingInRadians),
          sin: Math.sin(bearingInRadians),
        };
        if (this._lastBearings.length > 3) {
          this._lastBearings.shift();
        }
        this._lastBearings.push(newBearing);
        let cosAverage = 0;
        let sinAverage = 0;
        this._lastBearings.forEach(b => {
          cosAverage += b.cos;
          sinAverage += b.sin;
        });
        const count = this._lastBearings.length;
        const runningAverage = Math.atan2(sinAverage / count, cosAverage / count);

        return runningAverage < 0 ? Math.PI * 2 + runningAverage : runningAverage;
      }
      return 0;
    } catch (e) {
      console.log('ERRORERRORERRORERRORERRORERROR', e);
      return 0;
    }
  }
  private _rotate(bearing: number, duration?: number): void {
    this._map.getView().animate({
      rotation: bearing,
      duration: duration ? duration : 0,
    });
  }

  ngOnDestroy(): void {
    this._backgroundGeolocation.stop();
    this._backgroundGeolocation.finish();
    this._bgLocSub.unsubscribe();
    this._bgCurrentLocSub.unsubscribe();
  }
}
