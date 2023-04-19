import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {RoutePageRoutingModule} from './navigation-routing.module';

import {MapModule} from 'src/app/components/map/map.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {NavigationPage} from './navigation.page';
import {TabDetailComponent} from './tab-detail/tab-detail.component';
import {SlopeChartComponent} from './slope-chart/slope-chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoutePageRoutingModule,
    MapModule,
    WmPipeModule,
    SharedModule,
  ],
  declarations: [NavigationPage, TabDetailComponent, SlopeChartComponent],
})
export class NavigationPageModule {}
