import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalphotosComponent } from './modalphotos.component';
import { PopoverphotoComponent } from './popoverphoto/popoverphoto.component';
import { ModalphotosaveComponent } from './modalphotosave/modalphotosave.component';
import { ModalSuccessModule } from '../modal-success/modal-success.module';
import { FormsModule } from '@angular/forms';
import { ModalPhotoSingleComponent } from './modal-photo-single/modal-photo-single.component';

@NgModule({
  declarations: [
    ModalphotosComponent,
    PopoverphotoComponent,
    ModalphotosaveComponent,
    ModalPhotoSingleComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    SharedModule,
    ModalSuccessModule,
    FormsModule,
  ],
  exports: [ModalphotosComponent],
})
export class ModalphotosModule {}
