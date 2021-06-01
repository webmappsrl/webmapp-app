// import { IFeature } from "./model";

export interface ILocation {
    longitude: number;
    latitude: number;
    altitude?: number;
    accuracy?: number;
    speed?: number;
    bearing?: number;
    timestamp: number;
    getLatLng(): [number, number];
}

export interface IGSState {
    isActive: boolean;
    isLoading: boolean;
    isFollowing: boolean;
    isRotating: boolean;
}

export interface IGSNavigationState {
    // feature: IFeature;
    isActive: boolean;
    isPaused: boolean;
    distance: number;
    time: number;
    currentSpeed: number;
    averageSpeed: number;
}
