import {WhereTaxonomy} from '../types/model';
import {CommunicationService} from './base/communication.service';
import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {Feature, LineString} from 'geojson';
import {getEcTrack} from '@wm-core/utils/localForage';
import {EnvironmentService} from '@wm-core/services/environment.service';
const FAVOURITE_PAGESIZE = 3;

@Injectable({
  providedIn: 'root',
})
export class GeohubService {
  private _ecTracks: Array<Feature<LineString>>;
  private _favourites: Array<number> = null;

  constructor(
    private _communicationService: CommunicationService,
    private _environmentSvc: EnvironmentService,
  ) {
    this._ecTracks = [];
  }

  async favourites(): Promise<number[]> {
    if (!this._favourites) {
      try {
        const {favorites} = await this._communicationService
          .get(`${this._environmentSvc.origin}/api/ec/track/favorite/list`)
          .toPromise();
        this._favourites = favorites;
      } catch (err) {}
    }
    return this._favourites;
  }

  /**
   * Get an instance of the specified ec track
   *
   * @param id the ec track id
   *
   * @returns
   */
  async getEcTrack(id: string | number): Promise<Feature<LineString>> {
    if (id == null) return null;
    const cacheResult: Feature<LineString> = this._ecTracks.find(
      (ecTrack: Feature<LineString>) => ecTrack?.properties?.id === id,
    );
    if (cacheResult) {
      return cacheResult;
    }
    if (+id > -1) {
      const result = await this._communicationService
        .get(`${this._environmentSvc.origin}/api/ec/track/${id}`)
        .pipe(
          catchError(e => {
            if (!navigator.onLine) {
              return getEcTrack(`${id}`);
            }
            return of(null);
          }),
        )
        .toPromise();

      this._ecTracks.push(result);
      if (this._ecTracks.length > 10) {
        this._ecTracks.splice(0, 1);
      }

      return result;
    }
  }

  async getEcTracks(ids: number[]): Promise<Array<Feature<LineString>>> {
    const res = await this._communicationService
      .get(`${this._environmentSvc.origin}/api/ec/track/multiple?ids=${ids.join(',')}`)
      .pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  async getFavouriteTracks(page: number = 0): Promise<Array<Feature<LineString>>> {
    const favourites = await this.favourites();

    let ids: number[] = [];
    if (favourites) {
      ids = favourites.slice(page * FAVOURITE_PAGESIZE, (page + 1) * FAVOURITE_PAGESIZE);
    }

    return this.getEcTracks(ids);
  }

  /**
   * Get a where taxonomy (form cache if available)
   *
   * @param id id of the where taxonomy
   * @returns a where taxonomy
   */
  async getWhereTaxonomy(id: string): Promise<WhereTaxonomy> {
    const res = await this._communicationService
      .get(`${this._environmentSvc.origin}/api/taxonomy/where/${id}`)
      .pipe(
        map(value => {
          delete value.geometry;
          return value;
        }),
      )
      .toPromise();
    return res;
  }

  async isFavouriteTrack(trackId: number): Promise<boolean> {
    const favourites = await this.favourites();
    if (favourites && favourites.length) {
      return !!favourites.find(x => x == trackId);
    }
    return false;
  }

  async setFavouriteTrack(trackId: number, isFavourite: boolean): Promise<boolean> {
    if (isFavourite) {
      await this._communicationService
        .post(
          `${this._environmentSvc.origin}/api/ec/track/favorite/add/${trackId}`,
          null,
          new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        )
        .toPromise();
    } else {
      await this._communicationService
        .post(
          `${this._environmentSvc.origin}/api/ec/track/favorite/remove/${trackId}`,
          null,
          new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        )
        .toPromise();
    }

    const favourites = await this.favourites();
    let idx = -1;
    if (favourites && favourites.length) {
      idx = favourites.findIndex(x => x === trackId);
    }
    if (isFavourite) {
      if (idx < 0) {
        favourites.push(trackId);
      }
    } else {
      if (idx >= 0) {
        favourites.splice(idx, 1);
      }
    }
    return isFavourite;
  }
}
