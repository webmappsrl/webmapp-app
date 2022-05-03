import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {IGeojsonPoiDetailed, IGeojsonProperties} from 'src/app/types/model';

export interface IMapRootState {
  currentLayer?: ILAYER;
  currentTrack?: CGeojsonLineStringFeature;
  currentTrackProperties?: IGeojsonProperties;
  currentRelatedPoi?: IGeojsonPoiDetailed[];
  currentPoiIds?: number[];
  currentPoiId?: number;
  currentPoiIndex?: number;
  currentPoi?: IGeojsonPoiDetailed;
  nextPoiIndex?: number;
  prevPoiIndex?: number;
}
