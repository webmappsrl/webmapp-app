import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ReplaySubject } from 'rxjs';
import { CLocation } from '../classes/clocation';
import { CStopwatch } from '../classes/cstopwatch';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { ELocationState } from '../types/elocation-state.enum';
import { ILocation, IGeolocationServiceState } from '../types/location';
import { DeviceService } from './base/device.service';
import {
  BackgroundGeolocationPlugin,
  ConfigureOptions as BackgroundGeolocationConfig,
  Location as BackgroundGeolocationResponse,
} from 'cordova-background-geolocation-plugin/www/BackgroundGeolocation';
import { TranslateService } from '@ngx-translate/core';
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const BackgroundGeolocation: BackgroundGeolocationPlugin;

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
  private _currentLocation: CLocation;
  private _state: IGeolocationServiceState = {
    isLoading: false,
    isActive: false,
    isRecording: false,
    isPaused: false,
  };
  private _recordedFeature: CGeojsonLineStringFeature;
  private _recordStopwatch: CStopwatch;
  private _backgroundGeolocation: BackgroundGeolocationPlugin;

  constructor(
    private _deviceService: DeviceService,
    private _platform: Platform,
    private _ngZone: NgZone,
    private _translateService: TranslateService
  ) {
    if (!this._deviceService.isBrowser) {
      this._platform.ready().then(() => {
        this._initializeBackgroundGeolocationPlugin();
        this._deviceService.onLocationStateChange().subscribe(
          (state) => {
            if (
              [
                ELocationState.ENABLED,
                ELocationState.ENABLED_WHEN_IN_USE,
              ].indexOf(state) !== -1
            )
              this._start();
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

  get location(): ILocation {
    return this?._currentLocation;
  }

  get recordedFeature(): CGeojsonLineStringFeature {
    return this?._recordedFeature;
  }

  get recordTime(): number {
    return this._recordStopwatch ? this._recordStopwatch.getTime() : 0;
  }

  get active(): boolean {
    return !!this?._state?.isActive;
  }

  get loading(): boolean {
    return !!this?._state?.isLoading;
  }

  get recording(): boolean {
    return !!this?._state?.isRecording;
  }

  get paused(): boolean {
    return !!this?._state?.isPaused;
  }

  /**
   * Start the geolocation service
   */
  start(): Promise<any> {
    return this._start();
  }

  /**
   * Stop the geolocation service
   */
  stop(): Promise<any> {
    return this._stop();
  }

  /**
   * Start the geolocation record. From this moment the received coordinates will
   * be saved until the stopRecording is called
   */
  startRecording(): Promise<void> {
    this._recordStopwatch = new CStopwatch();
    this._recordStopwatch.start();
    if (!this._state.isActive && !this._state.isLoading) {
      return new Promise<void>((resolve, reject) => {
        this._start().then(
          () => {
            this._startRecording().then(
              () => {
                resolve();
              },
              (err) => {
                reject(err);
              }
            );
          },
          (err) => {
            console.warn(err);
            reject(err);
          }
        );
      });
    } else return this._startRecording();
  }

  /**
   * Pause the geolocation record if active
   */
  pauseRecording(): Promise<void> {
    this._recordStopwatch.pause();
    return this._pauseRecording();
  }

  /**
   * Resume the geolocation record
   */
  resumeRecording(): Promise<void> {
    this._recordStopwatch.resume();
    return this._resumeRecording();
  }

  /**
   * Start the geolocation service
   */
  stopRecording(): Promise<CGeojsonLineStringFeature> {
    this._recordStopwatch.stop();
    return this._stopRecording();
  }

  /**
   * Perform the action needed to be able to use the background geolocation plugin
   */
  private _initializeBackgroundGeolocationPlugin(): void {
    this._backgroundGeolocation = BackgroundGeolocation;
    this._config = {
      locationProvider: this._backgroundGeolocation.RAW_PROVIDER,
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
      // notificationIconColor: '#FF00FF', // Android only
      activityType: 'OtherNavigation', // iOS only
      pauseLocationUpdates: false, // iOS only
      saveBatteryOnBackground: false, // iOS only
      maxLocations: 10000,
      debug: false,
      notificationIconSmall: 'notification_icon',
      notificationIconLarge: 'notification_icon',
    };
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

    if (this._state.isRecording && !this._state.isPaused) {
      this._recordedFeature.addCoordinates(this._currentLocation);
      const timestamps: Array<number> =
        this._recordedFeature?.properties?.timestamps ?? [];
      timestamps.push(this._currentLocation.timestamp);
      this._recordedFeature.setProperty('timestamps', timestamps);
    }

    this.onLocationChange.next(this._currentLocation);
  }

  /**
   * Enable all the handler for the background geolocation plugin
   */
  private _enableBackgroundGeolocationHandlers() {
    this._backgroundGeolocation.on('location').subscribe((location) => {
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
    });

    this._backgroundGeolocation.on('stationary').subscribe((location) => {
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
    });

    this._backgroundGeolocation.on('error').subscribe((error) => {
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
    });

    this._backgroundGeolocation.on('background').subscribe(() => {
      this._ngZone.run(() => {
        if (this._state.isRecording && this._state.isActive) {
          if (!this._deviceService.isAndroid)
            this._backgroundGeolocation.switchMode(0); // 0 = background, 1 = foreground
        } else this._backgroundGeolocation.stop();
      });
    });

    this._backgroundGeolocation.on('foreground').subscribe(() => {
      this._ngZone.run(() => {
        if (this._state.isRecording && this._state.isActive) {
          if (this._currentLocation)
            this.onLocationChange.next(this._currentLocation);

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
    });
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
                    this._backgroundGeolocation.getCurrentLocation(
                      (location) => {
                        if (!this._currentLocation)
                          this._locationUpdate(location);
                      },
                      (err) => {
                        console.warn(err);
                      },
                      {
                        timeout: 10000, // 10 sec
                        maximumAge: 1000 * 60 * 5, // 5 min
                        enableHighAccuracy: false,
                      }
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
            const center: [number, number] = [10.4147, 43.7118];
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
              locationProvider: this._backgroundGeolocation.RAW_PROVIDER,
              provider: 'gps',
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

  /**
   * Start the location record. From this moment all the locations will be recorded
   *
   * @param notificationTitle a string to use as the notification title. By default 'Recording a new route'
   * @param notificationTitle a string to use as the notification text. By default 'Tap'
   */
  private _startRecording(
    notificationTitle?: string,
    notificationText?: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._deviceService.isBrowser) {
        this._state.isRecording = true;
        this._recordedFeature = new CGeojsonLineStringFeature();
        resolve();
      } else {
        if (!notificationTitle)
          notificationTitle = this._translateService.instant(
            'services.geolocation.notification.title.newTrackRecord'
          );
        if (!notificationText)
          notificationText = this._translateService.instant(
            'services.geolocation.notification.text.newTrackRecord'
          );
        this._backgroundGeolocation
          .configure({
            notificationTitle,
            notificationText,
            startForeground: true,
          })
          .then(() => {
            this._state.isRecording = true;
            this._recordedFeature = new CGeojsonLineStringFeature();
            resolve();
          });
      }
    });
  }

  /**
   * Pause the location record
   */
  private _pauseRecording(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._deviceService.isBrowser) {
        this._state.isPaused = true;
        resolve();
      } else {
        this._backgroundGeolocation
          .configure({
            startForeground: false,
          })
          .then(() => {
            this._state.isPaused = true;
            resolve();
          });
      }
    });
  }

  /**
   * Resume the location record
   */
  private _resumeRecording(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._state.isRecording && this._state.isPaused) {
        if (this._deviceService.isBrowser) {
          this._state.isPaused = false;
          resolve();
        } else {
          this._backgroundGeolocation
            .configure({
              startForeground: true,
            })
            .then(() => {
              this._state.isPaused = false;
              resolve();
            });
        }
      } else if (!this._state.isRecording) reject('No resumable record found');
    });
  }

  /**
   * Stop the location record
   */
  private _stopRecording(): Promise<CGeojsonLineStringFeature> {
    return new Promise<CGeojsonLineStringFeature>((resolve, reject) => {
      if (this._deviceService.isBrowser) {
        this._state.isRecording = false;
        resolve(this._recordedFeature);
      } else {
        this._backgroundGeolocation
          .configure({
            startForeground: false,
          })
          .then(() => {
            this._state.isRecording = false;
            resolve(this._recordedFeature);
          });
      }
    });
  }
}
