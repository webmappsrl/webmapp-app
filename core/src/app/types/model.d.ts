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

export interface iLocalString{
    it?: string;
    en?: string;

}

/**
 * Define the supported properties
 */
export interface IGeojsonProperties {
  [_: string]: any; // allow to work with custom properties when needed
  id: string;

  created_at?: Date;
  updated_at?: Date;
  name?: iLocalString;
  description?: iLocalString;
  excerpt?: iLocalString;
  source_id?: string;
  import_method?: string;
  source?: string;
  distance_comp?: number;
  user_id?: number;
  feature_image?: number;
  audio?: string;
  distance?: number;
  ascent?: number;
  descent?: number;
  ele_from?: number;
  ele_to?: number;
  ele_min?: number;
  ele_max?: number;
  duration_forward?: number;
  duration_backward?: number;
  difficulty?: iLocalString;
  geojson_url?: string;
  kml_url?: string;
  gpx_url?: string;
  image?: IWmImage;
  imageGallery?: IWmImage[];
  taxonomy?: {
    activity?: string[];
    where?: string[];
  };
  duration?: {
    hiking?: {
      forward?: number;
      backward?: number;
    };
  };
}

/**
 * Define a feature
 */
export interface IGeojsonFeature {
  type: 'Feature';
  properties: IGeojsonProperties;
  geometry: IGeojsonGeometry;
}

export interface IWmImage {
  id: number;
  url: string;
  caption: string;
  api_url: string;
  sizes: {
    '108x148': string;
    '108x137': string;
    '225x100': string;
    '118x138': string;
    '108x139': string;
    '118x117': string;
    '335x250': string;
    '400x200': string;
    '1440x500': string;
  };
}
export interface IGeojsonCluster {
  type: 'Feature',
  geometry: IGeojsonGeometry,
  properties: {
    ids: string[], // Id di Ec Track che fanno parte del cluster
    images: string[], // Massimo 3 url di immagini ottimizzate
    bbox: number[] // Extent di tutte le ec track assieme
  }
}
