import Feature from "ol/Feature";
import Geometry from "ol/geom/Geometry";
import { IGeojsonCluster, IGeojsonPoi, iLocalString } from "./model";

export interface iMarker{
  icon: Feature<Geometry>,
  id: string
}
export interface ClusterMarker extends iMarker{
  cluster: IGeojsonCluster
}

export interface PoiMarker  extends iMarker{
  poi: IGeojsonPoi
}

export interface MapMoveEvent {
  boundingbox: number[];
  zoom: number;
}

export interface PlaceResult {
  type: 'Point';
  properties: {
    id: number; // Id  poi
    image: string; // url image 
    boundingbox: number[];   
    name: iLocalString;
    desription: iLocalString;
  };
}
export interface placeResult {
  type: 'Point';
  properties: {
    boundingbox: number[];   
    name: iLocalString;
  };
}
export interface TrackResult {
  type: 'Point';
  properties: {
    id: string; // Id track
    image: string; // url image  
    name: iLocalString;
    desription: iLocalString;
  };
}