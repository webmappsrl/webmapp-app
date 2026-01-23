import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {BtnFilterComponent} from './btn-filter/btn-filter.component';
import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FormFieldComponent} from './form-field/form-field.component';
import {GalleryComponent} from './gallery/gallery.component';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {RecordingBtnComponent} from './recording-btn/recording-btn.component';
import {ButtonsModule} from './buttons/buttons.module';
import {WmSharedModule} from '@wm-core/shared/shared.module';
import {getFormFieldIcnPipe} from './pipes/get-form-field-icn.pipe';
import {getFormFieldValuePipe} from './pipes/get-form-field-value.pipe';
import {ModalSaveComponent} from './modal-save/modal-save.component';
import {WmCoreModule} from '@wm-core/wm-core.module';
const components = [
  RecordingBtnComponent,
  GalleryComponent,
  FormFieldComponent,
  BtnFilterComponent,
  getFormFieldIcnPipe,
  getFormFieldValuePipe,
  ModalSaveComponent,
];
@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    WmPipeModule,
    ButtonsModule,
    WmSharedModule,
    WmCoreModule,
  ],
  exports: [...components, ButtonsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
