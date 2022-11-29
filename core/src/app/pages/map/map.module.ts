import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {TranslateModule} from '@ngx-translate/core';

import {ButtonsModule} from 'src/app/components/shared/map-core/buttons/buttons.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {WmMapModule} from 'src/app/shared/map-core/map-core.module';
import {RegisterPageModule} from '../register/register.module';
import {MapPageRoutingModule} from './map-routing.module';
import {MapTrackCardComponent} from './map-track-card/map-track-card.component';
import {MapPage} from './map.page';

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
  ],
  declarations: [MapPage, MapTrackCardComponent],
})
export class MapPageModule {}
