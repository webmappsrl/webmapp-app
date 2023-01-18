import {CommonModule} from '@angular/common';
import {DownloadedTracksBoxComponent} from './downloaded-tracks-box/downloaded-tracks-box.component';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {TranslateModule} from '@ngx-translate/core';
import {BoxModule as BaseBoxModule} from 'src/app/shared/wm-core/box/box.module';

const boxComponents = [DownloadedTracksBoxComponent];
@NgModule({
  declarations: boxComponents,
  imports: [CommonModule, IonicModule, PipeModule, TranslateModule, BaseBoxModule],
  exports: [...boxComponents, BaseBoxModule],
})
export class BoxModule {}
