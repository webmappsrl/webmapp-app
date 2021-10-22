import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IGeojsonFeature, IGeojsonPoiDetailed } from '../types/model';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  public showPhotos = new BehaviorSubject({
    showingPhotos: false,
    image_gallery: [],
    photoIndex: 0
  })

  private _route: IGeojsonFeature;

  private _filters: any[];

  private _relatedPois: IGeojsonPoiDetailed[];
  private _selectedPoiId: number;

  public set route(val: IGeojsonFeature) {
    this._route = val;
  }
  public get route(): IGeojsonFeature {
    return this._route;
  }

  private _isSelectedMapTrack: boolean;
  public set isSelectedMapTrack(val: boolean) {
    this._isSelectedMapTrack = val;
  }
  public get isSelectedMapTrack(): boolean {
    return this._isSelectedMapTrack;
  }


  private _showingRouteDetails: boolean;
  public set showingRouteDetails(val: boolean) {
    this._showingRouteDetails = val;
  }
  public get showingRouteDetails(): boolean {
    return this._showingRouteDetails;
  }


  private _showingMapResults: boolean;
  public set showingMapResults(val: boolean) {
    this._showingMapResults = val;
  }
  public get showingMapResults(): boolean {
    return this._showingMapResults;
  }




  constructor() { }

  public setPois(relatedPois: IGeojsonPoiDetailed[], id: number) {
    this._relatedPois = relatedPois;
    this._selectedPoiId = id;
  }

  public getRelatedPois(): IGeojsonPoiDetailed[] {
    return this._relatedPois;
  }
  public getSelectedPoiId(): number {
    return this._selectedPoiId;
  }

  public addFilter(filter) {
    // TODO set search filters
    this._filters.push(filter);
  }

  public removeFilter(filter) {
    // TODO set search filters
    const idx = this._filters.find(x => x == filter);
    if (idx >= 0) {
      this._filters.splice(idx, 1);
    }
  }

  public getFilters() {
    // TODO set search filters
    return this._filters;
  }

  public showPhoto(showingPhotos: boolean, image_gallery: any[], photoIndex: number) {
    this.showPhotos.next({ showingPhotos, image_gallery, photoIndex });
  }
}
