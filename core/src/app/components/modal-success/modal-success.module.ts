import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ModalSuccessComponent} from './modal-success.component';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';
import {SharedModule} from '../shared/shared.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {WmSharedModule} from 'wm-core/shared/shared.module';
@NgModule({
  declarations: [ModalSuccessComponent],
  imports: [CommonModule, IonicModule, WmPipeModule, SharedModule, WmMapModule, WmSharedModule],
  exports: [ModalSuccessComponent],
})
export class ModalSuccessModule {}
