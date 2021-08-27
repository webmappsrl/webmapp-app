import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WmTransPipe } from './wmtrans.pipe';
import { MinuteTimePipe } from './minutetime.pipe';


@NgModule({
  declarations: [WmTransPipe, MinuteTimePipe],
  imports: [CommonModule],
  exports: [WmTransPipe, MinuteTimePipe],
})
export class PipeModule { }
