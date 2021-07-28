import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WaypointlistPageRoutingModule } from './waypointlist-routing.module';

import { WaypointlistPage } from './waypointlist.page';
import { MapModule } from 'src/app/components/map/map.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointlistPageRoutingModule,
    MapModule,
    TranslateModule
  ],
  declarations: [WaypointlistPage]
})
export class WaypointlistPageModule {}
