/**
 * Communication Service
 *
 * It provides all the functions to communicate using http
 *
 * */

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private _token: string;

  constructor(private _http: HttpClient) {}

  /**
   * Perform a GET request and get the result
   *
   * @param {string} url the request url
   * @param {any} options the request options
   *
   * @returns {Observable<any>}
   */
  get(url: string, options?: any): Observable<any> {
    options = this._setAuthToken(options);
    return this._http.get(url, options);
  }

  /**
   * Perform a head request and return the filesize of an online resource
   *
   * @param {string} url the request url
   *
   * @returns {Observable<number>} with the file size in byte
   */
  getFileSize(url: string): Observable<number> {
    return new Observable<number>(observer => {
      this._http
        .head(url, {
          observe: 'response',
        })
        .subscribe(
          response => {
            const length: number = parseInt(response.headers.get('content-length'), 10);
            if (typeof length === 'number' && !Number.isNaN(length)) observer.next(length);
            else observer.error('length uncomputable');
          },
          err => {
            console.warn(err);
            observer.error(err);
          },
        );
    });
  }

  /**
   * Perform a request using POST and get the result
   *
   * @param {string} url the request url
   * @param {any} body the request body
   * @param {any} options the request options
   *
   * @returns {Observable<any>}
   */
  post(url: string, body: any, options?: any): Observable<any> {
    options = this._setAuthToken(options);
    return this._http.post(url, body, options);
  }

  setToken(token: string) {
    this._token = token;
  }

  private _setAuthToken(options) {
    if (this._token) {
      if (!options) options = {};
      if (!options.headers) options.headers = new HttpHeaders();

      options.headers = options.headers.set('Authorization', `Bearer ${this._token}`);
      options.headers = options.headers.set('App-id', `${environment.geohubId}`);
    }
    return options;
  }
}
