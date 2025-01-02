import {AppPipeModule} from './../../pipes/pipes.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {WaypointdetailPage} from './waypointdetail.page';
import {WaypointdetailPageRoutingModule} from './waypointdetail-routing.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {WmCoreModule} from '@wm-core/wm-core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointdetailPageRoutingModule,
    WmPipeModule,
    WmMapModule,
    AppPipeModule,
    SharedModule,
    WmCoreModule,
  ],
  declarations: [WaypointdetailPage],
})
export class WaypointdetailPageModule {}
