import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { RouteService } from 'src/app/services/route.service';
import { WmRoute } from 'src/app/types/route';
import { Track } from 'src/app/types/track.d.';

@Component({
  selector: 'webmapp-route',
  templateUrl: './route.page.html',
  styleUrls: ['./route.page.scss'],
})
export class RoutePage implements OnInit {

  public route: WmRoute;

  public opacity = 1;

  constructor(
    private actRoute: ActivatedRoute,
    private routeService: RouteService,
    private navController: NavController,
    private menuController: MenuController
  ) { }

  async ngOnInit() {
    this.actRoute.queryParams.subscribe(async params => {
      const id = params['id'];
      this.route = await this.routeService.getRoute(id);
      console.log('------- ~ file: route.page.ts ~ line 24 ~ RoutePage ~ ngOnInit ~ this.route', this.route);

    });

  }

  

  menu() {
    this.menuController.enable(true, 'optionMenu');
    this.menuController.open('optionMenu');
  }

  closeMenu() {
    this.menuController.close('optionMenu');
  }

  share() {
    console.log('------- ~ file: route.page.ts ~ line 34 ~ RoutePage ~ share ~ share');

  }
  favourite() {
    console.log('------- ~ file: route.page.ts ~ line 38 ~ RoutePage ~ favourite ~ favourite');

  }
  back() {
    console.log('------- ~ file: route.page.ts ~ line 46 ~ RoutePage ~ back ~ back');
    this.navController.back();
  }

}
