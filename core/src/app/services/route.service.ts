import { Injectable } from '@angular/core';
import { IWmRoute } from '../types/route';
import { CommunicationService } from './base/communication.service';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  constructor(private _communicationService: CommunicationService) {}

  public async getRoute(routeId: number): Promise<IWmRoute> {
    const res = await this._communicationService
      .get('https://geohub.webmapp.it/api/ec/track/18')
      .toPromise();
    return res;
  }
}
