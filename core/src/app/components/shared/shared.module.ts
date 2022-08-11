import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {BtnFilterComponent} from './btn-filter/btn-filter.component';
import {CommonModule} from '@angular/common';
import {FormFieldComponent} from './form-field/form-field.component';
import {GalleryComponent} from './gallery/gallery.component';
import {GenericPopoverComponent} from './generic-popover/generic-popover.component';
import {ImgComponent} from './img/img.component';
import {IonicModule} from '@ionic/angular';
import {LoginComponent} from './login/login.component';
import {ModalHeaderComponent} from './partials/modal-header/modal-header.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {RecordingBtnComponent} from './recording-btn/recording-btn.component';
import {SearchBarComponent} from './search-bar/search-bar.component';
import {TranslateModule} from '@ngx-translate/core';

const components = [
  LoginComponent,
  ModalHeaderComponent,
  GenericPopoverComponent,
  RecordingBtnComponent,
  GalleryComponent,
  ImgComponent,
  FormFieldComponent,
  SearchBarComponent,
  BtnFilterComponent,
];
@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    PipeModule,
  ],
  exports: components,
})
export class SharedModule {}
