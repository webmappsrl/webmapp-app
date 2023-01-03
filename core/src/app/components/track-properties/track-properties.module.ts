import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {TrackPropertiesComponent} from './track-properties.component';
import {WmCoreModule} from 'src/app/shared/wm-core/wm-core.module';

const components = [TrackPropertiesComponent];
@NgModule({
  declarations: components,
  imports: [CommonModule, IonicModule, SharedModule, WmCoreModule],
  exports: components,
})
export class TrackPropetiesModule {}
