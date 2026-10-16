// Variante camminiditalia del routing dei tab (oc:8703), attivata con `fileReplacements`: copia di
// `tabs-routing.module.ts` con la rotta `passport`. Una correzione al file condiviso va riportata
// a mano anche qui.
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TabsPage} from './tabs.page';
import {passportGuard} from '../passport/passport.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule),
      },
      {
        path: 'map',
        loadChildren: () => import('../map/map.module').then(m => m.MapPageModule),
      },
      {
        path: 'favourites',
        loadChildren: () =>
          import('../favourites/favourites.module').then(m => m.FavouritesPageModule),
      },
      {
        // tab Passaporto, solo camminiditalia (oc:8703)
        path: 'passport',
        canActivate: [passportGuard],
        loadChildren: () => import('../passport/passport.module').then(m => m.PassportPageModule),
      },
      {
        path: 'back',
        redirectTo: 'map',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
