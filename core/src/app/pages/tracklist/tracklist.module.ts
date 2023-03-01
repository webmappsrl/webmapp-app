import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {TracklistPage} from './tracklist.page';
import {TracklistPageRoutingModule} from './tracklist-routing.module';
import {WmMapModule} from 'src/app/shared/map-core/map-core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TracklistPageRoutingModule,
    WmPipeModule,
    MapModule,
    WmMapModule,
  ],
  declarations: [TracklistPage],
})
export class TracklistPageModule {}
