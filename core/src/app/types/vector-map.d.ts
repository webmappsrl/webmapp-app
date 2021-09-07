import { EVectorLayerType, EVectorSourceType } from './evector-map-enums.enum';

export interface IVectorMapSource {
  type: EVectorSourceType;
  url?: string;
  tiles?: Array<string>;
  minzoom?: number;
  maxzoom?: number;
}

export interface IVectorMapStyle {
  version: number;
  name: string;
  metadata: any;
  center: Array<number>;
  zoom: number;
  bearing: number;
  pitch: number;
  sources: {
    [sourceId: string]: IVectorMapSource;
  };
  sprite: string;
  glyphs: string;
  layers: Array<{
    id: string;
    type: EVectorLayerType;
    source: string;
    'source-layer': string;
    metadata: any;
    minzoom: number;
    filter: any;
    layout: {
      visibility: 'visible' | 'none';
      'line-cap': 'round';
      'line-join': 'round';
    };
    paint: {
      'line-color': string;
      'line-dasharray': Array<number>;
      'line-width': {
        base: number;
        stops: Array<Array<number>>;
      };
      'line-opacity': number;
      'fill-color': string;
      // | {
      //     base: number;
      //     stops: Array<Array<number>>;
      //   };
      'fill-opacity': number;
      'fill-translate': Array<number>;
      'fill-outline-color': string;
      'fill-pattern': string;
      'fill-antialias': boolean;
    };
  }>;
  id: 'bright';
}

export interface IVectorMapSourceJson {
  name: string;
  description: string;
  legend: string;
  attribution: string;
  type: 'baselayer';
  version: string;
  format: string;
  format_arguments: string;
  minzoom: number;
  maxzoom: number;
  bounds: Array<number>;
  scale: string;
  profile: 'mercator';
  scheme: 'xyz';
  generator: string;
  basename: string;
  tiles: Array<string>;
  tilejson: string;
  grids: Array<string>;
  vector_layers: Array<{
    id: string;
    description: string;
    minzoom: number;
    maxzoom: number;
    fields: any;
  }>;
}
