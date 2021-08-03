import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TracklistPageRoutingModule } from './tracklist-routing.module';

import { TracklistPage } from './tracklist.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TracklistPageRoutingModule,
    TranslateModule,
    MapModule
  ],
  declarations: [TracklistPage]
})
export class TracklistPageModule {}
