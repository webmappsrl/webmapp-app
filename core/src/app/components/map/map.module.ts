import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { IonicModule } from '@ionic/angular';
import { BtnGeolocationComponent } from './btn-geolocation/btn-geolocation.component';

@NgModule({
  declarations: [
    MapComponent,
    BtnGeolocationComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports:[
    MapComponent
  ]
})
export class MapModule { }
