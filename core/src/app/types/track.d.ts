import {StringMap} from '@angular/compiler/src/compiler_facade_interface';
import {CGeojsonLineStringFeature} from '../classes/features/cgeojson-line-string-feature';
import {IPhotoItem} from '../services/photo.service';

export interface IRegisterItem {
  date: Date;
  key?: string;
}

export interface ITrack extends IRegisterItem {
  geojson?: CGeojsonLineStringFeature;
  photos: IPhotoItem[];
  photoKeys: string[];
  storedPhotoKeys?: string[];
  title: string;
  description?: string;
  activity: string;
  id?: string;
}
