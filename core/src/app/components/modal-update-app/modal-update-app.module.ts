import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ModalUpdateAppComponent} from './modal-update-app.component';
import {NgModule} from '@angular/core';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [ModalUpdateAppComponent],
  imports: [CommonModule, IonicModule, WmPipeModule, SharedModule],
  exports: [ModalUpdateAppComponent],
})
export class ModalUpdateAppModule {}
