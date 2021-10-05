import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalCoinsComponent } from './modal-coins.component';

@NgModule({
  declarations: [ModalCoinsComponent],
  imports: [CommonModule, IonicModule, TranslateModule, SharedModule],
  exports: [ModalCoinsComponent],
})
export class ModalCoinsModule { }
