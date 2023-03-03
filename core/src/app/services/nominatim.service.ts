import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

export interface Address {
  city: string;
  county: string;
  'ISO3166-2-lvl6': string;
  state: string;
  'ISO3166-2-lvl4': string;
  postcode: string;
  country: string;
  country_code: string;
}

export interface Nominatim {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  place_rank: number;
  category: string;
  type: string;
  importance: number;
  addresstype: string;
  name?: any;
  display_name: string;
  address: Address;
  boundingbox: string[];
}

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  constructor(private _http: HttpClient) {}

  getFromPosition(position: {latitude: number; longitude: number}): Observable<Nominatim> {
    return this._http.get(
      `https://nominatim.openstreetmap.org/reverse.php?lat=${position.latitude}&lon=${position.longitude}&zoom=18&format=jsonv2`,
    ) as Observable<Nominatim>;
  }
}
