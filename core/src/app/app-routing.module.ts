import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule),
  },  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'waypoint',
    loadChildren: () => import('./pages/waypoint/waypoint.module').then( m => m.WaypointPageModule)
  },
  {
    path: 'waypointlist',
    loadChildren: () => import('./pages/waypointlist/waypointlist.module').then( m => m.WaypointlistPageModule)
  },
  {
    path: 'waypointdetail',
    loadChildren: () => import('./pages/waypointdetail/waypointdetail.module').then( m => m.WaypointdetailPageModule)
  },
  {
    path: 'photolist',
    loadChildren: () => import('./pages/photolist/photolist.module').then( m => m.PhotolistPageModule)
  },
  {
    path: 'photodetail',
    loadChildren: () => import('./pages/photodetail/photodetail.module').then( m => m.PhotodetailPageModule)
  },
  {
    path: 'tracklist',
    loadChildren: () => import('./pages/tracklist/tracklist.module').then( m => m.TracklistPageModule)
  },
  {
    path: 'trackdetail',
    loadChildren: () => import('./pages/trackdetail/trackdetail.module').then( m => m.TrackdetailPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
