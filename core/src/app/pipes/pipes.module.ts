import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AppCreateBlobPipe} from './wm-create-blob.pipe';

const pipes = [AppCreateBlobPipe];
@NgModule({
  declarations: pipes,
  imports: [CommonModule],
  exports: pipes,
})
export class AppPipeModule {}
