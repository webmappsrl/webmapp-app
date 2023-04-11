import {CGeojsonLineStringFeature} from '../classes/features/cgeojson-line-string-feature';
import {Location} from './location';

export interface ITrackElevationChartStyle {
  backgroundColor: string;
}

export interface ITrackElevationChartHoverElements {
  location: Location;
  track?: CGeojsonLineStringFeature;
}
