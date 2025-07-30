import {NgModule} from '@angular/core';
import {PoiRecorderComponent} from './poi-recorder.component';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {WmCoreModule} from '@wm-core/wm-core.module';

const components = [PoiRecorderComponent];
@NgModule({
  declarations: components,
  imports: [CommonModule, IonicModule, WmPipeModule, WmCoreModule],
  exports: components,
})
export class PoiRecorderModule {}
