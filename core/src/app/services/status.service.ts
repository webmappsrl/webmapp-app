import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IGeojsonPoiDetailed} from '../types/model';
import {Feature, LineString} from 'geojson';
@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private _filters: any[];
  private _isSelectedMapTrack: boolean;
  private _relatedPois: IGeojsonPoiDetailed[];
  private _route: Feature<LineString>;
  private _selectedPoiId: number;
  private _showingMapResults: boolean;
  private _showingRouteDetails: boolean;

  public get isSelectedMapTrack(): boolean {
    return this._isSelectedMapTrack;
  }

  public set isSelectedMapTrack(val: boolean) {
    this._isSelectedMapTrack = val;
  }

  public get route(): Feature<LineString> {
    return this._route;
  }

  public set route(val: Feature<LineString>) {
    this._route = val;
  }

  public get showingMapResults(): boolean {
    return this._showingMapResults;
  }

  public set showingMapResults(val: boolean) {
    this._showingMapResults = val;
  }

  public get showingRouteDetails(): boolean {
    return this._showingRouteDetails;
  }

  public set showingRouteDetails(val: boolean) {
    this._showingRouteDetails = val;
  }

  public showPhotos = new BehaviorSubject({
    showingPhotos: false,
    image_gallery: [],
    photoIndex: 0,
  });

  constructor() {}

  public addFilter(filter) {
    // TODO set search filters
    this._filters.push(filter);
  }

  public getFilters() {
    // TODO set search filters
    return this._filters;
  }

  public getRelatedPois(): IGeojsonPoiDetailed[] {
    return this._relatedPois;
  }

  public getSelectedPoiId(): number {
    return this._selectedPoiId;
  }

  public removeFilter(filter) {
    // TODO set search filters
    const idx = this._filters.find(x => x == filter);
    if (idx >= 0) {
      this._filters.splice(idx, 1);
    }
  }

  public setPois(relatedPois: IGeojsonPoiDetailed[], id: number) {
    this._relatedPois = relatedPois;
    this._selectedPoiId = id;
  }

  public showPhoto(showingPhotos: boolean, image_gallery: any[], photoIndex: number) {
    this.showPhotos.next({showingPhotos, image_gallery, photoIndex});
  }
}
