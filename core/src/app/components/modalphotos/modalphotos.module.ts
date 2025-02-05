import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {ModalPhotoSingleComponent} from './modal-photo-single/modal-photo-single.component';
import {ModalSuccessModule} from '../modal-success/modal-success.module';
import {ModalphotosComponent} from './modalphotos.component';
import {NgModule} from '@angular/core';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {PopoverphotoComponent} from './popoverphoto/popoverphoto.component';
import {SharedModule} from '../shared/shared.module';
import {WmSharedModule} from '@wm-core/shared/shared.module';

@NgModule({
  declarations: [
    ModalphotosComponent,
    PopoverphotoComponent,
    ModalPhotoSingleComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    WmPipeModule,
    SharedModule,
    ModalSuccessModule,
    FormsModule,
    WmSharedModule,
  ],
  exports: [ModalphotosComponent],
})
export class ModalphotosModule {}
