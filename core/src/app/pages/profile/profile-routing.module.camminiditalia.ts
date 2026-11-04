import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ProfilePage} from './profile.page';
import {ProfileAccountTabComponent} from './tabs/profile-account-tab/profile-account-tab.component';
import {ProfileAccountTabModule} from './tabs/profile-account-tab/profile-account-tab.module';
import {ProfileDiaryTabComponent} from './tabs/profile-diary-tab/profile-diary-tab.component';
import {ProfileDiaryTabModule} from './tabs/profile-diary-tab/profile-diary-tab.module';

/**
 * Rotte del profilo per camminiditalia (oc:8169): tab «Il mio diario» (la prima) e «Account» al
 * posto di «I miei dati». Sostituisce `profile-routing.module.ts` via `fileReplacements`.
 */
const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
    children: [
      {
        path: 'diary',
        component: ProfileDiaryTabComponent,
      },
      {
        path: 'account',
        component: ProfileAccountTabComponent,
      },
      // vecchio indirizzo della prima tab, per i link già in giro
      {
        path: 'profile-data',
        redirectTo: 'account',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'diary',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ProfileDiaryTabModule, ProfileAccountTabModule],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
