import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileDataComponent } from '../../shared/wm-core/projects/wm-core/src/profile/profile-data/profile-data.component';
import { ProfileRecordsComponent } from '../../shared/wm-core/projects/wm-core/src/profile/profile-records/profile-records.component';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
    children: [
      {
        path: 'profile-data',
        component: ProfileDataComponent,
      },
      {
        path: 'profile-records',
        component: ProfileRecordsComponent,
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
