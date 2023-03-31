import {IonicModule} from '@ionic/angular';
import {HomeComponent} from './home/home.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {BoxModule} from 'src/app/components/box/box.module';
const cmps = [HomeComponent];
@NgModule({
  declarations: [...cmps],
  exports: [...cmps],
  imports: [CommonModule, IonicModule, WmPipeModule, BoxModule],
})
export class HomeModule {}
