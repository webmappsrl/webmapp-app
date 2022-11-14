import {IonicModule} from '@ionic/angular';
import {HomeComponent} from './home/home.component';
import {NgModule} from '@angular/core';
import {BoxModule} from '../box/box.module';
import {CommonModule} from '@angular/common';
import {SearchListComponent} from './search-list/search-list.component';
import {PipeModule} from 'src/app/pipes/pipe.module';
const cmps = [HomeComponent, SearchListComponent];
@NgModule({
  declarations: [...cmps],
  exports: [...cmps],
  imports: [CommonModule, BoxModule, IonicModule, PipeModule],
})
export class HomeModule {}
