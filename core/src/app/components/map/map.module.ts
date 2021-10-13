import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { IonicModule } from '@ionic/angular';
import { BtnGeolocationComponent } from './btn-geolocation/btn-geolocation.component';
import { BtnRegisterComponent } from './btn-register/btn-register.component';
import { PopoverRegisterComponent } from './popover-register/popover-register.component';
import { TranslateModule } from '@ngx-translate/core';
import { BtnLayerComponent } from './btn-layer/btn-layer.component';
import { BtnRecComponent } from './btn-rec/btn-rec.component';
import { ClusterMarkerComponent } from './cluster-marker/cluster-marker.component';

@NgModule({
  declarations: [
    MapComponent,
    BtnGeolocationComponent,
    BtnRegisterComponent,
    BtnLayerComponent,
    BtnRecComponent,
    PopoverRegisterComponent,
    ClusterMarkerComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule
  ],
  exports:[
    MapComponent,
    BtnRegisterComponent,
  ]
})
export class MapModule { }
