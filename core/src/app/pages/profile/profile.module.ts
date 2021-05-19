import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileDataComponent } from './profile-data/profile-data.component';
import { ProfileRecordsComponent } from './profile-records/profile-records.component';
import { SettingsModule } from 'src/app/components/settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    TranslateModule.forChild(),
    SettingsModule,
  ],
  declarations: [ProfilePage, ProfileDataComponent, ProfileRecordsComponent],
})
export class ProfilePageModule {}
