import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {WmPipeModule} from '../../shared/wm-core/pipes/pipe.module';
import {WmSharedModule} from '../../shared/wm-core/shared/shared.module';
import {BtnRecComponent} from './btn-rec/btn-rec.component';

const controls = [BtnRecComponent];
@NgModule({
  declarations: controls,
  imports: [CommonModule, IonicModule, WmPipeModule, WmSharedModule],
  exports: controls,
})
export class ControlsMdule {}
