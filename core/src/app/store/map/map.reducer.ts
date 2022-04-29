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
    return {
      ...state,
      ...{currentPoiId},
      ...{currentPoi},
    };
  }),
  on(loadTrackSuccess, (state, {currentTrack}) => {
    const currentTrackProperties = currentTrack?.properties || null;
    const currentRelatedPoi =
      currentTrackProperties != null ? currentTrackProperties.related_pois : [];
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
