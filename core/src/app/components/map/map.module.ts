import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';

import {WmMapModule} from 'src/app/shared/map-core/src/map-core.module';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {BtnGeolocationComponent} from './btn-geolocation/btn-geolocation.component';
import {BtnLayerComponent} from './btn-layer/btn-layer.component';
import {BtnOrientationComponent} from './btn-orientation/btn-orientation.component';
import {BtnRecComponent} from './btn-rec/btn-rec.component';
import {BtnRegisterComponent} from './btn-register/btn-register.component';
import {ClusterMarkerComponent} from './cluster-marker/cluster-marker.component';
import {ItineraryMapComponent} from './itinerary-map/itinerary-map.component';
import {MapComponent} from './map/map.component';
import {OldMapComponent} from './old-map/map.component';
import {PopoverRegisterComponent} from './popover-register/popover-register.component';
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
  imports: [CommonModule, IonicModule, WmMapModule, WmPipeModule],
  exports: [
    BtnRegisterComponent,
    BtnOrientationComponent,
    MapComponent,
    OldMapComponent,
    ItineraryMapComponent,
  ],
})
export class MapModule {}
