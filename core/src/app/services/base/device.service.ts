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
  public onBackground: Observable<void>;
  public onForeground: Observable<void>;

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
  private _isBackground: boolean;
  private _onBackground: ReplaySubject<void>;
  private _onForeground: ReplaySubject<void>;

  constructor(private _platform: Platform, private _diagnostic: Diagnostic) {
    this._onResize = new ReplaySubject(1);
    this._onBackground = new ReplaySubject(1);
    this._onForeground = new ReplaySubject(1);
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._onResize.next({
      width: this._width,
      height: this._height,
    });
    this.onResize = this._onResize;
    this.onBackground = this._onBackground;
    this.onForeground = this._onForeground;

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

    this._isBackground = false;

    document.addEventListener(
      'pause',
      () => {
        this._isBackground = true;
        this._onBackground.next();
      },
      false
    );
    document.addEventListener(
      'resume',
      () => {
        this._isBackground = false;
        this._onForeground.next();
      },
      false
    );
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

  get isBackground(): boolean {
    return this._isBackground;
  }

  get isForeground(): boolean {
    return !this._isBackground;
  }

  /**
   * Trigger an event when the gps is started or stopped
   *
   * @returns {Observable<ELocationState>}
   */
  onLocationStateChange(): Observable<ELocationState> {
    return new Observable<ELocationState>((observer) => {
      this._diagnostic.registerLocationStateChangeHandler((state: string) => {
        if (
          (this.isAndroid &&
            state !== this._diagnostic.locationMode.LOCATION_OFF) ||
          (this.isIos &&
            (state === this._diagnostic.permissionStatus.GRANTED ||
              state === this._diagnostic.permissionStatus.GRANTED_WHEN_IN_USE))
        )
          observer.next(ELocationState.ENABLED);
        else observer.next(ELocationState.NOT_ENABLED);
      });
    });
  }

  /**
   * Handle permissions for location and try to activate the location service
   * Emit LocationState.ENABLED or LocationState.ENABLED_WHEN_IN_USE if location is available. For LocationState.NOT_ENABLED and
   * LocationState.SETTINGS values, subscribe to DeviceService.onLocationStateChanged
   *
   * @returns {Promise<ELocationState>}
   */
  enableGPS(): Promise<ELocationState> {
    return new Promise<ELocationState>((resolve, reject) => {
      this._enableGPSPermissions().then(
        (authorized) => {
          if (authorized === ELocationState.NOT_AUTHORIZED) {
            resolve(ELocationState.NOT_AUTHORIZED);
          } else {
            this._diagnostic.isLocationEnabled().then(
              (enabled) => {
                if (enabled) resolve(authorized);
                else resolve(ELocationState.NOT_ENABLED);
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
   *
   * @returns {Promise<ELocationState>}
   */
  private _enableGPSPermissions(): Promise<ELocationState> {
    return new Promise<ELocationState>((resolve, reject) => {
      this._diagnostic.isLocationAuthorized().then((authorized) => {
        if (authorized) resolve(ELocationState.ENABLED);
        else {
          this._diagnostic
            .requestLocationAuthorization(
              this._diagnostic.locationAuthorizationMode.ALWAYS
            )
            .then(
              (status) => {
                switch (status) {
                  case this._diagnostic.permissionStatus.GRANTED:
                    resolve(ELocationState.ENABLED);
                    break;
                  case this._diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                    resolve(ELocationState.ENABLED_WHEN_IN_USE);
                    break;
                  case this._diagnostic.permissionStatus.DENIED:
                    resolve(ELocationState.NOT_AUTHORIZED);
                    break;
                  case this._diagnostic.permissionStatus.DENIED_ALWAYS:
                    resolve(ELocationState.NOT_AUTHORIZED);
                    break;
                }
              },
              (error) => {
                reject(error);
              }
            );
        }
      });
    });
  }
}
