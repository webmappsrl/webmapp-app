import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {WaypointlistPage} from './waypointlist.page';
import {WaypointlistPageRoutingModule} from './waypointlist-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointlistPageRoutingModule,
    MapModule,
    WmPipeModule,
  ],
  declarations: [WaypointlistPage],
})
export class WaypointlistPageModule {}
