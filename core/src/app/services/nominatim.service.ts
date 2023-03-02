import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  constructor(private _http: HttpClient) {}

  getFromPosition(position: {latitude: number; longitude: number}): Observable<any> {
    return this._http.get(
      `https://nominatim.openstreetmap.org/reverse.php?lat=${position.latitude}&lon=${position.longitude}&zoom=18&format=jsonv2`,
    );
  }
}
