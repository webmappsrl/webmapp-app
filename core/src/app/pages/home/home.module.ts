import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { CardsModule } from 'src/app/components/cards/cards.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardsModule,
    HomePageRoutingModule,
    TranslateModule.forChild(),
    SharedModule
  ],
  declarations: [HomePage],
  entryComponents: [],
})
export class HomePageModule {}
