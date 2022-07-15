import {createFeatureSelector, createSelector} from '@ngrx/store';

import {IGeojsonFeature} from 'src/app/types/model';
import {confFeatureKey} from './pois.reducer';

export const poisFeature = createFeatureSelector<any>(confFeatureKey);
export const pois = createSelector(poisFeature, state => state);
export const poisF = createSelector(poisFeature, state => state.features);
