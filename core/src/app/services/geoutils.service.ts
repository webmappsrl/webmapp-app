import { Injectable } from '@angular/core';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { getDistance } from 'ol/sphere';

@Injectable({
  providedIn: 'root'
})
export class GeoutilsService {

  private maxCurrentSpeedPoint = 5;

  constructor() { }

  getOdo(track: CGeojsonLineStringFeature) {
    if (track.geometry.coordinates.length >= 2) {
      let res = 0;
      for (let i = 1; i < track.geometry.coordinates.length; i++) {
        res += this.calcDistanceM(track.geometry.coordinates[i], track.geometry.coordinates[i - 1]);
      }
      return res / 1000;
    }
    return 0;
  }

  getTime(track: CGeojsonLineStringFeature) {
    if (track.properties.timestamps.length > 1) {
      return this.calcTimeS(track.properties.timestamps[0], track.properties.timestamps[track.properties.timestamps.length - 1]);
    }
    return 0;
  }

  getCurrentSpeed(track: CGeojsonLineStringFeature) {
    const lenPoints = track.geometry.coordinates.length;
    const lenTimes = track.properties.timestamps.length;
    if (lenPoints >= 2 && lenTimes >= 2) {
      const maxIndex = Math.min(lenPoints, lenTimes, this.maxCurrentSpeedPoint);
      const dist = this.calcDistanceM(track.geometry.coordinates[lenPoints - 1], track.geometry.coordinates[lenPoints - maxIndex]);
      const timeS = this.calcTimeS(track.properties.timestamps[lenTimes - maxIndex], track.properties.timestamps[lenTimes - 1]);
      return (dist / 1000) / (timeS / 3600);
    }
    return 0;
  }

  getAverageSpeed(track: CGeojsonLineStringFeature) {
    const time = (this.getTime(track) / 3600);
    if (time > 0)
      return this.getOdo(track) / time;
    return 0;
  }

  private calcDistanceM(point1, point2): number {
    const p1 = [point1[0], point1[1]];
    const p2 = [point2[0], point2[1]];
    return getDistance(p1, p2);
  }

  private calcTimeS(time1, time2): number {
    const res = (time2 - time1) / 1000;
    return res;
  }

}
