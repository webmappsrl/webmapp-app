import {AppPipeModule} from './../../pipes/pipes.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {TrackdetailPage} from './trackdetail.page';
import {TrackdetailPageRoutingModule} from './trackdetail-routing.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackdetailPageRoutingModule,
    WmPipeModule,
    WmMapModule,
    AppPipeModule,
  ],
  declarations: [TrackdetailPage],
})
export class TrackdetailPageModule {}
