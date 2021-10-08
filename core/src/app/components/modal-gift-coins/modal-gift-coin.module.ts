import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalGiftCoinsComponent } from './modal-gift-coins.component';

@NgModule({
  declarations: [ModalGiftCoinsComponent],
  imports: [CommonModule, IonicModule, TranslateModule, SharedModule],
  exports: [ModalGiftCoinsComponent],
})
export class ModalGiftCoinsModule { }
