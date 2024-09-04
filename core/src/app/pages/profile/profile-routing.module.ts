import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilePage } from './profile.page';
import { ProfileDataTabComponent } from './tabs/profile-data-tab/profile-data-tab.component';
import { ProfileRecordsTabComponent } from './tabs/profile-record-tab/profile-records-tab.component';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
    children: [
      {
        path: 'profile-data',
        component: ProfileDataTabComponent,
      },
      {
        path: 'profile-records',
        component: ProfileRecordsTabComponent,
      },
      {
        path: '',
        redirectTo: 'profile-data',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
