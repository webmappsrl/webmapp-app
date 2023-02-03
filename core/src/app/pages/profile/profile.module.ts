import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {ProfileDataComponent} from './profile-data/profile-data.component';
import {ProfilePage} from './profile.page';
import {ProfilePageRoutingModule} from './profile-routing.module';
import {ProfileRecordsComponent} from './profile-records/profile-records.component';
import {SettingsModule} from 'src/app/components/settings/settings.module';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    SettingsModule,
    WmPipeModule,
  ],
  declarations: [ProfilePage, ProfileDataComponent, ProfileRecordsComponent],
})
export class ProfilePageModule {}
