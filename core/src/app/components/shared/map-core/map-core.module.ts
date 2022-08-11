import {BackgroundGeolocation} from '@awesome-cordova-plugins/background-geolocation/ngx';
import {ButtonsModule} from './buttons/buttons.module';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WmMapComponent} from './component/map/map.component';
import {WmMapDirective} from './map.directive';
import {WmMapLayerDirective} from './layer.directive';
import {WmMapPoisDirective} from './pois.directive';
import {WmMapPositionDirective} from './position.directive';
import {WmMapRelatedPoisDirective} from './related-pois.directive';
import {WmMapTrackDirective} from './track.directive';
const directives = [
  WmMapDirective,
  WmMapPositionDirective,
  WmMapTrackDirective,
  WmMapLayerDirective,
  WmMapPoisDirective,
  WmMapRelatedPoisDirective,
];
const components = [WmMapComponent];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule, ButtonsModule],
  providers: [BackgroundGeolocation],
  exports: [...components, ...directives],
})
export class WmMapModule {}
