import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {FavouritesPageRoutingModule} from './favourites-routing.module';

import {FavouritesPage} from './favourites.page';
import {FavouritesLayersComponent} from './favourites-layers/favourites-layers.component';
import {CardsModule} from 'src/app/components/cards/cards.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {BoxModule} from 'src/app/components/box/box.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavouritesPageRoutingModule,
    WmPipeModule,
    CardsModule,
    BoxModule,
  ],
  declarations: [FavouritesPage, FavouritesLayersComponent],
})
export class FavouritesPageModule {}
