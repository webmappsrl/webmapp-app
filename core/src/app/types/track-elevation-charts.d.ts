import {Location} from './location';
import {Feature, LineString} from 'geojson';

export interface ITrackElevationChartHoverElements {
  location: Location;
  track?: Feature<LineString>;
}

export interface ITrackElevationChartStyle {
  backgroundColor: string;
}
