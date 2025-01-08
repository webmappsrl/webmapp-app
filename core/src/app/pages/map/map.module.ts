import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';

import {PoiPropetiesModule} from 'src/app/components/poi-properties/poi-properties.module';
import {ButtonsModule} from 'src/app/components/shared/buttons/buttons.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {RegisterPageModule} from '../register/register.module';
import {WmDownloadPanelComponent} from './download-panel/download-panel.component';
import {WmDownloadComponent} from './download/download.component';
import {MapPageRoutingModule} from './map-routing.module';
import {MapTrackCardComponent} from './map-track-card/map-track-card.component';
import {MapDetailsComponent} from './map-details/map-details.component';
import {MapPage} from './map.page';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {WmCoreModule} from '@wm-core/wm-core.module';
import {WmTransPipe} from '@wm-core/pipes/wmtrans.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    WmPipeModule,
    SharedModule,
    WmMapModule,
    ButtonsModule,
    RegisterPageModule,
    PoiPropetiesModule,
    WmCoreModule,
  ],
  declarations: [
    MapPage,
    MapTrackCardComponent,
    MapDetailsComponent,
    WmDownloadComponent,
    WmDownloadPanelComponent,
  ],
  providers: [WmTransPipe],
})
export class MapPageModule {}
