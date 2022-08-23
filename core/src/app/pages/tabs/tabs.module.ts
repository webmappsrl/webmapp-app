import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {TabsPage} from './tabs.page';
import {TabsPageRoutingModule} from './tabs-routing.module';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, TabsPageRoutingModule, PipeModule],
  declarations: [TabsPage],
})
export class TabsPageModule {}
