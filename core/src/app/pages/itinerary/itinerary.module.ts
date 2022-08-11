import {CommonModule} from '@angular/common';
import {DownloadPanelComponent} from './download-panel/download-panel.component';
import {FavBtnComponent} from './fav-btn/fav-btn.component';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {ItineraryPage} from './itinerary.page';
import {MapModule} from 'src/app/components/map/map.module';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {RoutePageRoutingModule} from './itinerary-routing.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {SlopeChartComponent} from './slope-chart/slope-chart.component';
import {TabDescriptionComponent} from './tab-description/tab-description.component';
import {TabDetailComponent} from './tab-detail/tab-detail.component';
import {TabHowtoComponent} from './tab-howto/tab-howto.component';
import {TabPoiComponent} from './tab-poi/tab-poi.component';
import {TabViabilityComponent} from './tab-viability/tab-viability.component';
import {TabWalkableComponent} from './tab-walkable/tab-walkable.component';
import {TrackAudioComponent} from './track-audio/track-audio.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoutePageRoutingModule,
    TranslateModule,
    MapModule,
    PipeModule,
    SharedModule,
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
    TrackAudioComponent,
  ],
})
export class ItineraryPageModule {}
