import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisteruserPage } from './registeruser.page';

const routes: Routes = [
  {
    path: '',
    component: RegisteruserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisteruserPageRoutingModule {}
