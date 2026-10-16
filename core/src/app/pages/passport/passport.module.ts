import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {WmCoreModule} from '@wm-core/wm-core.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {PassportPageRoutingModule} from './passport-routing.module';
import {PassportPage} from './passport.page';

/** Tab Passaporto di camminiditalia (oc:8703), caricato solo dalla variante del routing dei tab. */
@NgModule({
  imports: [CommonModule, IonicModule, WmCoreModule, WmPipeModule, PassportPageRoutingModule],
  declarations: [PassportPage],
})
export class PassportPageModule {}
