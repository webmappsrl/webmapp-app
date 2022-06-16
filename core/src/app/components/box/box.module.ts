import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../shared/shared.module';
import {LayerBoxComponent} from './layer-box/layer-box.component';
import {SearchBoxComponent} from './search-box/search-box.component';
import {CardsModule} from '../cards/cards.module';
import {DownloadedTracksBoxComponent} from './downloaded-tracks-box/downloaded-tracks-box.component';
import {SliderBoxComponent} from './slider-box/slider-box.component';
import {BaseBoxComponent} from './base-box/base-box.component';
import {ExternalUrlBoxComponent} from './external-url-box/external-url-box.component';

const boxComponents = [
  LayerBoxComponent,
  SearchBoxComponent,
  ExternalUrlBoxComponent,
  DownloadedTracksBoxComponent,
  SliderBoxComponent,
  BaseBoxComponent,
];
@NgModule({
  declarations: boxComponents,
  imports: [CommonModule, IonicModule, PipeModule, TranslateModule, SharedModule, CardsModule],
  exports: boxComponents,
})
export class BoxModule {}
