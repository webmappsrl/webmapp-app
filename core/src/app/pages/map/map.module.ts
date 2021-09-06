import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';

import { MapPage } from './map.page';
import { MapModule } from 'src/app/components/map/map.module';
import { RecordingBtnComponent } from './recording-btn/recording-btn.component';
import { TranslateModule } from '@ngx-translate/core';
import { SearchBarComponent } from 'src/app/components/search-bar/search-bar.component';
import { MapTrackCardComponent } from './map-track-card/map-track-card.component';
import { PipeModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MapModule,
    TranslateModule,
    PipeModule
  ],
  declarations: [
    RecordingBtnComponent,
    MapPage,
    SearchBarComponent,
    MapTrackCardComponent
  ]
})
export class MapPageModule { }
