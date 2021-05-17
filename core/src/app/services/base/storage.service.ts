/**
 * Storage Service
 *
 * It provides access to the application storage for any data
 * */

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ReplaySubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import {
  CONFIG_JSON_STORAGE_KEY,
  INITIALIZED_FLAG_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  USER_STORAGE_KEY,
} from 'src/app/constants/storage';

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

  setConfig(value: IConfig): Promise<void> {
    return this._set(CONFIG_JSON_STORAGE_KEY, value);
  }

  getConfig(): Promise<any> {
    return this._get(CONFIG_JSON_STORAGE_KEY);
  }

  removeConfig(): Promise<void> {
    return this._remove(CONFIG_JSON_STORAGE_KEY);
  }

  setLanguage(value: string): Promise<void> {
    return this._set(LANGUAGE_STORAGE_KEY, value);
  }

  getLanguage(): Promise<any> {
    return this._get(LANGUAGE_STORAGE_KEY);
  }

  removeLanguage(): Promise<void> {
    return this._remove(LANGUAGE_STORAGE_KEY);
  }

  setInitializedFlag(): Promise<void> {
    return this._set(INITIALIZED_FLAG_STORAGE_KEY, true);
  }

  getInitializedFlag(): Promise<any> {
    return this._get(INITIALIZED_FLAG_STORAGE_KEY);
  }

  removeInitializedFlag(): Promise<void> {
    return this._remove(INITIALIZED_FLAG_STORAGE_KEY);
  }

  setUser(user: IUser): Promise<void> {
    return this._set(USER_STORAGE_KEY, user);
  }

  getUser(): Promise<any> {
    return this._get(USER_STORAGE_KEY);
  }

  removeUser(): Promise<void> {
    return this._remove(USER_STORAGE_KEY);
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

  /**
   * Perform the get operation directly from the storage. This function must be called once the storage is ready
   *
   * @param key the key to get from the store
   *
   * @returns a promise that resolve when the key is retrieved
   */
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
