/**
 * Config Service
 *
 * It makes the configuration accessible from all the app
 *
 * */

import * as CONFIG from '../../../config.json';

import {CommunicationService} from './base/communication.service';
import {DeviceService} from './base/device.service';
import {Injectable} from '@angular/core';
import {StorageService} from './base/storage.service';
import {environment} from 'src/environments/environment';
import pkg from 'package.json';
import {timeout} from 'rxjs/operators';
import {IConfig} from 'wm-core/types/config';
import { hostToGeohubAppId } from 'wm-core/store/api/api.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _config: IConfig;
  private _geohubAppId: number = environment.geohubId;

  get appId(): string {
    return this._config.APP.id ? this._config.APP.id : 'it.webmapp.webmapp';
  }

  get appName(): string {
    return this._config && this._config.APP && this._config.APP.name
      ? this._config.APP.name
      : 'Webmapp';
  }

  get availableLanguages(): Array<string> {
    return ['it'];
  }

  get defaultLanguage(): string {
    return 'it';
  }

  get project(): string {
    return this._config.PROJECT ? this._config.PROJECT.HTML : '';
  }

  get version(): string {
    return pkg.version;
  }

  constructor(
    private _communicationService: CommunicationService,
    private _deviceService: DeviceService,
    private _storageService: StorageService,
  ) {
    console.log('Core v' + this.version);
  }

  /**
   * Function called during app initialization, to update the configuration
   */
  initialize(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const isLocalServer: boolean = window.location.href.indexOf('localhost') !== -1;

      if (!this._deviceService.isBrowser || isLocalServer) {
        const tmp: any = CONFIG;
        this._config = tmp.default;

        this._storageService
          .getConfig()
          .then(
            value => {
              if (typeof value !== 'undefined' && value) {
                this._config = value;
              }
            },
            () => {},
          )
          .finally(() => {
            const url = `${environment.api}/api/app/webmapp/${
              this._config.APP.geohubId || environment.geohubId
            }/config.json`;

            this._communicationService
              .get(url + '?t=' + Date.now())
              .pipe(timeout(1500))
              .subscribe(
                response => {
                  this._config = response;

                  this._storageService.setConfig(this._config);
                  resolve();
                },
                err => {
                  if (isLocalServer) {
                    if (err.message.toLowerCase().indexOf('http failure during parsing') !== -1) {
                      console.warn('WARNING: Malformed config.json');
                    } else {
                      console.warn(err);
                    }
                  }
                  this._storageService.setConfig(this._config);
                  resolve();
                },
              );
          });
      } else {
        let url = '/config.json';
        if (this._deviceService.isBrowser) {
          const hostname: string = window.location.hostname;
          this._geohubAppId = parseInt(hostname.split('.')[0], 10) || 4;
          if (hostname.indexOf('localhost') < 0) {
            const matchedHost = Object.keys(hostToGeohubAppId).find(host =>
              hostname.includes(host),
            );
            if (matchedHost) {
              this._geohubAppId = hostToGeohubAppId[matchedHost];
            } else {
              const newGeohubId = parseInt(hostname.split('.')[0], 10);
              if (!Number.isNaN(newGeohubId)) {
                this._geohubAppId = newGeohubId;
              }
            }
          }

          url = `${environment.api}/api/app/webmapp/${this._geohubAppId}/config.json`;
        }
        this._communicationService.get(url + '?t=' + Date.now()).subscribe(
          response => {
            this._config = response;

            this._storageService.setConfig(this._config);
            resolve();
          },
          err => {
            console.error(err);
            resolve();
          },
        );
      }
    });
  }

  /**
   * @returns {boolean} true if the ugc records should be enabled
   */
  isRecordEnabled(): boolean {
    return this.appId === 'it.webmapp.webmapp' || !!this._config?.GEOLOCATION?.record?.enable;
  }
}
