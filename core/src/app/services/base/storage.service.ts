/**
 * Storage Service
 *
 * It provides access to the offline storage for json data
 * */

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ReplaySubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public onReady: ReplaySubject<boolean>;
  private _ready: boolean;
  private _store: Storage;

  constructor(private _storage: Storage) {
    this._ready = false;
    this.onReady = new ReplaySubject<boolean>(1);
    this.onReady.next(false);
    const storage = new Storage();
    storage.create().then(
      (store) => {
        this._store = store;
        this._ready = true;
        this.onReady.next(this._ready);
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  setConfig(value: IConfig): Promise<any> {
    return this._set('wm-config_json', value);
  }

  getConfig(): Promise<any> {
    return this._get('wm-config_json');
  }

  removeConfig(): Promise<any> {
    return this._remove('wm-config_json');
  }

  setLanguage(value: string): Promise<any> {
    return this._set('wm-lang', value);
  }

  getLanguage(): Promise<any> {
    return this._get('wm-lang');
  }

  removeLanguage(): Promise<any> {
    return this._remove('wm-lang');
  }

  setInitializedFlag(): Promise<any> {
    return this._set('wm-initialized', true);
  }

  getInitializedFlag(): Promise<any> {
    return this._get('wm-initialized');
  }

  removeInitializedFlag(): Promise<any> {
    return this._remove('wm-initialized');
  }

  /**
   * Set a value in the storage
   *
   * @param key the key for the value
   * @param value the value to save
   */
  private _set(key: string, value: any): Promise<void> {
    const stringValue: string = JSON.stringify(value);
    // this._utilsService.encryptAES(
    //   JSON.stringify(value)
    // );
    if (this._ready) return this._store.set(key, stringValue);
    else {
      return new Promise<void>((resolve, reject) => {
        this.onReady
          .pipe(
            filter((ready) => ready),
            take(1)
          )
          .subscribe(() => {
            this._store.set(key, stringValue).then(
              () => {
                resolve();
              },
              () => {
                reject();
              }
            );
          });
      });
    }
  }

  private _storeGet(key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this._store.get(key).then(
        (value) => {
          let result: any;
          if (value) {
            try {
              result = JSON.parse(
                // this._utilsService.decryptAES(
                value
                // )
              );
            } catch (e) {
              result = value;
            }
          }
          resolve(result);
        },
        (err) => {
          console.warn(err);
          resolve(undefined);
        }
      );
    });
  }

  /**
   * Get the value in the storage linked to the specified key
   *
   * @param key the key of the value to retrieve
   */
  private _get(key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this._ready) {
        this._storeGet(key).then(
          (res) => resolve(res),
          (err) => {
            console.warn(err);
            reject(err);
          }
        );
      } else {
        this.onReady
          .pipe(
            filter((ready) => ready),
            take(1)
          )
          .subscribe(
            () => {
              this._storeGet(key).then(
                (res) => resolve(res),
                (err) => {
                  console.warn(err);
                  reject(err);
                }
              );
            },
            (err) => {
              console.warn(err);
              reject();
            }
          );
      }
    });
  }

  /**
   * Remove the value linked to the key in the storage
   *
   * @param key the key to look for
   */
  private _remove(key: string): Promise<void> {
    if (this._ready) return this._store.remove(key);
    else {
      return new Promise<void>((resolve, reject) => {
        this.onReady
          .pipe(
            filter((ready) => ready),
            take(1)
          )
          .subscribe(() => {
            this._store.remove(key).then(() => {
              resolve();
            }, reject);
          });
      });
    }
  }
}
