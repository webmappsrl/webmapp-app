import {Location} from './location';
import {Feature, Linestring} from 'geojson';

export interface ISlopeChartHoverElements {
  location: Location;
  track?: Feature<Linestring>;
}

export interface ISlopeChartStyle {
  backgroundColor: string;
}
