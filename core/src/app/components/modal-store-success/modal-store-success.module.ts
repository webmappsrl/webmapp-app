import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';

import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {SharedModule} from '../shared/shared.module';
import {ModalStoreSuccessComponent} from './modal-store-success.component';

@NgModule({
  declarations: [ModalStoreSuccessComponent],
  imports: [CommonModule, IonicModule, WmPipeModule, SharedModule],
  exports: [ModalStoreSuccessComponent],
})
export class ModalStoreSuccessModule {}
