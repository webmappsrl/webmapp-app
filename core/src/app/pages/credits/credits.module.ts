import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {CreditsPageRoutingModule} from './credits-routing.module';

import {CreditsPage} from './credits.page';
import {PipeModule} from 'src/app/shared/wm-core/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, CreditsPageRoutingModule, PipeModule],
  declarations: [CreditsPage],
})
export class CreditsPageModule {}
