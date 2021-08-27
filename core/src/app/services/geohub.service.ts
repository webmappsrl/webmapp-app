import { Injectable } from '@angular/core';
import { ValueAccessor } from '@ionic/angular/directives/control-value-accessors/value-accessor';
import { map } from 'rxjs/operators';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { GEOHUB_DOMAIN, GEOHUB_PROTOCOL } from '../constants/geohub';
import { EGeojsonGeometryTypes } from '../types/egeojson-geometry-types.enum';
import { ILocation } from '../types/location';
import { IGeojsonCluster, IGeojsonClusterApiResponse, IGeojsonFeature, WhereTaxonomy } from '../types/model';
import { CommunicationService } from './base/communication.service';

const CACHE_WHERETAXONOMYKEY = 'wheretax'

@Injectable({
  providedIn: 'root',
})
export class GeohubService {

  private taxonomyCache: Array<{ key: string, value: any }> = [];

  constructor(private _communicationService: CommunicationService) { }

  /**
   * Get an instance of the specified ec track
   *
   * @param {string} id the ec track id
   *
   * @returns {CGeojsonLineStringFeature}
   */
  async getEcTrack(id: string): Promise<CGeojsonLineStringFeature> {
    const fondo = ['asfalto', 'lastricato', 'naturale']
    const res = await this._communicationService
      .get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/${id}`)
      .pipe(map((res: CGeojsonLineStringFeature) => {
        let lastAlt = 0; let idx = 0
        res.geometry.coordinates.forEach(coord => {
          coord.push(Math.abs(coord[2] - lastAlt)); //pendenza
          lastAlt = coord[2];
          coord.push(fondo[Math.round(idx / 30) % 3]);
          idx++;
        })
        return res;
      }))
      .toPromise();
    return res;
  }

  /**
   * Get an instance of the specified ec track
   *
   * @param {string} id the ec track id
   *
   * @returns {IGeojsonFeature}
   */
  async getEcRoute(id: string): Promise<IGeojsonFeature> {
    return this._getMockFeature();
  }

  /**
   * Get an instance of the specified ec poi
   *
   * @param {string} id the ec poi id
   *
   * @returns {IGeojsonFeature}
   */
  getEcPoi(id: string): IGeojsonFeature {
    return undefined;
  }

  /**
   * Get an instance of the specified ec media
   *
   * @param {string} id the ec media id
   *
   * @returns {IGeojsonFeature}
   */
  async getEcMedia(id: string): Promise<IGeojsonFeature> {
    return undefined;
  }

  /**
   * Perform a search with the given params
   *
   * @returns {Array<RouteCluster>}
   */
  async search(boundingBox: number[], referenceTrackId: number = null): Promise<IGeojsonClusterApiResponse> {
    let url = `${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/search?bbox=${boundingBox[0]},${boundingBox[1]},${boundingBox[2]},${boundingBox[3]}`;
    if (referenceTrackId) {
      url += `&reference_id=${referenceTrackId}`;
    }
    const res = await this._communicationService
      .get(url)
      .toPromise();
    return res;   
  }

  /**
   * Get an array with the closest ec tracks to the specified location
   *
   * @param {ILocation} location the reference location
   *
   * @returns {Array<IGeojsonFeature>}
   */
  async getNearEcTracks(location: ILocation): Promise<Array<IGeojsonFeature>> {
    const res = await this._communicationService
      .get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/nearest/${location.longitude}/${location.latitude}`,).pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  /**
   * Get an array with the closest ec tracks to the specified location
   *
   * @returns {Array<IGeojsonFeature>}
   */
  async getMostViewedEcTracks(): Promise<Array<IGeojsonFeature>> {
    const res = await this._communicationService
      .get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/most_viewed`,).pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  /**
   * Get a where taxonomy (form cache if available)
   * 
   * @param id id of the where taxonomy
   * @returns a where taxonomy
   */
  async getWhereTaxonomy(id: string): Promise<WhereTaxonomy> {
    const cacheId = `${CACHE_WHERETAXONOMYKEY}-${id}`;
    const cached = await this._getFromCache(cacheId);
    if (cached) return cached;
    const res = await this._communicationService.get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/taxonomy/where/${id}`,)
      .pipe(map(value => {
        delete value.geometry;
        this._setInCache(cacheId, value);
        return value;
      }))
      .toPromise();
    return res;
  }

  /**
   * Get an instance of the specified geohub feature
   *
   * @param {string} id the feature id
   *
   * @returns {IGeojsonFeature}
   */
  private _getFeature<T extends IGeojsonFeature>(id: string): T {
    return undefined;
  }

  private async _getMockFeature(): Promise<IGeojsonFeature> {
    const res = await this._communicationService
      .get('https://geohub.webmapp.it/api/ec/track/18')
      .toPromise();
    return res;
  }

  private async _getFromCache(cacheId: string): Promise<any> {
    const res = this.taxonomyCache.find(c => c.key == cacheId);
    return res ? res.value : null;
  }

  private _setInCache(cacheId, value) {
    const res = this.taxonomyCache.find(c => c.key == cacheId);
    if (!res) {
      const res = this.taxonomyCache.push({ key: cacheId, value });
    } else {
      res.value = value;
    }
  }



}
