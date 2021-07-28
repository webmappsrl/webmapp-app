import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhotolistPageRoutingModule } from './photolist-routing.module';

import { PhotolistPage } from './photolist.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhotolistPageRoutingModule,
    TranslateModule
  ],
  declarations: [PhotolistPage]
})
export class PhotolistPageModule {}
