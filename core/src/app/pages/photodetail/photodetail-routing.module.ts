import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PhotodetailPage } from './photodetail.page';

const routes: Routes = [
  {
    path: '',
    component: PhotodetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhotodetailPageRoutingModule {}
