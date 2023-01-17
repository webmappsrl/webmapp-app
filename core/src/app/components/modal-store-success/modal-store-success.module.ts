import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ModalStoreSuccessComponent} from './modal-store-success.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [ModalStoreSuccessComponent],
  imports: [CommonModule, IonicModule, PipeModule, SharedModule],
  exports: [ModalStoreSuccessComponent],
})
export class ModalStoreSuccessModule {}
