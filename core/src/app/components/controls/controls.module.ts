import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {BtnRecComponent} from './btn-rec/btn-rec.component';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';
import {WmSharedModule} from 'wm-core/shared/shared.module';

const controls = [BtnRecComponent];
@NgModule({
  declarations: controls,
  imports: [CommonModule, IonicModule, WmPipeModule, WmSharedModule],
  exports: controls,
})
export class ControlsMdule {}
