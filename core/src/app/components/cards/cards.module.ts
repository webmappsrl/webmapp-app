import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CardBigComponent } from './card-big/card-big.component';
import { CardSliderComponent } from './card-slider/card-slider.component';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { CardTrackComponent } from './card-track/card-track.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';

const cardComponents = [CardBigComponent, CardSliderComponent, CardTrackComponent];
@NgModule({
  declarations: cardComponents,
  imports: [CommonModule, IonicModule, PipeModule, TranslateModule, SharedModule],
  exports: cardComponents,
})
export class CardsModule { }
