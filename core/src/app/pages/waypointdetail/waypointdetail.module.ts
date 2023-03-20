import {AppPipeModule} from './../../pipes/pipes.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {WaypointdetailPage} from './waypointdetail.page';
import {WaypointdetailPageRoutingModule} from './waypointdetail-routing.module';
import {SharedModule} from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointdetailPageRoutingModule,
    WmPipeModule,
    MapModule,
    AppPipeModule,
    SharedModule,
  ],
  declarations: [WaypointdetailPage],
})
export class WaypointdetailPageModule {}
