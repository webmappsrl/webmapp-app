import { ILocation } from "./location";

export interface WaypointSave {
  position: ILocation;
  displayPosition: ILocation;
  title: string;
  description: string;
  waypointtype: string;
  city: string;
}