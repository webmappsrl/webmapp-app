import { Injectable } from '@angular/core';
import { IGeojsonFeature } from '../types/model';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private _route: IGeojsonFeature;

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
}
