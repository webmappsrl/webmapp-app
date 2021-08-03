import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaypointdetailPage } from './waypointdetail.page';

const routes: Routes = [
  {
    path: '',
    component: WaypointdetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaypointdetailPageRoutingModule {}
