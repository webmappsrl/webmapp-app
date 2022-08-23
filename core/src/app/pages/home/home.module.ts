import {BoxModule} from 'src/app/components/box/box.module';
import {CardsModule} from 'src/app/components/cards/cards.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HomePage} from './home.page';
import {HomePageRoutingModule} from './home-routing.module';
import {InnerHtmlModule} from 'src/app/components/modal-inner-html/modal-inner-html.module';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {SharedModule} from 'src/app/components/shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BoxModule,
    CardsModule,
    HomePageRoutingModule,
    TranslateModule.forChild(),
    PipeModule,
    SharedModule,
    InnerHtmlModule,
  ],
  declarations: [HomePage],
  entryComponents: [],
})
export class HomePageModule {}
