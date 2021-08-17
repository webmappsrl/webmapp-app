import { ILocation } from './location';
import { IRegisterItem } from './track';

export interface WaypointSave extends IRegisterItem {
  position: ILocation;
  displayPosition: ILocation;
  title: string;
  description: string;
  waypointtype: string;
  city: string;
  date: Date;
}
