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
import { FavBtnComponent } from './fav-btn/fav-btn.component';
import { DownloadPanelComponent } from './download-panel/download-panel.component';
import { SharedModule } from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoutePageRoutingModule,
    TranslateModule,
    MapModule,
    PipeModule,
    SharedModule
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
    DownloadPanelComponent,
    FavBtnComponent
  ],
})
export class RoutePageModule {}
