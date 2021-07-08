import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WaypointPageRoutingModule } from './waypoint-routing.module';

import { WaypointPage } from './waypoint.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointPageRoutingModule,
    TranslateModule,
    MapModule,
  ],
  declarations: [WaypointPage]
})
export class WaypointPageModule {}
