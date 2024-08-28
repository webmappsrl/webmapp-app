import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {ProfilePage} from './profile.page';
import {ProfilePageRoutingModule} from './profile-routing.module';
import {SettingsModule} from 'src/app/components/settings/settings.module';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';
import { WmCoreModule } from 'wm-core/wm-core.module';

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
  declarations: [ProfilePage],
})
export class ProfilePageModule {}
