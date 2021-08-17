import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoutePage } from './route.page';
import { TabAccessibilityComponent } from './tab-accessibility/tab-accessibility.component';
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
        path: 'route-walkable',
        component: TabWalkableComponent,
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
        path: 'route-accessibility',
        component: TabAccessibilityComponent,
      },
      {
        path: '',
        redirectTo: 'route-detail',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoutePageRoutingModule {}
