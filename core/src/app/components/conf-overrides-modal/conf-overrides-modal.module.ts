import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ConfOverridesModalComponent} from './conf-overrides-modal.component';
import {SharedModule} from '../shared/shared.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {WmLocalizationModule} from '@wm-core/localization/localization.module';
import {WmCoreModule} from '@wm-core/wm-core.module';

@NgModule({
  declarations: [ConfOverridesModalComponent],
  imports: [
    CommonModule,
    IonicModule,
    WmPipeModule,
    SharedModule,
    WmLocalizationModule,
    WmCoreModule,
  ],
  exports: [ConfOverridesModalComponent],
})
export class ConfOverridesModalModule {}
