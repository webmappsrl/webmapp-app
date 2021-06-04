import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { IonicModule } from '@ionic/angular';
import { BtnGeolocationComponent } from './btn-geolocation/btn-geolocation.component';
import { BtnRegisterComponent } from './btn-register/btn-register.component';
import { PopoverRegisterComponent } from './popover-register/popover-register.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MapComponent,
    BtnGeolocationComponent,
    BtnRegisterComponent,
    PopoverRegisterComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule
  ],
  exports:[
    MapComponent
  ]
})
export class MapModule { }
