import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
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
    path: 'project',
    loadChildren: () => import('./pages/project/project.module').then(m => m.ProjectPageModule),
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
