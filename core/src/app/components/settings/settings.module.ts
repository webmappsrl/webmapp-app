import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {RouterModule} from '@angular/router';
import {SettingsComponent} from './settings.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    RouterModule,
    CommonModule,
    IonicModule,
    PipeModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [SettingsComponent],
})
export class SettingsModule {}
