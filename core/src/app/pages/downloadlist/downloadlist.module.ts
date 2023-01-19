import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {DownloadlistPageRoutingModule} from './downloadlist-routing.module';

import {DownloadlistPage} from './downloadlist.page';
import {TranslateModule} from '@ngx-translate/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {CardsModule} from 'src/app/components/cards/cards.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DownloadlistPageRoutingModule,
    TranslateModule,
    PipeModule,
    CardsModule,
  ],
  declarations: [DownloadlistPage],
})
export class DownloadlistPageModule {}
