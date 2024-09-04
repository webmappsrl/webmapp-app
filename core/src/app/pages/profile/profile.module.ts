import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {ProfilePage} from './profile.page';
import {ProfilePageRoutingModule} from './profile-routing.module';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';
import { WmCoreModule } from 'wm-core/wm-core.module';
import { ProfileDataTabComponent } from './tabs/profile-data-tab/profile-data-tab.component';
import { ProfileRecordsTabComponent } from './tabs/profile-record-tab/profile-records-tab.component';
import { SettingsModule } from 'src/app/components/settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    SettingsModule,
    WmPipeModule,
    WmCoreModule
  ],
  declarations: [ProfilePage, ProfileDataTabComponent, ProfileRecordsTabComponent],
})
export class ProfilePageModule {}
