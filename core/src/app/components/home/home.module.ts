import {HomeComponent} from './home/home.component';
import {NgModule} from '@angular/core';
import {BoxModule} from '../box/box.module';
import {CommonModule} from '@angular/common';
const cmps = [HomeComponent];
@NgModule({
  declarations: [...cmps],
  exports: [...cmps],
  imports: [CommonModule, BoxModule],
})
export class HomeModule {}
