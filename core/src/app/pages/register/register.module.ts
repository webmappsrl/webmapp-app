import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';
import { ModalSaveComponent } from './modal-save/modal-save.component';
import { ModalSelectphotosComponent } from './modal-selectphotos/modal-selectphotos.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RegisterPageRoutingModule,
    MapModule
  ],
  declarations: [
    RegisterPage,
    ModalSaveComponent,
    ModalSelectphotosComponent
  ]
})
export class RegisterPageModule {}
