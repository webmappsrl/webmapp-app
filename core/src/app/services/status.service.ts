import { Injectable } from '@angular/core';
import { IGeojsonFeature, IGeojsonPoiDetailed } from '../types/model';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private _route: IGeojsonFeature;

  private _relatedPois: IGeojsonPoiDetailed[];
  private _selectedPoiId: number;

  public set route(val: IGeojsonFeature) {
    this._route = val;
  }
  public get route(): IGeojsonFeature {
    return this._route;
  }

  private _isSelectedMapTrack: boolean;

  public set isSelectedMapTrack(val: boolean) {
    this._isSelectedMapTrack = val;
  }
  public get isSelectedMapTrack(): boolean {
    return this._isSelectedMapTrack;
  }
  constructor() { }

  public setPois(relatedPois: IGeojsonPoiDetailed[], id: number) {
    this._relatedPois = relatedPois;
    this._selectedPoiId = id;
  }

  public getRelatedPois() : IGeojsonPoiDetailed[]{
    return this._relatedPois;
  }
  public getSelectedPoiId() : number {
    return this._selectedPoiId;
  }
}
