import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PoiPage } from './poi.page';

const routes: Routes = [
  {
    path: '',
    component: PoiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PoiPageRoutingModule {}
