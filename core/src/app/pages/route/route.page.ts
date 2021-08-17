import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { RouteService } from 'src/app/services/route.service';
import { StatusService } from 'src/app/services/status.service';
import { IWmRoute } from 'src/app/types/route';

@Component({
  selector: 'webmapp-route',
  templateUrl: './route.page.html',
  styleUrls: ['./route.page.scss'],
})
export class RoutePage implements OnInit {
  public route: IWmRoute;

  public track;

  public opacity = 1;
  public headerHeight = 110;
  public height = 700;

  public slideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 5,
    slidesOffsetAfter: 5,
    slidesOffsetBefore: 5,
    slidesPerView: 3.5,
  };

  constructor(
    private _actRoute: ActivatedRoute,
    private _routeService: RouteService,
    private _navController: NavController,
    private _menuController: MenuController,
    private _statusService: StatusService,
    private _platform: Platform
  ) { }

  async ngOnInit() {
    this._actRoute.queryParams.subscribe(async (params) => {
      const id = params.id;
      this.route = await this._routeService.getRoute(id);
      this._statusService.route = this.route;
      this.track = this.route.geometry;
    });
    await this._platform.ready();
    this.height = this._platform.height();
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

  mapHeigth() {
    const h = this.height * 0.5 * (this.opacity + 1);
    const ret = h - ((1 - this.opacity) * this.headerHeight);
    return ret;
  }

}
