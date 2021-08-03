import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoutePageRoutingModule } from './route-routing.module';

import { RoutePage } from './route.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';
import { WmTransPipe } from 'src/app/pipes/wmtrans.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoutePageRoutingModule,
    TranslateModule,
    MapModule
  ],
  declarations: [
    RoutePage,
    WmTransPipe,]
})
export class RoutePageModule { }
