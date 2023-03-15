import {createFeatureSelector, createSelector} from '@ngrx/store';

import {IMapRootState} from './map';

const feature = createFeatureSelector<IMapRootState | null>('map');

export const mapCurrentLayer = createSelector(feature, state =>
  state && state.currentLayer ? state.currentLayer : null,
);
export const mapCurrentTrack = createSelector(feature, state =>
  state && state.currentTrack ? state.currentTrack : null,
);
export const mapCurrentPoi = createSelector(feature, state =>
  state && state.currentPoi ? state.currentPoi : null,
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
export const nextPoiID = createSelector(feature, state =>
  state && state.nextPoiIndex ? state.nextPoiIndex : null,
);
export const prevPoiID = createSelector(feature, state =>
  state && state.prevPoiIndex ? state.prevPoiIndex : null,
);
export const padding = createSelector(feature, state =>
  state && state.padding ? state.padding : [50, 50, 50, 50],
);
export const currentFilters = createSelector(feature, state =>
  state && state.currentFilters ? state.currentFilters : [],
);
export const toggleHome = createSelector(feature, state =>
  state && state.goToHome != null ? state.goToHome : true,
);
