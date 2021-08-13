import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { RouteService } from 'src/app/services/route.service';
import { IWmRoute } from 'src/app/types/route';

@Component({
  selector: 'webmapp-route',
  templateUrl: './route.page.html',
  styleUrls: ['./route.page.scss'],
})
export class RoutePage implements OnInit {
  public route: IWmRoute;

  public opacity = 1;

  constructor(
    private _actRoute: ActivatedRoute,
    private _routeService: RouteService,
    private _navController: NavController,
    private _menuController: MenuController
  ) {}

  async ngOnInit() {
    this._actRoute.queryParams.subscribe(async (params) => {
      const id = params.id;
      this.route = await this._routeService.getRoute(id);
      console.log(
        '------- ~ file: route.page.ts ~ line 24 ~ RoutePage ~ ngOnInit ~ this.route',
        this.route
      );
    });
  }

  toggleDetail() {
    const direction = this.opacity >= 1 ? 1 : -1;
    console.log(
      '------- ~ file: route.page.ts ~ line 38 ~ RoutePage ~ toggleDetail ~ this.opacity',
      this.opacity
    );
    const interv = setInterval(() => {
      this.opacity -= 0.01 * direction;
      if (this.opacity <= 0 || this.opacity >= 1) {
        clearInterval(interv);
      }
    }, 10);
  }

  menu() {
    this._menuController.enable(true, 'optionMenu');
    this._menuController.open('optionMenu');
  }

  closeMenu() {
    this._menuController.close('optionMenu');
  }

  share() {
    console.log(
      '------- ~ file: route.page.ts ~ line 34 ~ RoutePage ~ share ~ share'
    );
  }

  favourite() {
    console.log(
      '------- ~ file: route.page.ts ~ line 38 ~ RoutePage ~ favourite ~ favourite'
    );
  }

  back() {
    this._navController.back();
  }
}
