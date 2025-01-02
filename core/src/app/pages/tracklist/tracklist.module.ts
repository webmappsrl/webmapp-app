import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {TracklistPageRoutingModule} from './tracklist-routing.module';
import {TracklistPage} from './tracklist.page';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TracklistPageRoutingModule,
    WmPipeModule,
    WmMapModule,
  ],
  declarations: [TracklistPage],
})
export class TracklistPageModule {}
