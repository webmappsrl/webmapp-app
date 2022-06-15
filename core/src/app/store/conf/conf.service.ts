import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GEOHUB_DOMAIN, GEOHUB_PROTOCOL} from '../../constants/geohub';
import {ICONF} from 'src/app/types/config';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfService {
  private _geohubAppId: number = environment.geohubId || 1;

  constructor(private _http: HttpClient) {
    const hostname: string = window.location.hostname;
    if (hostname.indexOf('localhost') < 0) {
      const newGeohubId = parseInt(hostname.split('.')[0], this._geohubAppId);
      if (!Number.isNaN(newGeohubId)) {
        this._geohubAppId = newGeohubId;
      }
    }
  }

  public get configUrl(): string {
    return `${this._geohubApiBaseUrl}config`;
  }

  public get geohubAppId(): number {
    return this._geohubAppId;
  }

  public get vectorStyleUrl(): string {
    return `${this._geohubApiBaseUrl}vector_style`;
  }

  public get vectorLayerUrl(): string {
    return `https://geohub.webmapp.it/api/app/webapp/${this._geohubAppId}/vector_layer`;
  }
  private get _geohubApiBaseUrl(): string {
    return `${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/app/webmapp/${this._geohubAppId}/`;
  }

  public getConf(): Observable<ICONF> {
    return this._http.get<ICONF>(`${this._geohubApiBaseUrl}config.json`);
  }
}
