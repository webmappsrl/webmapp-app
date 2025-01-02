import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {TabsPage} from './tabs.page';
import {TabsPageRoutingModule} from './tabs-routing.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, TabsPageRoutingModule, WmPipeModule],
  declarations: [TabsPage],
})
export class TabsPageModule {}
