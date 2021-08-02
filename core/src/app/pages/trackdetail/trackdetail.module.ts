import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackdetailPageRoutingModule } from './trackdetail-routing.module';

import { TrackdetailPage } from './trackdetail.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackdetailPageRoutingModule,
    TranslateModule,
    MapModule
  ],
  declarations: [TrackdetailPage]
})
export class TrackdetailPageModule {}
