import {Injectable} from '@angular/core';
import {fromEvent, merge, Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  online$: Observable<boolean>;
  constructor() {
    this.online$ = merge(of(null), fromEvent(window, 'online'), fromEvent(window, 'offline')).pipe(
      map(() => navigator.onLine),
      startWith(navigator.onLine),
    );
  }
}
