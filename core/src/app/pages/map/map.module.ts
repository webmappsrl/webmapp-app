import {ButtonsModule} from 'src/app/components/shared/map-core/buttons/buttons.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapModule} from 'src/app/components/map/map.module';
import {MapPage} from './map.page';
import {MapPageRoutingModule} from './map-routing.module';
import {MapTrackCardComponent} from './map-track-card/map-track-card.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {WmMapModule} from 'src/app/components/shared/map-core/map-core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MapModule,
    TranslateModule,
    PipeModule,
    SharedModule,
    WmMapModule,
    ButtonsModule,
  ],
  declarations: [MapPage, MapTrackCardComponent],
})
export class MapPageModule {}
