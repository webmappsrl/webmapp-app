import {Directive, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Feature} from 'ol';
import {Extent} from 'ol/extent';
import Point from 'ol/geom/Point';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
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
import {from} from 'rxjs';
import {take} from 'rxjs/operators';
const lat_long = {
  latitude: 37.49484,
  longitude: 14.06052,
};
@Directive({
  selector: '[navMapPosition]',
})
export class NavMapPositionDirective implements OnDestroy {
  private _map: Map;
  @Output() locationEvt: EventEmitter<BackgroundGeolocationResponse> = new EventEmitter();

  private _locationIcon = new Icon({
    src: 'assets/images/location-icon-arrow.png',
    scale: 0.4,
    size: [125, 125],
    rotation: 123,
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
      const point = new Point(fromLonLat([lat_long.longitude, lat_long.latitude]));
      this._map.addLayer(this._locationLayer);
      this._fitView(point);
      this._map.render();
      this._locationLayer.getSource().changed();
    }
  }

  constructor(private _backgroundGeolocation: BackgroundGeolocation) {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      activityType: 'OtherNavigation',
      distanceFilter: 3,
      stationaryRadius: 0,
      locationProvider: BackgroundGeolocationLocationProvider.DISTANCE_FILTER_PROVIDER,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: true, // enable this to clear background location settings when the app terminates,
    };
    this._backgroundGeolocation.finish();
    this._backgroundGeolocation
      .configure(config)
      .then(() => {
        console.log('BACKGROUND CONFIGURED');
        this._backgroundGeolocation
          .on(BackgroundGeolocationEvents.location)
          .subscribe((location: BackgroundGeolocationResponse) => {
            from(this._backgroundGeolocation.startTask())
              .pipe(take(1))
              .subscribe(task => {
                this.locationEvt.emit(location);
                console.log('*************************************');
                console.log('->location');
                console.log(location);
                console.log('*************************************');
                const point = new Point(fromLonLat([location.longitude, location.latitude]));
                this._locationFeature.setGeometry(point);
                this._locationIcon.setRotation(location.bearing * (Math.PI / 180));
                this._backgroundGeolocation.endTask(task);
              });
          });
        this._backgroundGeolocation.start();
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
            this._locationIcon.setRotation(bearing);
          },
          function errorCallback(error) {
            // console.log(error);
          },
          {maximumAge: 60000, timeout: 100, enableHighAccuracy: true},
        );
      });
  }

  private _fitView(geometryOrExtent: SimpleGeometry | Extent, optOptions?: FitOptions): void {
    if (optOptions == null) {
      optOptions = {
        maxZoom: this._map.getView().getZoom(),
      };
    }
    this._map.getView().fit(geometryOrExtent, optOptions);
  }

  ngOnDestroy(): void {
    this._backgroundGeolocation.stop();
    this._backgroundGeolocation.finish();
  }
}
