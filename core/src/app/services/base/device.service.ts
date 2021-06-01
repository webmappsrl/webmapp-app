/**
 * Device Service
 *
 * It provides access to all the physical component installed in
 * the device such as compass, gps, camera...
 *
 * */

import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable, ReplaySubject } from 'rxjs';
import { ELocationState } from 'src/app/types/elocation-state.enum';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  public onResize: Observable<{
    width: number;
    height: number;
  }>;

  private _isBrowser: boolean;
  private _isAndroid: boolean;
  private _isIos: boolean;
  private _isLocalServer: boolean;
  private _width: number;
  private _height: number;
  private _onResize: ReplaySubject<{
    width: number;
    height: number;
  }>;

  constructor(
    private _platform: Platform,
    private _diagnostic: Diagnostic,
  ) {
    this._onResize = new ReplaySubject(1);
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._onResize.next({
      width: this._width,
      height: this._height,
    });
    this.onResize = this._onResize;

    this._isBrowser =
      this._platform.is('pwa') ||
      this._platform.is('desktop') ||
      this._platform.is('mobileweb');
    this._isAndroid = this._platform.is('android');
    this._isIos = this._platform.is('ios');
    this._isLocalServer = window.location.href.indexOf('localhost') !== -1;

    window.addEventListener('resize', () => {
      this._width = +window.innerWidth;
      this._height = +window.innerHeight;
      this._onResize.next({
        width: this._width,
        height: this._height,
      });
    });
  }

  get isBrowser(): boolean {
    return this._isBrowser;
  }

  get isAndroid(): boolean {
    return this._isAndroid;
  }

  get isIos(): boolean {
    return this._isIos;
  }

  get isLocalServer(): boolean {
    return this._isLocalServer;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  onLocationStateChange(): Observable<ELocationState> {
    return new Observable<ELocationState>((observer) => {
      // this._diagnostic.registerLocationStateChangeHandler((state) => {
      //   if (
      //     (this.isAndroid &&
      //       state !== this._diagnostic.locationMode.LOCATION_OFF) ||
      //     (this.isIos &&
      //       (state === this._diagnostic.permissionStatus.GRANTED ||
      //         state === this._diagnostic.permissionStatus.GRANTED_WHEN_IN_USE))
      //   ) {
      //     observer.next(ELocationState.ENABLED);
      //   } else {
      //     observer.next(ELocationState.NOT_ENABLED);
      //   }
      // });

      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      return { unsubscribe() { } };
    });
  }

  /**
   * Handle permissions for location and try to activate the location service
   * Emit LocationState.ENABLED or LocationState.ENABLED_WHEN_IN_USE if location is available. For LocationState.NOT_ENABLED and
   * LocationState.SETTINGS values, subscribe to DeviceService.onLocationStateChanged
   *
   * @param force true if the check must trigger the popups
   */
  enableGPS(force?: boolean): Promise<ELocationState> {
    return new Promise<ELocationState>((resolve, reject) => {
      this._enableGPSPermissions().then(
        (authorized) => {
          if (authorized === ELocationState.NOT_AUTHORIZED) {
            resolve(ELocationState.NOT_AUTHORIZED);
          } else {
            this._diagnostic.isLocationEnabled().then(
              (enabled) => {
                if (enabled) resolve(authorized);
                else {
                  if (force) {
                    // this._alertController
                    //   .create({
                    //     header: this._translateService.instant('alert.warning'),
                    //     message: this._translateService.instant(
                    //       'alert.activateGPS'
                    //     ),
                    //     buttons: [
                    //       {
                    //         text: this._translateService.instant(
                    //           'buttons.cancel'
                    //         ),
                    //         role: 'cancel',
                    //         cssClass: 'secondary',
                    //         handler: () => {
                    //           resolve(ELocationState.NOT_ENABLED);
                    //         },
                    //       },
                    //       {
                    //         text: this._translateService.instant('buttons.ok'),
                    //         cssClass: 'primary',
                    //         handler: () => {
                    //           if (this.isIos) {
                    //             this._diagnostic.switchToSettings();
                    //           } else {
                    //             this._diagnostic.switchToLocationSettings();
                    //           }
                    //           resolve(ELocationState.SETTINGS);
                    //         },
                    //       },
                    //     ],
                    //   })
                    //   .then((alert) => {
                    //     alert.present();
                    //   });
                  } else {
                    resolve(ELocationState.NOT_ENABLED);
                  }
                }
              },
              (error) => {
                reject(error);
              }
            );
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }


  /**
   * GPS
   */
  /**
   * Check GPS permissions and eventually ask user for permissions
   */
  private _enableGPSPermissions(): Promise<ELocationState> {
    return new Promise<ELocationState>((resolve, reject) => {
      const check = (authorized: boolean, value?: any) => {
        if (authorized) {
          console.log('---- ~ file: device.service.ts ~ line 193 ~ DeviceService ~ check ~ authorized', authorized, this._diagnostic.permissionStatus);
          if (
            typeof value !== 'undefined' &&
            value === this._diagnostic.permissionStatus.GRANTED_WHEN_IN_USE
          ) {
            resolve(ELocationState.ENABLED_WHEN_IN_USE);
          } else {
            resolve(ELocationState.ENABLED);
          }
        } else {
          console.log('---- ~ file: device.service.ts ~ line 193 ~ DeviceService ~ check ~ NOT authorized', authorized, this._diagnostic.permissionStatus);
          if (
            typeof value !== 'undefined' &&
            value === this._diagnostic.permissionStatus.DENIED_ALWAYS
          )
            resolve(ELocationState.NOT_AUTHORIZED);
          else {
                  this._diagnostic
                    .requestLocationAuthorization(
                      this._diagnostic.locationAuthorizationMode.ALWAYS
                    )
                    .then(
                      (status) => {
                      console.log('---- ~ file: device.service.ts ~ line 216 ~ DeviceService ~ check ~ status', status);
                        switch (status) {
                          case this._diagnostic.permissionStatus.GRANTED:
                            // this._storageService.setGpsPermissionStatus(
                            //   this._diagnostic.permissionStatus.GRANTED
                            // );
                            resolve(ELocationState.ENABLED);
                            break;
                          case this._diagnostic.permissionStatus
                            .GRANTED_WHEN_IN_USE:
                            // this._storageService.setGpsPermissionStatus(
                            //   this._diagnostic.permissionStatus
                            //     .GRANTED_WHEN_IN_USE
                            // );
                            resolve(ELocationState.ENABLED_WHEN_IN_USE);
                            break;
                          case this._diagnostic.permissionStatus.DENIED:
                            // if (this.isIos)
                            //   // this._storageService.setGpsPermissionStatus(
                            //   //   this._diagnostic.permissionStatus.DENIED_ALWAYS
                            //   // );
                            // else
                            //   // this._storageService.setGpsPermissionStatus(
                            //   //   this._diagnostic.permissionStatus.DENIED
                            //   // );
                            resolve(ELocationState.NOT_AUTHORIZED);
                            break;
                          case this._diagnostic.permissionStatus.DENIED_ALWAYS:
                            // this._storageService.setGpsPermissionStatus(
                            //   this._diagnostic.permissionStatus.DENIED_ALWAYS
                            // );
                            resolve(ELocationState.NOT_AUTHORIZED);
                            break;
                        }
                      },
                      (error) => {
                        reject(error);
                      }
                    );
                }
        }
      };

      this._diagnostic.isLocationAuthorized().then((authorized) => {
        // this._storageService.getGpsPermissionStatus().then(
        //   (value) => {
        //     check(authorized, value);
        //   },
        //   () => {
        //     check(authorized);
        //   }
        // );
      });
    });
  }


}
