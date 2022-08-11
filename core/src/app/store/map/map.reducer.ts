import {createReducer, on} from '@ngrx/store';
import {
  loadTrackSuccess,
  openDetails,
  setCurrentFilters,
  setCurrentLayer,
  setCurrentPoiId,
} from './map.actions';

import {IMapRootState} from './map';

const initialUIState: IMapRootState = null;
export const UIReducer = createReducer(
  initialUIState,
  on(setCurrentLayer, (state, {currentLayer}) => {
    return {
      ...state,
      ...{currentLayer},
    };
  }),
  on(setCurrentFilters, (state, {currentFilters}) => {
    return {
      ...state,
      ...{currentFilters},
    };
  }),
  on(setCurrentPoiId, (state, {currentPoiId}) => {
    const currentRelatedPoi = state != null ? state.currentRelatedPoi : [];
    const currentPoi =
      currentPoiId != null && currentRelatedPoi != null && currentRelatedPoi.length > 0
        ? currentRelatedPoi.filter(poi => +poi.properties.id === +currentPoiId)[0]
        : null;

    const poiIndex =
      currentPoi != null
        ? currentRelatedPoi.findIndex(p => +p.properties.id === +currentPoiId)
        : null;
    const nextPoiIndex =
      currentPoi != null
        ? currentRelatedPoi[(poiIndex + 1) % currentRelatedPoi.length].properties.id
        : null;
    const prevPoiIndex =
      currentPoi != null
        ? currentRelatedPoi[(poiIndex + currentRelatedPoi.length - 1) % currentRelatedPoi.length]
            .properties.id
        : null;
    return {
      ...state,
      ...{currentPoiId},
      ...{currentPoi},
      ...{nextPoiIndex},
      ...{prevPoiIndex},
    };
  }),
  on(loadTrackSuccess, (state, {currentTrack}) => {
    const currentTrackProperties = currentTrack?.properties || null;
    const currentRelatedPoi = currentTrackProperties?.related_pois ?? [];
    const currentPoiIDs = currentRelatedPoi.map(poi => poi.properties.id) || [];

    return {
      ...state,
      ...{currentTrack},
      ...{currentTrackProperties},
      ...{currentRelatedPoi},
      ...{currentPoiIDs},
    };
  }),
  on(openDetails, (state, {openDetails}) => {
    return {
      ...state,
      padding: openDetails ? [50, 50, 400, 50] : [50, 50, 50, 50],
    };
  }),
);
