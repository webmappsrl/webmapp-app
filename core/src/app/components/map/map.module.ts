import {BtnGeolocationComponent} from './btn-geolocation/btn-geolocation.component';
import {BtnLayerComponent} from './btn-layer/btn-layer.component';
import {BtnOrientationComponent} from './btn-orientation/btn-orientation.component';
import {BtnRecComponent} from './btn-rec/btn-rec.component';
import {BtnRegisterComponent} from './btn-register/btn-register.component';
import {ClusterMarkerComponent} from './cluster-marker/cluster-marker.component';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ItineraryMapComponent} from './itinerary-map/itinerary-map.component';
import {MapComponent} from './map/map.component';
import {NavMapModule} from './nav-map/nav-map.module';
import {NgModule} from '@angular/core';
import {OldMapComponent} from './old-map/map.component';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {PopoverRegisterComponent} from './popover-register/popover-register.component';
import {TranslateModule} from '@ngx-translate/core';
import {WmMapModule} from '../shared/map-core/map-core.module';
@NgModule({
  declarations: [
    BtnGeolocationComponent,
    BtnRegisterComponent,
    BtnLayerComponent,
    BtnRecComponent,
    BtnOrientationComponent,
    PopoverRegisterComponent,
    ClusterMarkerComponent,
    MapComponent,
    OldMapComponent,
    ItineraryMapComponent,
  ],
  imports: [CommonModule, IonicModule, TranslateModule, NavMapModule, WmMapModule, PipeModule],
  exports: [
    BtnRegisterComponent,
    BtnOrientationComponent,
    MapComponent,
    OldMapComponent,
    ItineraryMapComponent,
    NavMapModule,
  ],
})
export class MapModule {}
