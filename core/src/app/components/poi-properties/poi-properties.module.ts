import {WmCoreModule} from './../../shared/wm-core/wm-core.module';
import {PoiPropertiesComponent} from './poi-properties.component';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';

const components = [PoiPropertiesComponent];
@NgModule({
  declarations: components,
  imports: [CommonModule, IonicModule, SharedModule, WmCoreModule],
  exports: components,
})
export class PoiPropetiesModule {}