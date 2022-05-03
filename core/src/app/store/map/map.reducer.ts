import {createReducer, on} from '@ngrx/store';
import {IMapRootState} from './map';
import {loadTrackSuccess, setCurrentLayer, setCurrentPoiId, setCurrentTrackId} from './map.actions';

const initialUIState: IMapRootState = null;
export const UIReducer = createReducer(
  initialUIState,
  on(setCurrentLayer, (state, {currentLayer}) => {
    return {
      ...state,
      ...{currentLayer},
    };
  }),
  on(setCurrentPoiId, (state, {currentPoiId}) => {
    const currentRelatedPoi = state.currentRelatedPoi;
    const currentPoi =
      currentPoiId != null
        ? currentRelatedPoi.filter(poi => +poi.properties.id === +currentPoiId)[0]
        : null;

    const poiIndex = currentRelatedPoi.findIndex(p => +p.properties.id === +currentPoiId);
    const nextPoiIndex = currentRelatedPoi[(poiIndex + 1) % currentRelatedPoi.length].properties.id;
    const prevPoiIndex =
      currentRelatedPoi[(poiIndex + currentRelatedPoi.length - 1) % currentRelatedPoi.length]
        .properties.id;
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
);
