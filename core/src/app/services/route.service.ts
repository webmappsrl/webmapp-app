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
    console.log('------- ~ file: route.service.ts ~ line 17 ~ RouteService ~ getRoute ~ res', res);
    return res;
  }
}
