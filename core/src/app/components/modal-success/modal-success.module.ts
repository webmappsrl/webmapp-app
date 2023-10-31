import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ModalSuccessComponent} from './modal-success.component';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';
import {SharedModule} from '../shared/shared.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
@NgModule({
  declarations: [ModalSuccessComponent],
  imports: [CommonModule, IonicModule, WmPipeModule, SharedModule, WmMapModule],
  exports: [ModalSuccessComponent],
})
export class ModalSuccessModule {}
