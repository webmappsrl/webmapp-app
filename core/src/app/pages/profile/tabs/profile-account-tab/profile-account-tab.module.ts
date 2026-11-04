import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {WmCoreModule} from '@wm-core/wm-core.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {ProfileAccountTabComponent} from './profile-account-tab.component';

/** Tab «Account» del profilo, solo camminiditalia (oc:8169). */
@NgModule({
  imports: [CommonModule, IonicModule, WmCoreModule, WmPipeModule],
  declarations: [ProfileAccountTabComponent],
  exports: [ProfileAccountTabComponent],
})
export class ProfileAccountTabModule {}
