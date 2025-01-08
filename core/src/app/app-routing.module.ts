import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
  },

  {
    path: 'waypoint',
    loadChildren: () => import('./pages/waypoint/waypoint.module').then(m => m.WaypointPageModule),
  },
  {
    path: 'photolist',
    loadChildren: () =>
      import('./pages/photolist/photolist.module').then(m => m.PhotolistPageModule),
  },
  {
    path: 'photodetail',
    loadChildren: () =>
      import('./pages/photodetail/photodetail.module').then(m => m.PhotodetailPageModule),
  },
  {
    path: 'favourites',
    loadChildren: () =>
      import('./pages/favourites/favourites.module').then(m => m.FavouritesPageModule),
  },
  {
    path: 'poi',
    loadChildren: () => import('./pages/poi/poi.module').then(m => m.PoiPageModule),
  },
  {
    path: 'downloadlist',
    loadChildren: () =>
      import('./pages/downloadlist/downloadlist.module').then(m => m.DownloadlistPageModule),
  },
  {
    path: 'store',
    loadChildren: () => import('./pages/store/store.module').then(m => m.StorePageModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule),
  },
  {
    path: 'project',
    loadChildren: () => import('./pages/project/project.module').then(m => m.ProjectPageModule),
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
