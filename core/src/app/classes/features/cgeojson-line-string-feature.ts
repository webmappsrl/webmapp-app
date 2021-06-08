import { EGeojsonGeometryTypes } from 'src/app/types/egeojson-geometry-types.enum';
import { ILocation } from 'src/app/types/location';
import { IPoint, ILineString } from 'src/app/types/model';
import { CGeojsonFeature } from './cgeojson-feature';

export class CGeojsonLineStringFeature extends CGeojsonFeature {
  constructor() {
    super();
  }

  /**
   * Add a new set of coordinates to the geometry
   *
   * @param location the new coordinates to add
   */
  addCoordinates(location: ILocation): void {
    if (!this._geometry) this._initializeGeometry();
    const newPoint: IPoint = [location.longitude, location.latitude];
    if (location.altitude) newPoint.push(location.altitude);
    (this._geometry.coordinates as ILineString).push(newPoint);
  }

  /**
   * Initialize the geometry field
   */
  private _initializeGeometry() {
    this._geometry = {
      type: EGeojsonGeometryTypes.LINE_STRING,
      coordinates: [],
    };
  }
}
