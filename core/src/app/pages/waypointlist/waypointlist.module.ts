import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {WaypointlistPage} from './waypointlist.page';
import {WaypointlistPageRoutingModule} from './waypointlist-routing.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointlistPageRoutingModule,
    WmMapModule,
    WmPipeModule,
  ],
  declarations: [WaypointlistPage],
})
export class WaypointlistPageModule {}
