import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WmMapPositionDirective} from './position.directive';
import {WmMapTrackDirective} from './track.directive';
import {BackgroundGeolocation} from '@awesome-cordova-plugins/background-geolocation/ngx';
import {WmMapLayerDirective} from './layer.directive';
import {WmMapDirective} from './map.directive';
import {WmMapComponent} from './component/map.component';
const directives = [
  WmMapDirective,
  WmMapPositionDirective,
  WmMapTrackDirective,
  WmMapLayerDirective,
];
const components = [WmMapComponent];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule],
  providers: [BackgroundGeolocation],
  exports: [...components, ...directives],
})
export class WmMapModule {}
