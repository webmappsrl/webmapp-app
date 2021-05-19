import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileDataComponent } from './profile-data/profile-data.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [ProfilePage, ProfileDataComponent],
})
export class ProfilePageModule {}
