import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {WmCoreModule} from '@wm-core/wm-core.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {ProfileDiaryTabComponent} from './profile-diary-tab.component';

/** Tab «Il mio diario» del profilo, solo camminiditalia (oc:8169). */
@NgModule({
  imports: [CommonModule, IonicModule, WmCoreModule, WmPipeModule],
  declarations: [ProfileDiaryTabComponent],
  exports: [ProfileDiaryTabComponent],
})
export class ProfileDiaryTabModule {}
