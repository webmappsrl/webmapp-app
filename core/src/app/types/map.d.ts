import Feature from "ol/Feature";
import Geometry from "ol/geom/Geometry";
import { IGeojsonCluster, IGeojsonPoi } from "./model";

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
  boundigBox: number[];
  zoom: number;
}
