import { EGeojsonGeometryTypes } from './egeojson-geometry-types.enum';

export type IPoint = [number, number, number?];
export type ILineString = Array<IPoint>;
export type IMultiLineString = Array<Array<IPoint>>;
export type IPolygon = Array<Array<IPoint>>;
export type IMultiPolygon = Array<Array<Array<IPoint>>>;

/**
 * Define the supported geometries
 */
export interface IGeojsonGeometry {
  type: EGeojsonGeometryTypes;
  coordinates:
    | IPoint
    | ILineString
    | IMultiLineString
    | IPolygon
    | IMultiPolygon;
}

/**
 * Define the supported properties
 */
export interface IGeojsonProperties {
  [_: string]: any; // allow to work with custom properties when needed
  id: string;
}

/**
 * Define a feature
 */
export interface IGeojsonFeature {
  type: 'Feature';
  properties: IGeojsonProperties;
  geometry: IGeojsonGeometry;
}
