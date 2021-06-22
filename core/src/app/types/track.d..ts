import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';

export interface Track {
  geojson?: CGeojsonLineStringFeature;
  photos: string[];
  title: string;
  description?: string;
  activity: string;
}

