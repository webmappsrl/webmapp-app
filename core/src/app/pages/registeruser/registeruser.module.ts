import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisteruserPageRoutingModule } from './registeruser-routing.module';

import { RegisteruserPage } from './registeruser.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipeModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisteruserPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    PipeModule
  ],
  declarations: [RegisteruserPage]
})
export class RegisteruserPageModule {}
