import {Directive, OnDestroy} from '@angular/core';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationEvents,
  BackgroundGeolocationLocationProvider,
  BackgroundGeolocationResponse,
} from '@awesome-cordova-plugins/background-geolocation/ngx';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import {from} from 'rxjs/internal/observable/from';
import {Subscription} from 'rxjs/internal/Subscription';
import {take} from 'rxjs/operators';

@Directive()
export abstract class GeolocationPage implements OnDestroy {
  private _bgLocSub: Subscription = Subscription.EMPTY;

  centerPositionEvt$: BehaviorSubject<boolean> = new BehaviorSubject<boolean | null>(null);
  currentPosition$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  startRecording$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private _backgroundGeolocation: BackgroundGeolocation) {
    this._initBackgroundGeolocation();
  }

  ngOnDestroy(): void {
    this._bgLocSub.unsubscribe();
  }

  setCurrentLocation(event): void {
    this.currentPosition$.next(event);
  }

  private _initBackgroundGeolocation(): void {
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
    from(
      this._backgroundGeolocation.getCurrentLocation().catch((e: Error) => {
        console.log('ERROR', e);
        navigator.geolocation.watchPosition(
          res => {
            return res.coords;
          },
          function errorCallback(error) {
            // console.log(error);
          },
          {maximumAge: 60000, timeout: 100, enableHighAccuracy: true},
        );
      }),
    )
      .pipe(take(1))
      .subscribe((loc: BackgroundGeolocationResponse) => {
        if (loc != null) {
          this.setCurrentLocation(loc);
        }
      });
    this._backgroundGeolocation
      .configure(config)
      .then(() => {
        this._bgLocSub = this._backgroundGeolocation
          .on(BackgroundGeolocationEvents.location)
          .subscribe((loc: BackgroundGeolocationResponse) => {
            this.setCurrentLocation(loc);
          });
      })
      .catch((e: Error) => {
        console.log('ERROR', e);
        navigator.geolocation.watchPosition(
          res => {
            this.setCurrentLocation(res.coords);
          },
          function errorCallback(error) {
            // console.log(error);
          },
          {maximumAge: 60000, timeout: 100, enableHighAccuracy: true},
        );
      });
    this._backgroundGeolocation.start();
  }
}
