import {BtnCenterPosition} from './btn-center-position/btn-center-position.component';
import {BtnOrientation} from './btn-orientation/btn-orientation.component';
import {BtnTrackRecordingComponent} from './btn-track-recording/btn-track-recording.component';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
const components = [BtnOrientation, BtnCenterPosition, BtnTrackRecordingComponent];
@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: components,
  exports: components,
})
export class ButtonsModule {}
