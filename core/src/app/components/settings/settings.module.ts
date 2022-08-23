import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {SettingsComponent} from './settings.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [SettingsComponent],
  imports: [CommonModule, IonicModule, PipeModule, SharedModule],
  exports: [SettingsComponent],
})
export class SettingsModule {}
