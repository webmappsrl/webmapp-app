import {IGeojsonPoiDetailed, IGeojsonProperties} from 'src/app/types/model';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {ILAYER} from 'src/app/types/config';

export interface IMapRootState {
  currentLayer?: ILAYER;
  currentFilters?: any;
  currentPoi?: IGeojsonPoiDetailed;
  currentPoiId?: number;
  currentPoiIds?: number[];
  currentPoiIndex?: number;
  currentRelatedPoi?: IGeojsonPoiDetailed[];
  currentTrack?: CGeojsonLineStringFeature;
  currentTrackProperties?: IGeojsonProperties;
  nextPoiIndex?: number;
  prevPoiIndex?: number;
  padding: number[];
}
