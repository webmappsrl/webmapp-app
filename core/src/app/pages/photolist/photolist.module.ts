import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PhotolistPage} from './photolist.page';
import {PhotolistPageRoutingModule} from './photolist-routing.module';
import {PipeModule} from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PhotolistPageRoutingModule, PipeModule],
  declarations: [PhotolistPage],
})
export class PhotolistPageModule {}
