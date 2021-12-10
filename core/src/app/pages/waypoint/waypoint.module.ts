import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WaypointPageRoutingModule } from './waypoint-routing.module';

import { WaypointPage } from './waypoint.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';
import { ModalWaypointSaveComponent } from './modal-waypoint-save/modal-waypoint-save.component';
import { ModalWaypointSelectphotosComponent } from './modal-waypoint-selectphotos/modal-waypoint-selectphotos.component';
import { SharedModule } from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaypointPageRoutingModule,
    TranslateModule,
    MapModule,
    SharedModule
  ],
  declarations: [
    WaypointPage,
    ModalWaypointSaveComponent,
    ModalWaypointSelectphotosComponent,
  ],
})
export class WaypointPageModule {}
