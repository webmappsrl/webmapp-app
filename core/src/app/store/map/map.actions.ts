import {createAction, props} from '@ngrx/store';

import {Feature, LineString} from 'geojson';
import {ILAYER} from 'wm-core/types/config';

export const setCurrentLayer = createAction(
  '[map] Set current layer',
  props<{currentLayer: ILAYER}>(),
);

export const setCurrentTrackId = createAction(
  '[map] Set current tack id',
  props<{currentTrackId: number | null; track?: any}>(),
);

export const setCurrentPoiId = createAction(
  '[map] Set current poi id',
  props<{currentPoiId: number}>(),
);
export const setCurrentFilters = createAction(
  '[map] Set current Filters',
  props<{currentFilters: any[]}>(),
);

export const openDetails = createAction('[map] Set detail open', props<{openDetails: boolean}>());
export const loadTrackSuccess = createAction(
  '[map] Success load track',
  props<{currentTrack: Feature<LineString> | null}>(),
);

export const goToHome = createAction('[map] go to home');
export const loadConfFail = createAction('[map] Set current layer Success Fail');
export const loadTrackFail = createAction('[map] Fail load track');
