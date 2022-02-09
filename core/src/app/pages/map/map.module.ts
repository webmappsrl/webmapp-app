import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';

import { MapPage } from './map.page';
import { MapModule } from 'src/app/components/map/map.module';
import { TranslateModule } from '@ngx-translate/core';
import { MapTrackCardComponent } from './map-track-card/map-track-card.component';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { SharedModule } from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MapModule,
    TranslateModule,
    PipeModule,
    SharedModule
  ],
  declarations: [
    MapPage,
    MapTrackCardComponent
  ]
})
export class MapPageModule { }
