import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SettingsComponent],
  imports: [CommonModule, IonicModule, TranslateModule, SharedModule],
  exports: [SettingsComponent],
})
export class SettingsModule {}
