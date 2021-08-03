import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { PhotoItem } from '../services/photo.service';

export interface RegisterItem {

  date: Date;
  key?: string;
}


export interface Track extends RegisterItem {
  geojson?: CGeojsonLineStringFeature;
  photos: PhotoItem[];
  photoKeys: string[];
  title: string;
  description?: string;
  activity: string;
}
