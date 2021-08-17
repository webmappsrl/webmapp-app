import { Injectable } from '@angular/core';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { ILocation } from '../types/location';
import { IGeojsonFeature } from '../types/model';
import { CommunicationService } from './base/communication.service';

@Injectable({
  providedIn: 'root',
})
export class GeohubService {
  constructor(private _communicationService: CommunicationService) {}

  /**
   * Get an instance of the specified ec track
   *
   * @param {string} id the ec track id
   *
   * @returns {CGeojsonLineStringFeature}
   */
  getEcTrack(id: string): CGeojsonLineStringFeature {
    return undefined;
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
  getEcMedia(id: string): IGeojsonFeature {
    return undefined;
  }

  /**
   * Perform a search with the given params
   *
   * @returns {Array<IGeojsonFeature>}
   */
  search(): Array<IGeojsonFeature> {
    return [];
  }

  /**
   * Get an array with the closest ec tracks to the specified location
   *
   * @param {ILocation} location the reference location
   *
   * @returns {Array<IGeojsonFeature>}
   */
  getNearEcTracks(location: ILocation): Array<IGeojsonFeature> {
    return [];
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
}
