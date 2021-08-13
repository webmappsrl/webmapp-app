import { Injectable } from '@angular/core';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { transform, transformExtent } from 'ol/proj';
import { getDistance } from 'ol/sphere.js'; // Throws problems importing normally
import { ILocation } from 'src/app/types/location';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor() {}

  /**
   * Return a value for the distance between the two point using a screen-fixed unit
   *
   * @param {ILocation} point1 the first location
   * @param {ILocation} point2 the second location
   * @param {number} resolution the view resolution
   *
   * @returns {number}
   */
  getFixedDistance(
    point1: ILocation,
    point2: ILocation,
    resolution: number
  ): number {
    return (
      getDistance(
        [point1.longitude, point1.latitude],
        [point2.longitude, point2.latitude]
      ) / resolution
    );
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
   * Transform a set of [minLon, minLat, maxLon, maxLat](EPSG:4326) coordinates in EPSG:3857
   *
   * @param {Extent} extent the [minLon, minLat, maxLon, maxLat](EPSG:4326) extent
   *
   * @returns {Extent} the extent [minLon, minLat, maxLon, maxLat](EPSG:4326)
   */
  extentFromLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
  }
}
