import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import {IMapRootState} from './map';

const feature = createFeatureSelector<IMapRootState | null>('map');

export const mapCurrentLayer = createSelector(feature, state =>
  state && state.currentLayer ? state.currentLayer : null,
);
export const mapCurrentTrack = createSelector(feature, state =>
  state && state.currentTrack ? state.currentTrack : null
);
export const mapCurrentTrackProperties = createSelector(feature, state =>
  state && state.currentTrackProperties ? state.currentTrackProperties : null,
);
export const mapCurrentRelatedPoi = createSelector(feature, state =>
  state && state.currentRelatedPoi ? state.currentRelatedPoi : null,
);
export const currentPoiID = createSelector(feature, state =>
  state && state.currentPoiId ? state.currentPoiId : null,
);
