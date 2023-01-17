import {WmCoreModule} from 'src/app/shared/wm-core/wm-core.module';
import {CardsModule} from 'src/app/shared/wm-core/cards/cards.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HomePage} from './home.page';
import {HomePageRoutingModule} from './home-routing.module';
import {InnerHtmlModule} from 'src/app/components/modal-inner-html/modal-inner-html.module';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {IntroComponent} from './intro/intro.component';
import {HomeModule} from 'src/app/components/home/home.module';
import {BoxModule} from 'src/app/components/box/box.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardsModule,
    HomePageRoutingModule,
    TranslateModule.forChild(),
    SharedModule,
    InnerHtmlModule,
    HomeModule,
    WmCoreModule,
    BoxModule,
  ],
  declarations: [HomePage, IntroComponent],
  entryComponents: [],
})
export class HomePageModule {}
