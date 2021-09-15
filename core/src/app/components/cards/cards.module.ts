import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CardBigComponent } from './card-big/card-big.component';
import { CardSliderComponent } from './card-slider/card-slider.component';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { CardTrackComponent } from './card-track/card-track.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [CardBigComponent, CardSliderComponent,CardTrackComponent],
  imports: [CommonModule, IonicModule, PipeModule, TranslateModule],
  exports: [CardBigComponent, CardSliderComponent,CardTrackComponent],
})
export class CardsModule { }
