import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {TrackdetailPage} from './trackdetail.page';
import {TrackdetailPageRoutingModule} from './trackdetail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackdetailPageRoutingModule,
    PipeModule,
    MapModule,
  ],
  declarations: [TrackdetailPage],
})
export class TrackdetailPageModule {}
