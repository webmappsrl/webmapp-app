import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {FavouritesPageRoutingModule} from './favourites-routing.module';

import {FavouritesPage} from './favourites.page';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {CardsModule} from 'src/app/components/cards/cards.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavouritesPageRoutingModule,
    WmPipeModule,
    CardsModule,
  ],
  declarations: [FavouritesPage],
})
export class FavouritesPageModule {}
