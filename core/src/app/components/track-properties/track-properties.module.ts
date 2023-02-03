import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {TrackPropertiesComponent} from './track-properties.component';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';

const components = [TrackPropertiesComponent];
@NgModule({
  declarations: components,
  imports: [CommonModule, IonicModule, SharedModule, WmPipeModule],
  exports: components,
})
export class TrackPropetiesModule {}
