import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'wmtrans'
})
export class WmTransPipe implements PipeTransform {

  constructor(
    private translate: TranslateService
  ) {

  }

  transform(value: any, ...args: unknown[]): unknown {
    if (value) {
      if (value[this.translate.currentLang]) {
        return value[this.translate.currentLang];
      }
      if (value[this.translate.defaultLang]) {
        return value[this.translate.defaultLang];
      }
      for (const val in value) {
        if (value[val]) {
          return value[val];
        }
      }
    }
    return '';
  }

}
