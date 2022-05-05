import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {from, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import { GeohubService } from 'src/app/services/geohub.service';
import { loadTrackFail, loadTrackSuccess, setCurrentTrackId } from './map.actions';

@Injectable({
  providedIn: 'root',
})
export class MapEffects {
  loadTrack$ = createEffect(() =>
    this._actions$.pipe(
      ofType(setCurrentTrackId),
      switchMap(action =>
        action.currentTrackId
          ? action.track
            ? of(action.track)
            : from(this._geohubSVC.getEcTrack(action.currentTrackId))
          : of(null),
      ),
      map(currentTrack => loadTrackSuccess({currentTrack})),
      catchError(() => of(loadTrackFail())),
    ),
  );

  constructor(private _geohubSVC: GeohubService, private _actions$: Actions) {}
}
