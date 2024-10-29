import {EGeojsonGeometryTypes} from './egeojson-geometry-types.enum';
import {FeatureCollection, GeoJsonProperties} from 'geojson';

export type ILineString = Array<IPoint>;
export type IMultiLineString = Array<Array<IPoint>>;
export type IMultiPolygon = Array<Array<Array<IPoint>>>;
export type IPoint = [number, number, number?];
export type IPolygon = Array<Array<IPoint>>;

export interface IGeojsonCluster extends IGeojsonGeneric {
  properties: {
    ids: number[]; // Id di Ec Track che fanno parte del cluster
    images: string[]; // Massimo 3 url di immagini ottimizzate
    bbox: number[]; // Extent di tutte le ec track assieme
  };
  type: 'Feature';
}

export interface IGeojsonClusterApiResponse {
  features: IGeojsonCluster[];
}

export interface IGeojsonFeatureDownloaded extends IGeojsonFeature {
  size: number;
}

export interface IGeojsonGeneric {
  geometry: IGeojsonGeometry;
  properties: any;
  type: string;
}

export interface IGeojsonPoi extends IGeojsonGeneric {
  isSmall?: boolean;
  properties: {
    id: number; // Id del poi
    image: string; // url image
  };
  type: 'Point';
}

export interface IGeojsonPoiDetailed extends IGeojsonPoi {
  properties: {
    id: number; // Id del poi
    image: string; // url image
    images: string[]; // url images
    name: iLocalString;
    description: iLocalString;
    image_gallery?: any[];
    email?: string;
    phone?: string;
    address?: string;
    url?: string;
    audio?: {[lang: string]: string};
  };
}

export interface IWmImage {
  api_url: string;
  base64?: string;
  base64sizes?: {
    '108x148': string;
    '108x137': string;
    '225x100': string;
    '250x150': string;
    '118x138': string;
    '108x139': string;
    '118x117': string;
    '335x250': string;
    '400x200': string;
    '1440x500': string;
  };
  caption: string;
  id: number;
  sizes: {
    '108x148': string;
    '108x137': string;
    '225x100': string;
    '250x150': string;
    '118x138': string;
    '108x139': string;
    '118x117': string;
    '335x250': string;
    '400x200': string;
    '1440x500': string;
  };
  url: string;
}

export interface WhereTaxonomy {
  admin_level: number;
  created_at: Date;
  description: string;
  id: 9;
  import_method: string;
  name: iLocalString;
  source_id: number;
  updated_at: Date;

  // excerpt: null,
  // source: null,
  // user_id: null,
  // identifier: toscana,
  // icon: null,
  // color: null,
  // zindex: null,
  // feature_image: null,
  // stroke_width: null,
  // stroke_opacity: null,
  // line_dash: null,
  // min_visible_zoom: null,
  // min_size_zoom: null,
  // min_size: null,
  // max_size: null,
  // icon_zoom: null,
  // icon_size: null
}

/**
 * Define the supported properties
 */
export interface WmGeojsonProperties extends GeoJsonProperties {
  ascent?: number;
  audio?: {[lang: string]: string};
  created_at?: Date;
  descent?: number;
  description?: iLocalString;
  difficulty?: iLocalString;
  distance?: number;
  distance_comp?: number;
  duration?: {
    hiking?: {
      forward?: number;
      backward?: number;
    };
  };
  duration_backward?: number;
  duration_forward?: number;
  ele_from?: number;
  ele_max?: number;
  ele_min?: number;
  ele_to?: number;
  excerpt?: iLocalString;
  feature_image?: any;
  geojson_url?: string;
  gpx_url?: string;
  // allow to work with custom properties when needed
  id: number;
  image?: IWmImage;
  image_gallery?: IWmImage[];
  import_method?: string;
  kml_url?: string;
  mbtiles?: string[];
  name?: iLocalString;
  source?: string;
  source_id?: string;
  taxonomy?: {
    activity?: any[];
    where?: string[];
    poi_type?: any;
  };
  updated_at?: Date;
  user_id?: number;

  [_: string]: any;
}

export interface iLocalString {
  en?: string;
  it?: string;
}
