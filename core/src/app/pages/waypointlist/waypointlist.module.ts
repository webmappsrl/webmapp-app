import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {WaypointlistPage} from './waypointlist.page';
import {WaypointlistPageRoutingModule} from './waypointlist-routing.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';

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
