import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {ProfileDataComponent} from './profile-data/profile-data.component';
import {ProfilePage} from './profile.page';
import {ProfilePageRoutingModule} from './profile-routing.module';
import {ProfileRecordsComponent} from './profile-records/profile-records.component';
import {SettingsModule} from 'src/app/components/settings/settings.module';
import {WmTransPipe} from 'src/app/shared/wm-core/pipes/wmtrans.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    PipeModule,
    SettingsModule,
  ],
  providers: [WmTransPipe],
  declarations: [ProfilePage, ProfileDataComponent, ProfileRecordsComponent],
})
export class ProfilePageModule {}
