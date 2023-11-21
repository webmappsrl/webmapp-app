import {CardsModule} from 'src/app/components/cards/cards.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HomePage} from './home.page';
import {HomePageRoutingModule} from './home-routing.module';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {IntroComponent} from './intro/intro.component';
import {HomeModule} from 'src/app/components/home/home.module';
import {BoxModule} from 'src/app/components/box/box.module';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';
import {WmCoreModule} from 'wm-core/wm-core.module';
@NgModule({
  declarations: [HomePage, IntroComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardsModule,
    HomePageRoutingModule,
    SharedModule,
    HomeModule,
    BoxModule,
    WmPipeModule,
    WmCoreModule,
  ],
})
export class HomePageModule {}
