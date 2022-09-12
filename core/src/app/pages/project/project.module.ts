import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ProjectPageRoutingModule} from './project-routing.module';

import {ProjectPage} from './project.page';
import {PipeModule} from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ProjectPageRoutingModule, PipeModule],
  declarations: [ProjectPage],
})
export class ProjectPageModule {}
