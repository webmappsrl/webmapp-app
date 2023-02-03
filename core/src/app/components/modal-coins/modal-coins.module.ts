import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ModalCoinsComponent} from './modal-coins.component';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [ModalCoinsComponent],
  imports: [CommonModule, IonicModule, WmPipeModule, SharedModule],
  exports: [ModalCoinsComponent],
})
export class ModalCoinsModule {}
