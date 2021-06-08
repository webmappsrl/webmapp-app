/**
 * Config Service
 *
 * It makes the configuration accessible from all the app
 *
 * */

import * as CONFIG from '../../../config.json';
import * as VERSION from 'version.json';

import { Injectable } from '@angular/core';

import { timeout } from 'rxjs/operators';
import { StorageService } from './base/storage.service';
import { CommunicationService } from './base/communication.service';
import { DeviceService } from './base/device.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _config: IConfig;

  constructor(
    private _communicationService: CommunicationService,
    private _deviceService: DeviceService,
    private _storageService: StorageService
  ) {
    console.log('Core v' + this.version);
  }

  /**
   * Function called during app initialization, to update the configuration
   */
  initialize(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const isLocalServer: boolean =
        window.location.href.indexOf('localhost') !== -1;

      if (!this._deviceService.isBrowser || isLocalServer) {
        const tmp: any = CONFIG;
        this._config = tmp.default;

        this._storageService
          .getConfig()
          .then(
            (value) => {
              if (typeof value !== 'undefined' && value) {
                this._config = value;
              }
            },
            () => {}
          )
          .finally(() => {
            const url = 'https://k.webmapp.it/webmapp/config.json';

            this._communicationService
              .get(url + '?t=' + Date.now())
              .pipe(timeout(1500))
              .subscribe(
                (response) => {
                  this._config = response;

                  this._storageService.setConfig(this._config);
                  resolve();
                },
                (err) => {
                  if (isLocalServer) {
                    if (
                      err.message
                        .toLowerCase()
                        .indexOf('http failure during parsing') !== -1
                    )
                      console.warn('WARNING: Malformed config.json');
                    else console.warn(err);
                  }
                  this._storageService.setConfig(this._config);
                  resolve();
                }
              );
          });
      } else {
        const url = '/config.json';

        this._communicationService.get(url + '?t=' + Date.now()).subscribe(
          (response) => {
            this._config = response;

            this._storageService.setConfig(this._config);
            resolve();
          },
          (err) => {
            console.error(err);
            resolve();
          }
        );
      }
    });
  }

  get version(): string {
    return VERSION.version;
  }

  get appName(): string {
    return this._config.APP ? this._config.APP.name : 'Webmapp';
  }

  get appId(): string {
    return this._config.APP.id ? this._config.APP.id : '';
  }

  get defaultLanguage(): string {
    return 'it';
  }

  get availableLanguages(): Array<string> {
    return ['it'];
  }
}
