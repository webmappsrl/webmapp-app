import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ICONF, IHOME, IHOMEOLD, ILAYER, ITHEME} from 'src/app/types/config';
import {getCSSVariables} from '../../functions/theme';
import {elasticAll} from '../elastic/elastic.selector';
import {confFeatureKey} from './conf.reducer';

const confFeature = createFeatureSelector<ICONF>(confFeatureKey);

export const confAPP = createSelector(confFeature, state => state.APP);
export const confLANGUAGES = createSelector(confFeature, state => state.LANGUAGES);
export const confOPTIONS = createSelector(confFeature, state => state.OPTIONS);
export const confAUTH = createSelector(confFeature, state => state.AUTH);
export const confAUTHEnable = createSelector(confAUTH, auth => auth.enable ?? false);
export const confMAP = createSelector(confFeature, state => state.MAP);
export const confTHEME = createSelector(confFeature, state => state.THEME);
export const confMAPLAYERS = createSelector(confMAP, state => state.layers);

export const confTHEMEVariables = createSelector(confTHEME, (theme: ITHEME) =>
  getCSSVariables(theme),
);

export const confHOME = createSelector(confFeature, elasticAll, (state, all) => {
  if (state.HOME != null && state.MAP != null && state.MAP.layers != null) {
    const home: IHOME[] = [];
    (state.HOME as unknown as IHOMEOLD[]).forEach(el => {
      if (el.terms != null) {
        const layers = getLayers(el.terms, state.MAP.layers, all);
        const newLayer: IHOME = {
          box_type: 'layer',
          title: el.title,
          layer: layers[0],
        };
        home.push(newLayer);
      }
      if (el.view === 'title') {
        const newTitle: IHOME = {
          box_type: 'title',
          title: el.title,
        };
        home.push(newTitle);
      }
    });
    home.push({
      box_type: 'base',
      title: 'itinerari',
      items: [
        {
          title: 'T3 Poggio Raso in bici',
          image_url: 'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/112.jpg',
          track_id: 27,
        },
        {
          title: 'T2 Cannelle in bici',
          image_url: 'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/107.jpg',
          track_id: 26,
        },
        {
          title: 'Alberese - San Rabano',
          image_url: 'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/104.jpg',
          track_id: 25,
        },
      ],
    } as any);
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
