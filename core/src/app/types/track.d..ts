import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';

export interface RegisterItem {

  date: Date;
  key?: string;
}


export interface Track extends RegisterItem {
  geojson?: CGeojsonLineStringFeature;
  photos: string[];
  title: string;
  description?: string;
  activity: string;
}
