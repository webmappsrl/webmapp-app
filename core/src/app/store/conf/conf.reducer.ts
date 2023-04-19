import {createReducer, on} from '@ngrx/store';

import {environment} from 'src/environments/environment';
import {loadConfSuccess} from './conf.actions';

export const confFeatureKey = 'conf';
export interface IConfRootState {
  [confFeatureKey]: ICONF;
}
const initialConfState: ICONF = {
  APP: {
    name: 'Webmapp',
    geohubId: environment.geohubId || 1,
    id: 'it.webmapp',
    welcome: 'pages.home.welcome',
  },
  OPTIONS: {
    baseUrl: '-', // deprecated
    startUrl: '/main/map', // deprecated
    privacyUrl: 'webmapp.it/privacy', // deprecated
    passwordRecoveryUrl: '/wp-login.php?action=lostpassword', // deprecated
    hideGlobalMap: false, // deprecated
    addArrowsOverTracks: false, // deprecated
    showTrackRefLabel: false, // deprecated
    useCaiScaleStyle: false, // deprecated
    forceDefaultFeatureColor: false, // deprecated
    useFeatureClassicSelectionStyle: false, // deprecated
    downloadRoutesInWebapp: false, // deprecated
    showPoiListOffline: false, // deprecated
    showHelp: false, // deprecated
    hideDisclaimer: false, // deprecated
    showDifficultyLegend: false, // deprecated
    showEditLink: false, // deprecated
    hideSearch: false, // deprecated
    hideFilters: false, // deprecated
    resetFiltersAtStartup: false, // deprecated
    startFiltersDisabled: false, // deprecated
    showMapViewfinder: false, // deprecated
    highlightMapButton: false, // deprecated
    hideNewsletterInSignup: false, // deprecated
    forceWelcomePagePopup: false, // deprecated
    skipRouteIndexDownload: false, // deprecated
    downloadFullGemoetryRouteIndex: false, // deprecated
    enableTrackAdoption: false, // deprecated
    highlightReadMoreButton: false, // deprecated
    trackRefLabelZoom: 12, // deprecated
    caiScaleStyleZoom: 12, // deprecated
    poiSelectedRadius: 2.5, // deprecated
    poiIconZoom: 15, // deprecated
    poiIconRadius: 1.7, // deprecated
    poiMaxRadius: 1.7, // deprecated
    poiMinRadius: 0.2, // deprecated
    poiMinZoom: 1, // deprecated
    poiLabelMinZoom: 10, // deprecated
    minDynamicOverlayLayersZoom: 12, // deprecated
    clustering: {
      // deprecated
      enable: false, // deprecated
      radius: 70, // deprecated
      highZoomRadius: 70, // deprecated
    },
    showAppDownloadButtons: {
      track: false, // deprecated
      poi: false, // deprecated
      route: false, // deprecated
      all: false, // deprecated
    },
  },
  THEME: {
    primary: '#3880ff',
    secondary: '#0cd1e8',
    tertiary: '#ff0000',
    select: 'rgba(226, 249, 0, 0.6)',
    success: '#10dc60',
    warning: '#ffce00	',
    danger: '#f04141',
    dark: '#000000',
    medium: '#989aa2',
    light: '#ffffff',
    fontXxxlg: '28px',
    fontXxlg: '25px',
    fontXlg: '22px',
    fontLg: '20px',
    fontMd: '17px',
    fontSm: '14px',
    fontXsm: '12px',
    fontFamilyHeader: 'Roboto Slab',
    fontFamilyContent: 'Roboto',
    defaultFeatureColor: '#000000',
    theme: 'webmapp',
  },
  LANGUAGES: {
    default: 'it',
    available: ['en', 'it'],
  },
  AUTH: {
    enable: false,
  },
  MAP: {
    bbox: [4.25, 35.45, 20.19, 49.12],
    defZoom: 5,
    maxZoom: 15,
    minZoom: 5,
    maxStrokeWidth: 6,
    minStrokeWidth: 3,
    tiles: [
      {
        'webmapp': 'https://api.webmapp.it/tiles/{z}/{x}/{y}.png',
      },
    ],
    start_end_icons_show: false,
    start_end_icons_min_zoom: 10,
    ref_on_track_show: false,
    ref_on_track_min_zoom: 10,
    flow_line_quote_show: false,
    flow_line_quote_orange: 800,
    flow_line_quote_red: 1500,
  },
};
export const confReducer = createReducer(
  initialConfState,
  on(loadConfSuccess, (state, {conf}) => {
    localStorage.setItem('appname', state.APP.name);
    return {
      ...conf,
      ...{
        APP: {...state.APP, ...removeNullAttributes(conf.APP)},
        THEME: {...state.THEME, ...conf.THEME},
        OPTIONS: {...state.OPTIONS, ...conf.OPTIONS},
        MAP: {...state.MAP, ...conf.MAP},
        LANGUAGES: {...state.LANGUAGES, ...conf.LANGUAGES},
        AUTH: {...state.AUTH, ...conf.AUTH},
      },
    };
  }),
);

const removeNullAttributes = (attr: {[key: string]: any}): {[key: string]: any} => {
  const res = {};
  Object.keys(attr).forEach(k => {
    if (attr[k] != null) {
      res[k] = attr[k];
    }
  });
  return res;
};
