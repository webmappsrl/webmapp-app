import {CommonModule} from '@angular/common';
import {InnerHtmlComponent} from './modal-inner-html.component';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [InnerHtmlComponent],
  imports: [CommonModule, IonicModule, SharedModule],
  exports: [InnerHtmlComponent],
})
export class InnerHtmlModule {}
