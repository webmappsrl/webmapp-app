import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhotodetailPageRoutingModule } from './photodetail-routing.module';

import { PhotodetailPage } from './photodetail.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhotodetailPageRoutingModule,
    TranslateModule
  ],
  declarations: [PhotodetailPage]
})
export class PhotodetailPageModule {}
