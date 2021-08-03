import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalSuccessComponent } from './modal-success.component';
import { MapModule } from '../map/map.module';
@NgModule({
  declarations: [ModalSuccessComponent],
  imports: [CommonModule, IonicModule, TranslateModule, SharedModule, MapModule],
  exports: [ModalSuccessComponent],
})
export class ModalSuccessModule { }
