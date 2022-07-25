import {CommonModule} from '@angular/common';
import {DistancePipe} from './distance.pipe';
import {DurationPipe} from './duration.pipe';
import {MinuteTimePipe} from './minutetime.pipe';
import {NgModule} from '@angular/core';
import {WmTransPipe} from './wmtrans.pipe';

const pipes = [WmTransPipe, MinuteTimePipe, DistancePipe, DurationPipe];
@NgModule({
  declarations: pipes,
  imports: [CommonModule],
  exports: pipes,
})
export class PipeModule {}
