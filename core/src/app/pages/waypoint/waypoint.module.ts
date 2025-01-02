import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {ModalWaypointSaveComponent} from './modal-waypoint-save/modal-waypoint-save.component';
import {ModalWaypointSelectphotosComponent} from './modal-waypoint-selectphotos/modal-waypoint-selectphotos.component';
import {NgModule} from '@angular/core';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {WaypointPage} from './waypoint.page';
import {WaypointPageRoutingModule} from './waypoint-routing.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {WmCoreModule} from '@wm-core/wm-core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointPageRoutingModule,
    WmPipeModule,
    WmMapModule,
    WmCoreModule,
    SharedModule,
  ],
  declarations: [WaypointPage, ModalWaypointSaveComponent, ModalWaypointSelectphotosComponent],
})
export class WaypointPageModule {}
