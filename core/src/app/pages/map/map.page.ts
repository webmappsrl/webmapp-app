import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { Store } from '@ngrx/store';

import {BehaviorSubject, combineLatest, merge, Observable, of} from 'rxjs';
import {catchError, map, shareReplay} from 'rxjs/operators';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {IMapRootState} from 'src/app/store/map/map';
import {setCurrentTrackId} from 'src/app/store/map/map.actions';
import { mapCurrentRelatedPoi, mapCurrentTrack } from 'src/app/store/map/map.selector';
import { ITrackElevationChartHoverElements } from 'src/app/types/track-elevation-charts';

const menuOpenLeft = 0;
const menuCloseLeft = 0;
const initPadding = [0, 0, 0, 0];
const initMenuOpened = true;
const maxWidth = 600;
@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapPage {
  caretOutLine$: Observable<'caret-back-outline' | 'caret-forward-outline'>;
  currentPoi$: Observable<any>;
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiIDToMap$: Observable<number | null>;
  private _currentTrack$: Observable<CGeojsonLineStringFeature> = this._storeMap.select(mapCurrentTrack);
  private _relatedPoi$: Observable<any[]> = this._storeMap.select(mapCurrentRelatedPoi);
  leftPadding$: Observable<number>;
  mapPadding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(initPadding);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(initMenuOpened);
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);
  isMobile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  popupCloseEVT$: EventEmitter<null> = new EventEmitter<null>();

  resizeEVT: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _storeMap: Store<IMapRootState>,
    private _cdr: ChangeDetectorRef,
  ) {
    if (window.innerWidth < maxWidth) {
      this.isMobile$.next(true);
      this.mapPadding$.next(initPadding);
      this.resizeEVT.next(!this.resizeEVT.value);
    }



    this.caretOutLine$ = this.showMenu$.pipe(
      map(showMenu => (showMenu ? 'caret-back-outline' : 'caret-forward-outline')),
    );
    this.leftPadding$ = this.showMenu$.pipe(map(showMenu => (showMenu ? menuOpenLeft : 0)));
    const currentPoi = combineLatest([this.currentPoiID$, this._relatedPoi$]).pipe(
      map(([id, pois]) => {
        const relatedPois = pois.filter(poi => {
          const poiProperties = poi.properties;
          return +poiProperties.id === +id;
        });
        const relatedPoi = relatedPois[0] ?? null;
        return relatedPoi;
      }),
      catchError(e => of(null)),
      shareReplay(),
    );
    this.currentPoi$ = merge(currentPoi, this.popupCloseEVT$);
    this.currentPoiIDToMap$ = merge(this.currentPoiID$, this.popupCloseEVT$).pipe(
      map(val => val ?? -1),
    );
  }

  public next(): void {
    const currentPoiID = this.currentPoiID$.value;
    const poiIDs = this.poiIDs$.value;
    const indexOfCurrentID = poiIDs.indexOf(currentPoiID);
    const nextIndex = (indexOfCurrentID + 1) % poiIDs.length;
    this.setCurrentPoi(poiIDs[nextIndex]);
  }

  public prev(): void {
    const currentPoiID = this.currentPoiID$.value;
    const poiIDs = this.poiIDs$.value;
    const indexOfCurrentID = poiIDs.indexOf(currentPoiID);
    const prevIndex = (indexOfCurrentID - 1) % poiIDs.length;
    this.setCurrentPoi(poiIDs.slice(prevIndex)[0]);
  }

  public selectTrack(trackid: number = -1) {
    this.updateUrl(trackid);
  }

  public setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  public toggleDetails(trackid: number = -1) {
    this.updateUrl(trackid);
  }

  public toggleMenu() {
    this.showMenu$.next(!this.showMenu$.value);
    if (!this.isMobile$.value) {
      this.mapPadding$.next([
        initPadding[0],
        initPadding[1],
        initPadding[2],
        this.showMenu$.value ? menuOpenLeft : menuCloseLeft,
      ]);
    } else {
      this.resizeEVT.next(!this.resizeEVT.value);
    }
  }

  public unselectPOI(): void {
    // this.setCurrentPoi(-1);
    this.popupCloseEVT$.emit(null);
  }
  public setCurrentPoi(id) {
    if (id !== this.currentPoiID$.value) {
      this.currentPoiID$.next(id);
    }
    this._cdr.detectChanges();
  }

  public updateUrl(trackid: number) {
    this._storeMap.dispatch(setCurrentTrackId({currentTrackId: +trackid}))
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: trackid ? trackid : null},
      queryParamsHandling: 'merge',
    });
  }
}
