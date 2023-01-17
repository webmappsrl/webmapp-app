import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {BtnFilterComponent} from './btn-filter/btn-filter.component';
import {CommonModule} from '@angular/common';
import {FormFieldComponent} from './form-field/form-field.component';
import {GalleryComponent} from './gallery/gallery.component';
import {GenericPopoverComponent} from './generic-popover/generic-popover.component';
import {ImageGalleryComponent} from './image-gallery/image-gallery.component';
import {IonicModule} from '@ionic/angular';
import {LoginComponent} from './login/login.component';
import {ModalHeaderComponent} from './partials/modal-header/modal-header.component';
import {ModalImageComponent} from './image-gallery/modal-image/modal-image.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {RecordingBtnComponent} from './recording-btn/recording-btn.component';
import {SearchBarComponent} from './search-bar/search-bar.component';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonsModule} from './buttons/buttons.module';
import {TabImageGalleryComponent} from '../../shared/wm-core/tab-image-gallery/tab-image-gallery.component';
import {WmCoreModule} from 'src/app/shared/wm-core/wm-core.module';
const components = [
  LoginComponent,
  ModalHeaderComponent,
  GenericPopoverComponent,
  RecordingBtnComponent,
  GalleryComponent,
  FormFieldComponent,
  SearchBarComponent,
  BtnFilterComponent,
  ImageGalleryComponent,
  ModalImageComponent,
  TabImageGalleryComponent,
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
    ButtonsModule,
  ],
  exports: [...components, ButtonsModule],
})
export class SharedModule {}
