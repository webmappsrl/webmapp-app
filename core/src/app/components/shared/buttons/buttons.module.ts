import {BtnCenterPosition} from './btn-center-position/btn-center-position.component';
import {BtnOrientation} from './btn-orientation/btn-orientation.component';
import {BtnTiles} from './btn-tiles/btn-tiles';
import {BtnTrackRecordingComponent} from './btn-track-recording/btn-track-recording.component';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {BackgroundGeolocation} from '@awesome-cordova-plugins/background-geolocation/ngx';
const components = [BtnOrientation, BtnCenterPosition, BtnTrackRecordingComponent, BtnTiles];
@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: components,
  providers: [BackgroundGeolocation],
  exports: components,
})
export class ButtonsModule {}
