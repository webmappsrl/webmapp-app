import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TracklistPage } from './tracklist.page';

const routes: Routes = [
  {
    path: '',
    component: TracklistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TracklistPageRoutingModule {}
