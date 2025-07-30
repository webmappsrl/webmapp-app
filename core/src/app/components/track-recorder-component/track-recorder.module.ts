import {TrackRecorderComponent} from './track-recorder.component';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {WmCoreModule} from '@wm-core/wm-core.module';
import {ControlsMdule} from '../controls/controls.module';

const components = [TrackRecorderComponent];
@NgModule({
  declarations: components,
  imports: [CommonModule, IonicModule, SharedModule, WmPipeModule, WmCoreModule, ControlsMdule],
  exports: components,
})
export class TrackRecorderModule {}
