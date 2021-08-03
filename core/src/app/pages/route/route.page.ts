import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteService } from 'src/app/services/route.service';
import { WmRoute } from 'src/app/types/route';

@Component({
  selector: 'webmapp-route',
  templateUrl: './route.page.html',
  styleUrls: ['./route.page.scss'],
})
export class RoutePage implements OnInit {

  public route: WmRoute;

  constructor(
    private actRoute: ActivatedRoute,
    private routeService: RouteService
  ) { }

  async ngOnInit() {
    this.actRoute.queryParams.subscribe(async params => {
      const id = params['id'];
      this.route = await this.routeService.getRoute(id);

    });
  }

}
