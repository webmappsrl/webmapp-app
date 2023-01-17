import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {PoiPage} from './poi.page';
import {PoiPageRoutingModule} from './poi-routing.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoiPageRoutingModule,
    TranslateModule,
    PipeModule,
    MapModule,
    SharedModule,
  ],
  declarations: [PoiPage],
})
export class PoiPageModule {}
