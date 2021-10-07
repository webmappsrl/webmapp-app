import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ModalHeaderComponent } from './partials/modal-header/modal-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericPopoverComponent } from './generic-popover/generic-popover.component';

@NgModule({
  declarations: [LoginComponent, ModalHeaderComponent,GenericPopoverComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  exports: [LoginComponent, ModalHeaderComponent,GenericPopoverComponent],
})
export class SharedModule {}
