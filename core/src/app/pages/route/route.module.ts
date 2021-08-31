import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoutePageRoutingModule } from './route-routing.module';

import { RoutePage } from './route.page';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from 'src/app/components/map/map.module';
import { TabDetailComponent } from './tab-detail/tab-detail.component';
import { TabViabilityComponent } from './tab-viability/tab-viability.component';
import { TabDescriptionComponent } from './tab-description/tab-description.component';
import { TabEatComponent } from './tab-eat/tab-eat.component';
import { TabHowtoComponent } from './tab-howto/tab-howto.component';
import { TabWalkableComponent } from './tab-walkable/tab-walkable.component';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { SlopeChartComponent } from './slope-chart/slope-chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoutePageRoutingModule,
    TranslateModule,
    MapModule,
    PipeModule,
  ],
  declarations: [
    RoutePage,
    TabDetailComponent,
    TabWalkableComponent,
    TabHowtoComponent,
    TabEatComponent,
    TabDescriptionComponent,
    TabViabilityComponent,
    SlopeChartComponent,
  ],
})
export class RoutePageModule {}
