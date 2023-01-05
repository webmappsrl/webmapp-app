import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {IonicModule} from '@ionic/angular';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {WmSlopeChartComponent} from './slope-chart/slope-chart.component';

import {WmDownloadPanelComponent} from './download-panel/download-panel.component';
import {WmDownloadComponent} from './download/download/download.component';
import {WmRelatedUrlsComponent} from './related-urls/related-urls.component';
import {WmTabDescriptionComponent} from './tab-description/tab-description.component';
import {WmTabDetailComponent} from './tab-detail/tab-detail.component';
import {WmTabHowtoComponent} from './tab-howto/tab-howto.component';
import {WmTabNearestPoiComponent} from './tab-nearest-poi/tab-nearest-poi.component';
import {WmTrackAudioComponent} from './track-audio/track-audio.component';
import {WmEmailComponent} from './email/email.component';
import {WmPhoneComponent} from './phone/phone.component';
import {WmAddressComponent} from './address/address.component';
import {WmImgComponent} from './img/img.component';
const directives = [];
const components = [
  WmAddressComponent,
  WmDownloadComponent,
  WmDownloadPanelComponent,
  WmImgComponent,
  WmTabDetailComponent,
  WmTabDescriptionComponent,
  WmTabHowtoComponent,
  WmTabNearestPoiComponent,
  WmTrackAudioComponent,
  WmSlopeChartComponent,
  WmRelatedUrlsComponent,
  WmEmailComponent,
  WmPhoneComponent,
];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule, IonicModule, PipeModule],
  exports: [...components, ...directives],
})
export class WmCoreModule {}
