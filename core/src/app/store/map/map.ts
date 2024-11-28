import {IGeojsonPoiDetailed} from 'src/app/types/model';
import {Feature, LineString, GeoJsonProperties} from 'geojson';
import {ILAYER} from 'wm-core/types/config';
export interface IMapRootState {
  currentFilters?: any;
  currentLayer?: ILAYER;
  currentPoi?: IGeojsonPoiDetailed;
  currentPoiId?: number;
  currentPoiIds?: number[];
  currentPoiIndex?: number;
  currentRelatedPoi?: IGeojsonPoiDetailed[];
  currentTrack?: Feature<LineString>;
  currentTrackProperties?: GeoJsonProperties;
  goToHome?: boolean;
  nextPoiIndex?: number;
  padding: number[];
  prevPoiIndex?: number;
}
