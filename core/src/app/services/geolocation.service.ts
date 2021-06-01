import { EventEmitter, Injectable, NgZone } from '@angular/core';


import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationLocationProvider,
  BackgroundGeolocationEvents,
  BackgroundGeolocationResponse,
  BackgroundGeolocationNativeProvider,
} from '@ionic-native/background-geolocation/ngx';
import { Platform } from '@ionic/angular';
import { ReplaySubject } from 'rxjs';
import { CLocation } from '../types/clocation';
import { ELocationState } from '../types/elocation-state.enum';
import { IGSNavigationState, IGSState, ILocation } from '../types/location';
import { DeviceService } from './base/device.service';
// import { Insomnia } from '@ionic-native/insomnia/ngx';
// import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  public onLocationChange: ReplaySubject<ILocation>;
  public onGeolocationStateChange: ReplaySubject<IGSState>;
  public onBearingChange: EventEmitter<number>;
  public onStatsChange: ReplaySubject<IGSNavigationState>;

  private _config: BackgroundGeolocationConfig;
  // State variables
  private _currentLocation: CLocation;
  private _state: IGSState;

  private _outsideBboxPresented: boolean;


  // Events
  private _events: any;

  constructor(
    private _backgroundGeolocation: BackgroundGeolocation,
    // private _backgorundMode: BackgroundMode,
    private _deviceService: DeviceService,
    private _platform: Platform,
    private _ngZone: NgZone,
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
      notificationIconSmall: 'location_notification_icon',
      notificationIconLarge: null,
    };

    this.onLocationChange = new ReplaySubject<ILocation>(1);
    this.onGeolocationStateChange = new ReplaySubject<IGSState>(1);
    this.onStatsChange = new ReplaySubject<IGSNavigationState>(1);

    this._state = {
      isActive: false,
      isLoading: false,
      isFollowing: false,
      isRotating: false,
    };

    if (!this._deviceService.isBrowser) {
      this._platform.ready().then(() => {
        this._deviceService.onLocationStateChange().subscribe(
          (state) => {
            if (state === ELocationState.ENABLED) {
              this._start();
            } else {
              this._stop();
            }
          },
          (err) => {
            console.warn(err);
          }
        );

        // if (this._deviceService.isAndroid) {
        //   this._backgorundMode.setDefaults({ hidden: true, silent: true });
        //   this._backgorundMode.configure({ hidden: true, silent: true });
        // }

        this._enableBackgroundGeolocationHandlers();
      });
    }
  }

  public start() {
    this._start();
  }

  public stop() {
    this._stop();
  }


  /**
   * Process a new location depending on geolocation status
   *
   * @param rawLocation the new location
   * @param isCached true if the location is an old cached location
   */
  private _locationUpdate(
    rawLocation: BackgroundGeolocationResponse,
    isCached?: boolean
  ) {
    if (
      !this._state.isActive ||
      Number.isNaN(rawLocation.latitude) ||
      Number.isNaN(rawLocation.longitude)
    )
      return;

    // if (rawLocation.latitude && typeof rawLocation.latitude !== 'number') {
    //   const integer: number = parseFloat(rawLocation.latitude);
    //   const extent = this._configService.getMapExtent();
    //   if (integer > extent[1] && integer < extent[3])
    //     rawLocation.latitude = integer;
    //   else return;
    // }

    // if (rawLocation.longitude && typeof rawLocation.longitude !== 'number') {
    //   const integer: number = parseFloat(rawLocation.longitude);
    //   const extent = this._configService.getMapExtent();
    //   if (integer > extent[0] && integer < extent[2])
    //     rawLocation.longitude = integer;
    //   else return;
    // }

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
              this._backgroundGeolocation.endTask(task).then(() => { });
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
              this._backgroundGeolocation.endTask(task).then(() => { });
            });
          });
        },
        (err) => {
          console.warn(err);
        }
      );

    this._backgroundGeolocation.on(BackgroundGeolocationEvents.error).subscribe(
      (location) => {
        this._ngZone.run(() => {
          this._backgroundGeolocation.stop().then(() => {
            this._backgroundGeolocation.start();
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
            } else this._backgroundGeolocation.start();
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
  private _start(force?: boolean): Promise<IGSState> {
    if (force) { this._outsideBboxPresented = false; }
    return new Promise<IGSState>((resolve, reject) => {
      if (this._state.isActive) {
        resolve(this._state);
        return;
      }

      if (!this._deviceService.isBrowser) {
        this._backgroundGeolocation.configure(this._config).then(
          () => {
            this._state.isLoading = true;
            this.onGeolocationStateChange.next(this._state);

            this._deviceService.enableGPS(force).then(
              (gpsState) => {
                switch (gpsState) {
                  case ELocationState.ENABLED_WHEN_IN_USE:
                  case ELocationState.ENABLED:
                    this._backgroundGeolocation
                      .getCurrentLocation({
                        timeout: 3000,
                        maximumAge: 1000 * 60 * 60 * 2, // 2h
                        enableHighAccuracy: false,
                      })
                      .then(
                        (location) => {
                          if (!this._currentLocation)
                            this._locationUpdate(location, true);
                        },
                        () => { }
                      );
                    this._state.isActive = true;
                    this._state.isFollowing = true;
                    this._backgroundGeolocation.start();
                    this.onGeolocationStateChange.next(this._state);
                    resolve(this._state);
                    break;
                  case ELocationState.SETTINGS:
                  case ELocationState.NOT_ENABLED:
                  default:
                    this._state.isActive = false;
                    this._state.isLoading = false;
                    this._state.isFollowing = false;
                    this._state.isRotating = false;
                    this.onGeolocationStateChange.next(this._state);
                    reject(gpsState);
                    break;
                  case ELocationState.NOT_AUTHORIZED:
                    // this._alertController
                    //   .create({
                    //     header: this._translateService.instant('alert.warning'),
                    //     message: this._translateService.instant(
                    //       'alert.gpsAuthorization'
                    //     ),
                    //     buttons: [
                    //       {
                    //         text: this._translateService.instant('buttons.ok'),
                    //         cssClass: 'primary',
                    //       },
                    //     ],
                    //   })
                    //   .then((alert) => {
                    //     alert.present();
                    //   });
                    console.log('not auth');
                    this._state.isActive = false;
                    this._state.isLoading = false;
                    this._state.isFollowing = false;
                    this._state.isRotating = false;
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
          this._state.isFollowing = true;
          this._state.isRotating = false;
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
              locationProvider: undefined,
              provider: undefined,
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
  private _stop(): Promise<IGSState> {
    return new Promise<IGSState>((resolve, reject) => {
      if (!this._deviceService.isBrowser) this._backgroundGeolocation.stop();

      this._state.isActive = false;
      this._state.isLoading = false;
      this._state.isFollowing = false;
      this._state.isRotating = false;

      this.onGeolocationStateChange.next(this._state);
      resolve(this._state);
    });
  }

}
