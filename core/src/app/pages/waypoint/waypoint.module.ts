import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {ModalWaypointSaveComponent} from './modal-waypoint-save/modal-waypoint-save.component';
import {ModalWaypointSelectphotosComponent} from './modal-waypoint-selectphotos/modal-waypoint-selectphotos.component';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {WaypointPage} from './waypoint.page';
import {WaypointPageRoutingModule} from './waypoint-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointPageRoutingModule,
    WmPipeModule,
    MapModule,
    SharedModule,
  ],
  declarations: [WaypointPage, ModalWaypointSaveComponent, ModalWaypointSelectphotosComponent],
})
export class WaypointPageModule {}
