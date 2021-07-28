import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WaypointdetailPageRoutingModule } from './waypointdetail-routing.module';

import { WaypointdetailPage } from './waypointdetail.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointdetailPageRoutingModule,
    TranslateModule,
    MapModule
  ],
  declarations: [WaypointdetailPage]
})
export class WaypointdetailPageModule {}
