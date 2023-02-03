import {PoiPropertiesComponent} from './poi-properties.component';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';

const components = [PoiPropertiesComponent];
@NgModule({
  declarations: components,
  imports: [CommonModule, IonicModule, SharedModule, WmPipeModule],
  exports: components,
})
export class PoiPropetiesModule {}
