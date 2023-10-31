import {CommonModule} from '@angular/common';
import {DownloadedTracksBoxComponent} from './downloaded-tracks-box/downloaded-tracks-box.component';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {WmPipeModule} from 'wm-core/pipes/pipe.module';
import {BoxModule as BaseBoxModule} from 'wm-core/box/box.module';
import {WmSharedModule} from 'wm-core/shared/shared.module';
import {SharedModule} from '../shared/shared.module';

const boxComponents = [DownloadedTracksBoxComponent];
@NgModule({
  declarations: boxComponents,
  imports: [CommonModule, IonicModule, WmPipeModule, BaseBoxModule, WmSharedModule],
  exports: [...boxComponents, BaseBoxModule],
})
export class BoxModule {}
