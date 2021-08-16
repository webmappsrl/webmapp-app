import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoutePageRoutingModule } from './route-routing.module';

import { RoutePage } from './route.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';
import { WmTransPipe } from 'src/app/pipes/wmtrans.pipe';
import { TabDetailComponent } from './tab-detail/tab-detail.component';
import { TabAccessibilityComponent } from './tab-accessibility/tab-accessibility.component';
import { TabDescriptionComponent } from './tab-description/tab-description.component';
import { TabEatComponent } from './tab-eat/tab-eat.component';
import { TabHowtoComponent } from './tab-howto/tab-howto.component';
import { TabWalkableComponent } from './tab-walkable/tab-walkable.component';

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
    WmTransPipe,
    TabDetailComponent,
    TabWalkableComponent,
    TabHowtoComponent,
    TabEatComponent,
    TabDescriptionComponent,
    TabAccessibilityComponent,
  ]
})
export class RoutePageModule { }
