import {createFeatureSelector, createSelector} from '@ngrx/store';

import {IGeojsonFeature} from 'src/app/types/model';
import {confFeatureKey} from './pois.reducer';
import {confPoisIcons} from '../conf/conf.selector';

export const poisFeature = createFeatureSelector<any>(confFeatureKey);
export const poisF = createSelector(poisFeature, state => state.features);
export const pois = createSelector(poisFeature, confPoisIcons, (state, icons) => {
  let s = state as any;
  if (s != null && s.features != null && icons != null) {
    const iconKeys = Object.keys(icons);
    const features = s.features.map(f => {
      if (f != null && f.properties != null && f.properties.taxonomyIdentifiers != null) {
        const filteredArray = f.properties.taxonomyIdentifiers.filter(value =>
          iconKeys.includes(value),
        );
        let address = '';
        let address_link = '';
        try {
          address =
            f.properties.addr_complete ??
            [f.properties.addr_locality, f.properties.addr_street]
              .filter(f => f != null)
              .join(', ');
        } catch (_) {
          address = '';
        }
        try {
          address_link = [f.properties.addr_locality, f.properties.addr_street]
            .filter(f => f != null)
            .join('+');
        } catch (_) {
          address_link = '';
        }
        f = {...f, properties: {...f.properties, ...{address, address_link}}};
        if (filteredArray.length > 0) {
          let p = {...f.properties, ...{svgIcon: icons[filteredArray[0]]}};

          return {...f, ...{properties: p}};
        }
      }
      return f;
    });
    return {...s, ...{features: features}};
  }
  return s;
});
