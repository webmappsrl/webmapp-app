import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';

import {ButtonsModule} from 'src/app/components/shared/buttons/buttons.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {WmMapModule} from 'src/app/shared/map-core/map-core.module';
import {RegisterPageModule} from '../register/register.module';
import {MapPageRoutingModule} from './map-routing.module';
import {MapTrackCardComponent} from './map-track-card/map-track-card.component';
import {MapPage} from './map.page';
import {MapTrackDetailsComponent} from './map-track-details/map-track-details.component';
import {WmCoreModule} from 'src/app/shared/wm-core/wm-core.module';
import {PoiPropetiesModule} from 'src/app/components/poi-properties/poi-properties.module';
import {TrackPropetiesModule} from 'src/app/components/track-properties/track-properties.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    TranslateModule,
    PipeModule,
    SharedModule,
    WmMapModule,
    ButtonsModule,
    RegisterPageModule,
    WmCoreModule,
    PoiPropetiesModule,
    TrackPropetiesModule,
  ],
  declarations: [MapPage, MapTrackCardComponent, MapTrackDetailsComponent],
})
export class MapPageModule {}
