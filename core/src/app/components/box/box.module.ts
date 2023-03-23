import {CommonModule} from '@angular/common';
import {DownloadedTracksBoxComponent} from './downloaded-tracks-box/downloaded-tracks-box.component';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';
import {BoxModule as BaseBoxModule} from 'src/app/shared/wm-core/box/box.module';
import {WmSharedModule} from 'src/app/shared/wm-core/shared/shared.module';

const boxComponents = [DownloadedTracksBoxComponent];
@NgModule({
  declarations: boxComponents,
  imports: [CommonModule, IonicModule, WmPipeModule, BaseBoxModule, WmSharedModule],
  exports: [...boxComponents, BaseBoxModule],
})
export class BoxModule {}
