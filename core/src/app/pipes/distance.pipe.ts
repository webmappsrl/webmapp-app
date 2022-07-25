import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'distance',
})
export class DistancePipe implements PipeTransform {
  transform(value: number, distance = 'km'): string {
    if (value != null && distance === 'km') {
      return `${Math.round(value * 10) / 10} km`;
    }
    return `${value}`;
  }
}
