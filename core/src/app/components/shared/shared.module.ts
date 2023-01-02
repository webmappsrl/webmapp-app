import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {BtnFilterComponent} from './btn-filter/btn-filter.component';
import {CommonModule} from '@angular/common';
import {FormFieldComponent} from './form-field/form-field.component';
import {GalleryComponent} from './gallery/gallery.component';
import {GenericPopoverComponent} from './generic-popover/generic-popover.component';
import {ImageGalleryComponent} from './image-gallery/image-gallery.component';
import {ImgComponent} from './img/img.component';
import {IonicModule} from '@ionic/angular';
import {LoginComponent} from './login/login.component';
import {ModalHeaderComponent} from './partials/modal-header/modal-header.component';
import {ModalImageComponent} from './image-gallery/modal-image/modal-image.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {RecordingBtnComponent} from './recording-btn/recording-btn.component';
import {SearchBarComponent} from './search-bar/search-bar.component';
import {TrackAudioComponent} from './track-audio/track-audio.component';
import {TranslateModule} from '@ngx-translate/core';
import {RelatedUrlsComponent} from './related-urls/related-urls.component';
import {ButtonsModule} from './buttons/buttons.module';
import {TabNearestPoiComponent} from './tab-nearest-poi/tab-nearest-poi.component';
import {TabHowtoComponent} from './tab-howto/tab-howto.component';

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
  TrackAudioComponent,
  ImageGalleryComponent,
  ModalImageComponent,
  RelatedUrlsComponent,
  TabNearestPoiComponent,
  TabHowtoComponent,
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
