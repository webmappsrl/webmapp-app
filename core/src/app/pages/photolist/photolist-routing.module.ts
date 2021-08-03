import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PhotolistPage } from './photolist.page';

const routes: Routes = [
  {
    path: '',
    component: PhotolistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhotolistPageRoutingModule {}
