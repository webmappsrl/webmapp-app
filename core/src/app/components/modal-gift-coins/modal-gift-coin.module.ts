import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ModalGiftCoinsComponent} from './modal-gift-coins.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [ModalGiftCoinsComponent],
  imports: [CommonModule, IonicModule, PipeModule, SharedModule],
  exports: [ModalGiftCoinsComponent],
})
export class ModalGiftCoinsModule {}
