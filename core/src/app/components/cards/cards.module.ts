import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CardBigComponent } from './card-big/card-big.component';
import { CardSliderComponent } from './card-slider/card-slider.component';
import { PipeModule } from 'src/app/pipes/pipe.module';

@NgModule({
  declarations: [CardBigComponent, CardSliderComponent],
  imports: [CommonModule, IonicModule, PipeModule],
  exports: [CardBigComponent, CardSliderComponent],
})
export class CardsModule { }
