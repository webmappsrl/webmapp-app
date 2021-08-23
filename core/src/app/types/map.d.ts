import { ComponentRef } from "@angular/core";
import Overlay from "ol/Overlay";
import { ClusterMarkerComponent } from "../components/map/cluster-marker/cluster-marker.component";
import { IGeojsonCluster } from "./model";


export interface ClusterMarker {
  cluster: IGeojsonCluster,
  component: ComponentRef<ClusterMarkerComponent>,
  overlay: Overlay
}

export interface MapMoveEvent {
  boundigBox: number[];
  zoom: number;
}
