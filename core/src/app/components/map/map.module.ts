import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BtnGeolocationComponent } from './btn-geolocation/btn-geolocation.component';
import { BtnRegisterComponent } from './btn-register/btn-register.component';
import { PopoverRegisterComponent } from './popover-register/popover-register.component';
import { TranslateModule } from '@ngx-translate/core';
import { BtnLayerComponent } from './btn-layer/btn-layer.component';
import { BtnRecComponent } from './btn-rec/btn-rec.component';
import { ClusterMarkerComponent } from './cluster-marker/cluster-marker.component';
import { BtnOrientationComponent } from './btn-orientation/btn-orientation.component';
import { MapComponent } from './map/map.component';
import { OldMapComponent } from './old-map/map.component';
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
    OldMapComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
  ],
  exports:[
    BtnRegisterComponent,
    BtnOrientationComponent,
    MapComponent,
    OldMapComponent
  ]
})
export class MapModule { }
