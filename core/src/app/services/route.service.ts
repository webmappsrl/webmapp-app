import { Injectable } from '@angular/core';
import { WmRoute } from '../types/route';
import { CommunicationService } from './base/communication.service';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(
    private comService: CommunicationService
  ) { }


  public async getRoute(routeId: number): Promise<WmRoute> {
    const res = await this.comService.get("https://geohub.webmapp.it/api/ec/track/18").toPromise();
    return res;
  }
}
