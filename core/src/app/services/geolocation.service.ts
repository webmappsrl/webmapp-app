import { Injectable, NgZone } from '@angular/core';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationEvents,
  BackgroundGeolocationLocationProvider,
  BackgroundGeolocationNativeProvider,
  BackgroundGeolocationResponse,
} from '@ionic-native/background-geolocation/ngx';

import { Platform } from '@ionic/angular';
import { ReplaySubject } from 'rxjs';
import { CLocation } from '../classes/clocation';
import { ELocationState } from '../types/elocation-state.enum';
import { ILocation, IGeolocationServiceState } from '../types/location';
import { DeviceService } from './base/device.service';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  // External events
  public onLocationChange: ReplaySubject<ILocation> =
    new ReplaySubject<ILocation>(1);
  public onGeolocationStateChange: ReplaySubject<IGeolocationServiceState> =
    new ReplaySubject<IGeolocationServiceState>(1);

  private _config: BackgroundGeolocationConfig;
  // State variables
  private _currentLocation: CLocation;
  private _state: IGeolocationServiceState;

  constructor(
    private _backgroundGeolocation: BackgroundGeolocation,
    private _deviceService: DeviceService,
    private _platform: Platform,
    private _ngZone: NgZone
  ) {
    this._config = {
      locationProvider: BackgroundGeolocationLocationProvider.RAW_PROVIDER,
      desiredAccuracy: 10,
      distanceFilter: 3,
      stationaryRadius: 0,
      stopOnTerminate: true,
      startOnBoot: false, // Android only
      interval: 1500, // Android only
      fastestInterval: 1500, // Android only
      startForeground: false, // Android only
      notificationTitle: '', // Android only
      notificationText: '', // Android only
      notificationIconColor: '#FF00FF', // Android only
      activityType: 'OtherNavigation', // iOS only
      pauseLocationUpdates: false, // iOS only
      saveBatteryOnBackground: false, // iOS only
      maxLocations: 10000,
      debug: false,
      notificationIconSmall: 'icon',
      notificationIconLarge: 'icon',
    };

    this._state = {
      isActive: false,
      isLoading: false,
    };

    if (!this._deviceService.isBrowser) {
      this._platform.ready().then(() => {
        this._deviceService.onLocationStateChange().subscribe(
          (state) => {
            if (state === ELocationState.ENABLED) this._start();
            else this._stop();
          },
          (err) => {
            console.warn(err);
          }
        );

        this._enableBackgroundGeolocationHandlers();
      });
    }
  }

  /**
   * Start the geolocation service
   */
  public start() {
    this._start();
  }

  /**
   * Stop the geolocation service
   */
  public stop() {
    this._stop();
  }

  /**
   * Process a new location
   *
   * @param rawLocation the new location
   */
  private _locationUpdate(rawLocation: BackgroundGeolocationResponse) {
    if (
      !this._state.isActive ||
      Number.isNaN(rawLocation.latitude) ||
      Number.isNaN(rawLocation.longitude)
    )
      return;

    if (rawLocation.latitude && typeof rawLocation.latitude !== 'number') {
      const latitude: number = parseFloat(rawLocation.latitude);
      if (!Number.isNaN(latitude)) rawLocation.latitude = latitude;
      else return;
    }

    if (rawLocation.longitude && typeof rawLocation.longitude !== 'number') {
      const longitude: number = parseFloat(rawLocation.longitude);
      if (!Number.isNaN(longitude)) rawLocation.latitude = longitude;
      else return;
    }

    const newLocation: CLocation = new CLocation(
      rawLocation.longitude,
      rawLocation.latitude,
      rawLocation.altitude &&
      typeof rawLocation.altitude === 'number' &&
      !Number.isNaN(rawLocation.altitude)
        ? rawLocation.altitude
        : undefined,
      rawLocation.accuracy &&
      typeof rawLocation.accuracy === 'number' &&
      !Number.isNaN(rawLocation.accuracy)
        ? rawLocation.accuracy
        : undefined,
      rawLocation.speed &&
      typeof rawLocation.speed === 'number' &&
      !Number.isNaN(rawLocation.speed)
        ? rawLocation.speed
        : undefined,
      rawLocation.bearing &&
      typeof rawLocation.bearing === 'number' &&
      !Number.isNaN(rawLocation.bearing)
        ? rawLocation.bearing
        : undefined
    );

    this._currentLocation = newLocation;

    if (this._state.isLoading) {
      this._state.isLoading = false;
      this.onGeolocationStateChange.next(this._state);
    }

    this.onLocationChange.next(this._currentLocation);
  }

  /**
   * Enable all the handler for the background geolocation plugin
   */
  private _enableBackgroundGeolocationHandlers() {
    this._backgroundGeolocation
      .on(BackgroundGeolocationEvents.location)
      .subscribe(
        (location) => {
          this._ngZone.run(() => {
            this._backgroundGeolocation.startTask().then((task) => {
              this._locationUpdate(location);
              this._backgroundGeolocation.endTask(task).then(
                () => {},
                (err) => {
                  console.warn(err);
                }
              );
            });
          });
        },
        (err) => {
          console.warn(err);
        }
      );

    this._backgroundGeolocation
      .on(BackgroundGeolocationEvents.stationary)
      .subscribe(
        (location) => {
          this._ngZone.run(() => {
            this._backgroundGeolocation.startTask().then((task) => {
              this._locationUpdate(location);
              this._backgroundGeolocation.endTask(task).then(
                () => {},
                (err) => {
                  console.warn(err);
                }
              );
            });
          });
        },
        (err) => {
          console.warn(err);
        }
      );

    this._backgroundGeolocation.on(BackgroundGeolocationEvents.error).subscribe(
      (error) => {
        this._ngZone.run(() => {
          console.warn('Restarting geolocation plugin due to an error', error);
          this._backgroundGeolocation.stop().then(() => {
            this._backgroundGeolocation.start().then(
              (res) => {
                console.log(res);
              },
              (err) => console.warn(err)
            );
          });
        });
      },
      (err) => {
        console.warn(err);
      }
    );

    this._backgroundGeolocation
      .on(BackgroundGeolocationEvents.background)
      .subscribe(
        () => {
          this._ngZone.run(() => {
            if (this._state.isActive) {
              if (!this._deviceService.isAndroid)
                this._backgroundGeolocation.switchMode(0); // 0 = background, 1 = foreground
            } else this._backgroundGeolocation.stop();
          });
        },
        (err) => {
          console.warn(err);
        }
      );

    this._backgroundGeolocation
      .on(BackgroundGeolocationEvents.foreground)
      .subscribe(
        () => {
          this._ngZone.run(() => {
            if (this._state.isActive) {
              if (!this._deviceService.isAndroid)
                this._backgroundGeolocation.switchMode(1); // 0 = background, 1 = foreground
            } else {
              this._backgroundGeolocation.start().then(
                (res) => {
                  console.log(res);
                },
                (err) => console.warn(err)
              );
            }
          });
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  /**
   * Check permissions, enable GPS and start to track the position showing it in the map
   */
  private _start(): Promise<IGeolocationServiceState> {
    return new Promise<IGeolocationServiceState>((resolve, reject) => {
      if (this._state.isActive) {
        resolve(this._state);
        return;
      }

      if (!this._deviceService.isBrowser) {
        this._backgroundGeolocation.configure(this._config).then(
          () => {
            this._state.isLoading = true;
            this.onGeolocationStateChange.next(this._state);

            this._deviceService.enableGPS().then(
              (gpsState) => {
                switch (gpsState) {
                  case ELocationState.ENABLED_WHEN_IN_USE:
                  case ELocationState.ENABLED:
                    this._backgroundGeolocation
                      .getCurrentLocation({
                        timeout: 3000,
                        maximumAge: 1000 * 60 * 5, // 5 min
                        enableHighAccuracy: false,
                      })
                      .then(
                        (location) => {
                          if (!this._currentLocation)
                            this._locationUpdate(location);
                        },
                        () => {}
                      );
                    this._state.isActive = true;
                    this._backgroundGeolocation.start().then(
                      (res) => {
                        console.log(res);
                      },
                      (err) => console.warn(err)
                    );
                    this.onGeolocationStateChange.next(this._state);
                    resolve(this._state);
                    break;
                  case ELocationState.SETTINGS:
                  case ELocationState.NOT_ENABLED:
                  default:
                    this._state.isActive = false;
                    this._state.isLoading = false;
                    this.onGeolocationStateChange.next(this._state);
                    reject(gpsState);
                    break;
                  case ELocationState.NOT_AUTHORIZED:
                    console.log('not auth');
                    this._state.isActive = false;
                    this._state.isLoading = false;
                    this.onGeolocationStateChange.next(this._state);
                    reject(gpsState);
                    break;
                }
              },
              (error) => {
                reject(error);
              }
            );
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        if (this._deviceService.isLocalServer) {
          this._state.isActive = true;
          this._state.isLoading = true;
          this.onGeolocationStateChange.next(this._state);

          setInterval(() => {
            const center: [number, number] = [11, 43];
            const extent: [number, number, number, number] = [0, 0, 100, 100];

            let alt: number = Math.random() * 5000,
              lat: number = center[1],
              lng: number = center[0],
              bearing: number = Math.random() * 360;
            const acc: number = 15 + Math.random() * 100,
              speed: number = 1 + Math.random() * 50;

            if (this._currentLocation) {
              alt = Math.max(
                10,
                this._currentLocation.altitude + (-25 + Math.random() * 50)
              );
              lat = Math.max(
                extent[1],
                Math.min(
                  extent[3],
                  this._currentLocation.latitude +
                    (-0.001 + Math.random() / 500)
                )
              );
              lng = Math.max(
                extent[0],
                Math.min(
                  extent[2],
                  this._currentLocation.longitude +
                    (-0.001 + Math.random() / 500)
                )
              );
              if (
                !this._currentLocation.bearing ||
                Number.isNaN(this._currentLocation.bearing)
              )
                bearing = 0;
              else
                bearing =
                  this._currentLocation.bearing + (-10 + Math.random() * 20);
            }

            this._locationUpdate({
              altitude: alt,
              latitude: lat,
              longitude: lng,
              id: 1,
              accuracy: acc,
              time: Date.now(),
              speed,
              locationProvider:
                BackgroundGeolocationLocationProvider.RAW_PROVIDER,
              provider: BackgroundGeolocationNativeProvider.gps,
              bearing,
            });
          }, 2000);
        }

        resolve(this._state);
      }
    });
  }

  /**
   * Stop the geolocation (hide from map and prevent position update)
   */
  private _stop(): Promise<IGeolocationServiceState> {
    return new Promise<IGeolocationServiceState>((resolve, reject) => {
      if (!this._deviceService.isBrowser) this._backgroundGeolocation.stop();

      this._state.isActive = false;
      this._state.isLoading = false;

      this.onGeolocationStateChange.next(this._state);
      resolve(this._state);
    });
  }
}
