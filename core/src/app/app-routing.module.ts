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
    path: 'waypointlist',
    loadChildren: () =>
      import('./pages/waypointlist/waypointlist.module').then(m => m.WaypointlistPageModule),
  },
  {
    path: 'waypointdetail',
    loadChildren: () =>
      import('./pages/waypointdetail/waypointdetail.module').then(m => m.WaypointdetailPageModule),
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
    path: 'tracklist',
    loadChildren: () =>
      import('./pages/tracklist/tracklist.module').then(m => m.TracklistPageModule),
  },
  {
    path: 'trackdetail',
    loadChildren: () =>
      import('./pages/trackdetail/trackdetail.module').then(m => m.TrackdetailPageModule),
  },
  {
    path: 'route',
    loadChildren: () => import('./pages/route/route.module').then(m => m.RoutePageModule),
  },
  {
    path: 'itinerary',
    loadChildren: () =>
      import('./pages/itinerary/itinerary.module').then(m => m.ItineraryPageModule),
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
    path: 'navigation',
    loadChildren: () =>
      import('./pages/navigation/navigation.module').then(m => m.NavigationPageModule),
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
    path: 'registeruser',
    loadChildren: () =>
      import('./pages/registeruser/registeruser.module').then(m => m.RegisteruserPageModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule),
  },  {
    path: 'project',
    loadChildren: () => import('./pages/project/project.module').then( m => m.ProjectPageModule)
  },
  {
    path: 'credits',
    loadChildren: () => import('./pages/credits/credits.module').then( m => m.CreditsPageModule)
  },
  {
    path: 'disclaimer',
    loadChildren: () => import('./pages/disclaimer/disclaimer.module').then( m => m.DisclaimerPageModule)
  },

];
@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
