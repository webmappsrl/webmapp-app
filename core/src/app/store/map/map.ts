import {IGeojsonPoiDetailed, IGeojsonProperties} from 'src/app/types/model';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {ILAYER} from 'wm-core/types/config';

export interface IMapRootState {
  currentFilters?: any;
  currentLayer?: ILAYER;
  currentPoi?: IGeojsonPoiDetailed;
  currentPoiId?: number;
  currentPoiIds?: number[];
  currentPoiIndex?: number;
  currentRelatedPoi?: IGeojsonPoiDetailed[];
  currentTrack?: CGeojsonLineStringFeature;
  currentTrackProperties?: IGeojsonProperties;
  goToHome?: boolean;
  nextPoiIndex?: number;
  padding: number[];
  prevPoiIndex?: number;
}
