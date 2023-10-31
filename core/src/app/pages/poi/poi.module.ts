import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PoiPage} from './poi.page';
import {PoiPageRoutingModule} from './poi-routing.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoiPageRoutingModule,
    WmPipeModule,
    WmMapModule,
    SharedModule,
  ],
  declarations: [PoiPage],
})
export class PoiPageModule {}
