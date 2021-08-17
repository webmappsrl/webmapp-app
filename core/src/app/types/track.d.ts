import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { IPhotoItem } from '../services/photo.service';

export interface IRegisterItem {
  date: Date;
  key?: string;
}

export interface ITrack extends IRegisterItem {
  geojson?: CGeojsonLineStringFeature;
  photos: IPhotoItem[];
  photoKeys: string[];
  title: string;
  description?: string;
  activity: string;
}
