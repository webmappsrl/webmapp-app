import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoutePage } from './route.page';
import { TabViabilityComponent } from './tab-viability/tab-viability.component';
import { TabDescriptionComponent } from './tab-description/tab-description.component';
import { TabDetailComponent } from './tab-detail/tab-detail.component';
import { TabEatComponent } from './tab-eat/tab-eat.component';
import { TabHowtoComponent } from './tab-howto/tab-howto.component';
import { TabWalkableComponent } from './tab-walkable/tab-walkable.component';


const routes: Routes = [
  {
    path: '',
    component: RoutePage,
    children: [
      {
        path: 'route-detail',
        component: TabDetailComponent,
      },
      {
        path: 'route-viability',
        component: TabViabilityComponent,
      },
      {
        path: 'route-howto',
        component: TabHowtoComponent,
      },
      {
        path: 'route-eat',
        component: TabEatComponent,
      },
      {
        path: 'route-description',
        component: TabDescriptionComponent,
      },
      {
        path: '',
        redirectTo: 'route-detail',
        pathMatch: 'full',
      },
      {
        path: 'route-walkable',
        component: TabWalkableComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoutePageRoutingModule {}
