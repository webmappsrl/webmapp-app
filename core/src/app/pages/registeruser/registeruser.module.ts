import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {RegisteruserPageRoutingModule} from './registeruser-routing.module';

import {RegisteruserPage} from './registeruser.page';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisteruserPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    WmPipeModule,
  ],
  declarations: [RegisteruserPage],
})
export class RegisteruserPageModule {}
