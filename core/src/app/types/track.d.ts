import {StringMap} from '@angular/compiler/src/compiler_facade_interface';
import {CGeojsonLineStringFeature} from '../classes/features/cgeojson-line-string-feature';
import {IPhotoItem} from '../services/photo.service';

export interface IRegisterItem {
  date: Date;
  key?: string;
}

export interface ITrack extends IRegisterItem {
  activity: string;
  description?: string;
  geojson?: CGeojsonLineStringFeature;
  id?: string;
  metadata?: any;
  photoKeys: string[];
  photos: IPhotoItem[];
  rawData?: any;
  storedPhotoKeys?: string[];
  title: string;
}
