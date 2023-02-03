import {CardsModule} from 'src/app/components/cards/cards.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HomePage} from './home.page';
import {HomePageRoutingModule} from './home-routing.module';
import {InnerHtmlModule} from 'src/app/components/modal-inner-html/modal-inner-html.module';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {IntroComponent} from './intro/intro.component';
import {HomeModule} from 'src/app/components/home/home.module';
import {BoxModule} from 'src/app/components/box/box.module';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardsModule,
    HomePageRoutingModule,
    SharedModule,
    InnerHtmlModule,
    HomeModule,
    BoxModule,
    WmPipeModule,
  ],
  declarations: [HomePage, IntroComponent],
  entryComponents: [],
})
export class HomePageModule {}
