import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {MapModule} from 'src/app/components/map/map.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {WmMapModule} from './../../shared/map-core/src/map-core.module';
import {DownloadPanelComponent} from './download-panel/download-panel.component';
import {FavBtnComponent} from './fav-btn/fav-btn.component';
import {RoutePageRoutingModule} from './itinerary-routing.module';
import {ItineraryPage} from './itinerary.page';
import {SlopeChartComponent} from './slope-chart/slope-chart.component';
import {TabDescriptionComponent} from './tab-description/tab-description.component';
import {TabDetailComponent} from './tab-detail/tab-detail.component';
import {TabHowtoComponent} from './tab-howto/tab-howto.component';
import {TabNearestPoiComponent} from './tab-nearest-poi/tab-nearest-poi.component';
import {TabPoiComponent} from './tab-poi/tab-poi.component';
import {TabViabilityComponent} from './tab-viability/tab-viability.component';
import {TabWalkableComponent} from './tab-walkable/tab-walkable.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoutePageRoutingModule,
    MapModule,
    WmPipeModule,
    SharedModule,
    WmMapModule,
  ],
  declarations: [
    ItineraryPage,
    TabDetailComponent,
    TabWalkableComponent,
    TabHowtoComponent,
    TabPoiComponent,
    TabDescriptionComponent,
    TabViabilityComponent,
    SlopeChartComponent,
    DownloadPanelComponent,
    FavBtnComponent,
    TabNearestPoiComponent,
  ],
})
export class ItineraryPageModule {}
