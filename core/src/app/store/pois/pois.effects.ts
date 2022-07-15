import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, switchMap} from 'rxjs/operators';
import {loadPois, loadPoisFail, loadPoisSuccess} from './pois.actions';

import {Injectable} from '@angular/core';
import {PoisService} from './pois.service';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PoisEffects {
  loadPois$ = createEffect(() =>
    this._actions$.pipe(
      ofType(loadPois),
      switchMap(() =>
        this._poisSvc.getPois().pipe(
          map(pois => loadPoisSuccess({pois: pois})),
          catchError(() => of(loadPoisFail())),
        ),
      ),
    ),
  );

  constructor(private _poisSvc: PoisService, private _actions$: Actions) {}
}
