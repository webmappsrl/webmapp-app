import { ComponentRef } from "@angular/core";
import Feature from "ol/Feature";
import Geometry from "ol/geom/Geometry";
import Icon from "ol/style/Icon";
import { ClusterMarkerComponent } from "../components/map/cluster-marker/cluster-marker.component";
import { IGeojsonCluster } from "./model";


export interface ClusterMarker {
  cluster: IGeojsonCluster,
  //component: ComponentRef<ClusterMarkerComponent>,
  icon: Feature<Geometry>,
  id: string
}

export interface MapMoveEvent {
  boundigBox: number[];
  zoom: number;
}
