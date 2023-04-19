import {Location} from 'src/app/types/location';

export class CLocation implements Location {
  accuracy?: number = null;
  altitude?: number = null;
  altitudeAccuracy?: number = null;
  bearing?: number = null;
  latitude: number = null;
  longitude: number = null;
  simulated?: boolean = null;
  speed?: number = null;
  time?: number = null;

  constructor(location: Location) {
    this.accuracy = location.accuracy;
    this.altitude = location.altitude;
    this.altitudeAccuracy = location.altitudeAccuracy;
    this.bearing = location.bearing;
    this.latitude = location.latitude;
    this.longitude = location.longitude;
    this.simulated = location.simulated;
    this.speed = location.speed;
    this.time = location.time;
  }

  getLatLng(): [number, number] {
    return [this.latitude, this.longitude];
  }
}
