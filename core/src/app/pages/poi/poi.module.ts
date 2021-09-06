import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PoiPageRoutingModule } from './poi-routing.module';

import { PoiPage } from './poi.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { MapModule } from 'src/app/components/map/map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoiPageRoutingModule,
    TranslateModule,
    PipeModule,
    MapModule
  ],
  declarations: [PoiPage]
})
export class PoiPageModule {}
