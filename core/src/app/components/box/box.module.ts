import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { LayerBoxComponent } from './layer-box/layer-box.component';
import { SearchBoxComponent } from './search-box/search-box.component';

const boxComponents = [LayerBoxComponent, SearchBoxComponent];
@NgModule({
  declarations: boxComponents,
  imports: [CommonModule, IonicModule, PipeModule, TranslateModule, SharedModule],
  exports: boxComponents,
})
export class BoxModule { }
