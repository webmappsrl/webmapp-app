import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavMapComponent} from './nav-map.component';
import {NavMapPositionDirective} from './position.directive';
import {NavMapTrackDirective} from './track.directive';
import {BackgroundGeolocation} from '@awesome-cordova-plugins/background-geolocation/ngx';
@NgModule({
  declarations: [NavMapComponent, NavMapPositionDirective, NavMapTrackDirective],
  imports: [CommonModule],
  providers: [BackgroundGeolocation],
  exports: [NavMapComponent, NavMapPositionDirective, NavMapTrackDirective],
})
export class NavMapModule {}
