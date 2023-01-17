import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {ModalSaveComponent} from './modal-save/modal-save.component';
import {ModalSelectphotosComponent} from './modal-selectphotos/modal-selectphotos.component';
import {ModalSuccessModule} from 'src/app/components/modal-success/modal-success.module';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {RegisterPage} from './register.page';
import {RegisterPageRoutingModule} from './register-routing.module';
import {SharedModule} from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipeModule,
    RegisterPageRoutingModule,
    MapModule,
    ModalSuccessModule,
    SharedModule,
  ],
  declarations: [RegisterPage, ModalSaveComponent, ModalSelectphotosComponent],
})
export class RegisterPageModule {}
