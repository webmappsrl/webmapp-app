import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WmTransPipe } from './wmtrans.pipe';


@NgModule({
  declarations: [WmTransPipe],
  imports: [CommonModule],
  exports: [WmTransPipe],
})
export class PipeModule {}
