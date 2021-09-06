import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'wmtrans',
})
export class WmTransPipe implements PipeTransform {
  constructor(private _translate: TranslateService) { }

  transform(value: any, ...args: unknown[]): unknown {
    if (value) {
      if (value[this._translate.currentLang]) {
        return value[this._translate.currentLang];
      }
      if (value[this._translate.defaultLang]) {
        return value[this._translate.defaultLang];
      }
      for (const val in value) {
        if (value[val]) {
          return value[val];
        }
      }
      if (typeof (value) === 'string') {
        return value;
      }
    }
    return '';
  }
}
