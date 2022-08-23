import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {TracklistPage} from './tracklist.page';
import {TracklistPageRoutingModule} from './tracklist-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TracklistPageRoutingModule,
    PipeModule,
    MapModule,
  ],
  declarations: [TracklistPage],
})
export class TracklistPageModule {}
