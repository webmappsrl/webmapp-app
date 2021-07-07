import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalSuccessComponent } from './modal-success.component';
@NgModule({
  declarations: [ModalSuccessComponent],
  imports: [CommonModule, IonicModule, TranslateModule, SharedModule],
  exports: [ModalSuccessComponent],
})
export class ModalSuccessModule { }
