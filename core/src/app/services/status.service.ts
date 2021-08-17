import { Injectable } from '@angular/core';
import { IWmRoute } from '../types/route';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private _route: IWmRoute;

  public set route(val: IWmRoute) {
    this._route = val;
  }
  public get route(): IWmRoute {
    return this._route;
  }

  constructor() { }
}
