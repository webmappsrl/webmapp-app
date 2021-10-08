import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalStoreSuccessComponent } from './modal-store-success.component';

@NgModule({
  declarations: [ModalStoreSuccessComponent],
  imports: [CommonModule, IonicModule, TranslateModule, SharedModule],
  exports: [ModalStoreSuccessComponent],
})
export class ModalStoreSuccessModule { }
