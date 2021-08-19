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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MapModule,
    TranslateModule
  ],
  declarations: [
    RecordingBtnComponent,
    MapPage,
    SearchBarComponent
  ]
})
export class MapPageModule { }
