import {ICONF, IHOME, IHOMEOLD, ILAYER, ITHEME} from 'src/app/types/config';
import {createFeatureSelector, createSelector} from '@ngrx/store';

import {confFeatureKey} from './conf.reducer';
import {elasticAll} from '../elastic/elastic.selector';
import {getCSSVariables} from '../../functions/theme';

const confFeature = createFeatureSelector<ICONF>(confFeatureKey);

export const confAPP = createSelector(confFeature, state => state.APP);
export const confLANGUAGES = createSelector(confFeature, state => state.LANGUAGES);
export const confOPTIONS = createSelector(confFeature, state => state.OPTIONS);
export const confAUTH = createSelector(confFeature, state => state.AUTH);
export const confAUTHEnable = createSelector(confAUTH, auth => auth.enable ?? false);
export const confMAP = createSelector(confFeature, state => state.MAP);
export const confTHEME = createSelector(confFeature, state => state.THEME);
export const confMAPLAYERS = createSelector(confMAP, state => state.layers);
export const confPROJECT = createSelector(confFeature, state => state.PROJECT);

export const confTHEMEVariables = createSelector(confTHEME, (theme: ITHEME) =>
  getCSSVariables(theme),
);

export const confHOME = createSelector(confFeature, elasticAll, (state, all) => {
  if (state.HOME != null && state.MAP != null && state.MAP.layers != null) {
    const home: IHOME[] = [];
    state.HOME.forEach(el => {
      if (el.box_type === 'layer') {
        const layers = getLayers([el.layer as number], state.MAP.layers, all);
        home.push({...el, ...{layer: layers[0]}});
      } else {
        home.push(el);
      }
    });

    return home;
  }

  return state.HOME;
});

const getLayers = (layersID: number[], layers: ILAYER[], tracks: IHIT[]): ILAYER[] => {
  return layers
    .filter(l => layersID.indexOf(+l.id) > -1)
    .map(el => {
      if (tracks != null) {
        const tracksObj: {[layerID: number]: IHIT[]} = {};
        tracks.forEach(track => {
          track.layers.forEach(l => {
            if (layersID.indexOf(l) > -1) {
              tracksObj[l] = tracksObj[l] != null ? [...tracksObj[l], track] : [track];
            }
          });
        });
        return {...el, ...{tracks: tracksObj}};
      }
      return el;
    });
};
