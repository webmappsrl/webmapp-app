import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {StorePage} from './store.page';
import {StorePageRoutingModule} from './store-routing.module';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, StorePageRoutingModule, WmPipeModule],
  declarations: [StorePage],
})
export class StorePageModule {}
