export interface IGeolocationServiceState {
  isActive: boolean;
  isLoading: boolean;
  isPaused: boolean;
  isRecording: boolean;
}

export interface Location {
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  bearing?: number;
  latitude: number;
  longitude: number;
  simulated?: boolean;
  speed?: number;
  time?: number;
}
