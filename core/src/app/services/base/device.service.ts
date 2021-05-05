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
  private _onResize: ReplaySubject<{
    width: number;
    height: number;
  }>;

  constructor(private _platform: Platform) {
    this._onResize = new ReplaySubject(1);
    this._onResize.next({
      width: window.innerWidth,
      height: window.innerHeight,
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
      this._onResize.next({
        width: +window.innerWidth,
        height: +window.innerHeight,
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
}
