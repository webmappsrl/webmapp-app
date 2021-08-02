import { ILocation } from './location';
import { RegisterItem } from './track.d.';

export interface WaypointSave extends RegisterItem
{
  position: ILocation;
  displayPosition: ILocation;
  title: string;
  description: string;
  waypointtype: string;
  city: string;
  date: Date;
}