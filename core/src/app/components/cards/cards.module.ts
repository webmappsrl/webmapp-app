import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CardBigComponent } from './card-big/card-big.component';
import { CardSliderComponent } from './card-slider/card-slider.component';

@NgModule({
  declarations: [CardBigComponent, CardSliderComponent],
  imports: [CommonModule, IonicModule],
  exports: [CardBigComponent, CardSliderComponent],
})
export class CardsModule {}
