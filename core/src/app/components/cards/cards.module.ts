import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {CardBigComponent} from './card-big/card-big.component';
import {CardSliderComponent} from './card-slider/card-slider.component';
import {CardTrackComponent} from './card-track/card-track.component';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {WmSharedModule} from '@wm-core/shared/shared.module';

const cardComponents = [CardBigComponent, CardSliderComponent, CardTrackComponent];
@NgModule({
  declarations: cardComponents,
  imports: [CommonModule, IonicModule, WmPipeModule, WmSharedModule],
  exports: cardComponents,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CardsModule {}
