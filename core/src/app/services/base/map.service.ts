import {Injectable} from '@angular/core';
import {Location} from 'src/app/types/location';
import {Coordinate} from 'ol/coordinate';
import {Extent} from 'ol/extent';
import {transform, transformExtent} from 'ol/proj';
import {getDistance} from 'ol/sphere.js'; // Throws problems importing normally

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor() {}

  /**
   * Transform a set of [lon, lat](EPSG:4326) coordinates in EPSG:3857
   *
   * @param {Coordinate} coordinates the [lon, lat](EPSG:4326) coordinates
   *
   * @returns {Coordinate} the coordinates [lon, lat](EPSG:4326)
   */
  coordsFromLonLat(coordinates: Coordinate): Coordinate {
    return transform(coordinates, 'EPSG:4326', 'EPSG:3857');
  }

  /**
   * Transform a set of EPSG:3857 coordinates in [lon, lat](EPSG:4326)
   *
   * @param {Coordinate} coordinates the EPSG:3857 coordinates
   *
   * @returns {Coordinate} the coordinates [lon, lat](EPSG:4326)
   */
  coordsToLonLat(coordinates: Coordinate): Coordinate {
    return transform(coordinates, 'EPSG:3857', 'EPSG:4326');
  }

  /**
   * Transform a set of [minLon, minLat, maxLon, maxLat](EPSG:4326) coordinates in EPSG:3857
   *
   * @param {Extent} extent the [minLon, minLat, maxLon, maxLat](EPSG:4326) extent
   *
   * @returns {Extent} the extent [minLon, minLat, maxLon, maxLat](EPSG:4326)
   */
  extentFromLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
  }

  /**
   * Transform a set of EPSG:3857 extent in [minLon, minLat, maxLon, maxLat](EPSG:4326)
   *
   * @param {Extent} extent the EPSG:3857 extent
   *
   * @returns {Extent} the extent [minLon, minLat, maxLon, maxLat](EPSG:4326)
   */
  extentToLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
  }

  /**
   * Return the distance in meters between two locations
   *
   * @param point1 the first location
   * @param point2 the second location
   */
  getDistanceBetweenPoints(point1: Location, point2: Location): number {
    let R: number = 6371e3;
    let lat1: number = (point1.latitude * Math.PI) / 180;
    let lat2: number = (point2.latitude * Math.PI) / 180;
    let lon1: number = (point1.longitude * Math.PI) / 180;
    let lon2: number = (point2.longitude * Math.PI) / 180;
    let dlat: number = lat2 - lat1;
    let dlon: number = lon2 - lon1;

    let a: number =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
    let c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Return a value for the distance between the two point using a screen-fixed unit
   *
   * @param {Location} point1 the first location
   * @param {Location} point2 the second location
   * @param {number} resolution the view resolution
   *
   * @returns {number}
   */
  getFixedDistance(point1: Location, point2: Location, resolution: number): number {
    return (
      getDistance([point1.longitude, point1.latitude], [point2.longitude, point2.latitude]) /
      resolution
    );
  }
}
