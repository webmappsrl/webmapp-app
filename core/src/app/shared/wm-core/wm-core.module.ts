import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {IonicModule} from '@ionic/angular';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {WmSlopeChartComponent} from './slope-chart/slope-chart.component';

import {WmTabDetailComponent} from './tab-detail/tab-detail.component';
import {WmDownloadComponent} from './download/download/download.component';
import {WmDownloadPanelComponent} from './download-panel/download-panel.component';

const directives = [];
const components = [
  WmTabDetailComponent,
  WmSlopeChartComponent,
  WmDownloadComponent,
  WmDownloadPanelComponent,
];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule, IonicModule, PipeModule],
  exports: [...components, ...directives],
})
export class WmCoreModule {}
