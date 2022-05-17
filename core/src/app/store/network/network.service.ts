import {Injectable} from '@angular/core';
import {fromEvent, merge, Observable, of, timer} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  online$: Observable<boolean>;
  constructor() {
    this.online$ = timer(1000, 2000).pipe(
      switchMap(() => merge(fromEvent(window, 'online'), fromEvent(window, 'offline'))),
      map(() => navigator.onLine),
      startWith(navigator.onLine),
    );
  }
}
