import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { CardsModule } from 'src/app/components/cards/cards.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardsModule,
    HomePageRoutingModule,
    TranslateModule,
  ],
  declarations: [HomePage],
  entryComponents: [],
})
export class HomePageModule {}
