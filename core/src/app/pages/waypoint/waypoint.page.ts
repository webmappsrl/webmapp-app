import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';

import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, map, switchMap, take, takeUntil} from 'rxjs/operators';

import {GeolocationService} from '@wm-core/services/geolocation.service';
import {NominatimService} from 'src/app/services/nominatim.service';
import GeoJSON from 'ol/format/GeoJSON.js';
import {ModalWaypointSaveComponent} from './modal-waypoint-save/modal-waypoint-save.component';
import {Location} from 'src/app/types/location';
import {Store} from '@ngrx/store';
import {confMAP, confPOIFORMS} from '@wm-core/store/conf/conf.selector';
import {fromLonLat} from 'ol/proj';
import {Point} from 'ol/geom';
import {Collection, Feature as OlFeature} from 'ol';
import {WmMapComponent} from '@map-core/components';

@Component({
  selector: 'webmapp-waypoint',
  templateUrl: './waypoint.page.html',
  styleUrls: ['./waypoint.page.scss'],
})
export class WaypointPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(WmMapComponent) mapCmp: WmMapComponent;

  private _destroyer: Subject<boolean> = new Subject<boolean>();
  point = new Point([]);
  confMap$: Observable<any> = this._store.select(confMAP);
  confPOIFORMS$: Observable<any[]> = this._store.select(confPOIFORMS);
  location: Location;
  locationString$: BehaviorSubject<string> = new BehaviorSubject(null);
  nominatimObj$: BehaviorSubject<any> = new BehaviorSubject(null);
  geojson$: BehaviorSubject<any> = new BehaviorSubject(null);
  currentPosition$: Observable<Location> = this._geolocationSvc.onLocationChange;
  wmMapHitMapUrl$: Observable<string | null> = this.confMap$.pipe(map(conf => conf?.hitMapUrl));
  constructor(
    private _geolocationSvc: GeolocationService,
    private _nominatimSvc: NominatimService,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
    private _store: Store,
  ) {}
  ngOnInit(): void {
    this._geolocationSvc.startNavigation();
    this.currentPosition$.pipe(takeUntil(this._destroyer)).subscribe(loc => {
      this.onChangeLocation(loc);
    });
  }

  ngOnDestroy(): void {
    this._destroyer.next(true);
  }

  onChangeLocation(location: Location): void {
    this.location = location;
    const coordinate = fromLonLat([location.longitude, location.latitude]);
    const point = new Point(coordinate);
    const featureCollection = new Collection([new OlFeature({geometry: point})]);
    const geojson = new GeoJSON({featureProjection: 'EPSG:3857'}).writeFeaturesObject(
      featureCollection.getArray(),
    );
    this.geojson$.next(geojson);
    const locationString = `${location.latitude}, ${location.longitude}`;
    this.locationString$.next(locationString);
    this._nominatimSvc
      .getFromPosition(location)
      .pipe(takeUntil(this._destroyer))
      .subscribe(v => this.nominatimObj$.next(v));
  }

  async save(): Promise<void> {
    const modaSuccess = await this._modalCtrl.create({
      component: ModalWaypointSaveComponent,
      componentProps: {
        position: this.location,
        nominatim: this.nominatimObj$.value,
        acquisitionFORM$: this.confPOIFORMS$,
      },
    });

    await modaSuccess.present();
    this._navCtrl.back();
  }

  ngAfterViewInit() {
    this.mapCmp.isInit$ //TODO: use only for carg
      .pipe(
        filter(isInit => isInit),
        take(1),
        switchMap(() => this.wmMapHitMapUrl$),
        filter(url => url != null),
      )
      .subscribe(_ => {
        this.mapCmp.addTileLayer('https://tiles.webmapp.it/carg/{z}/{x}/{y}.png');
        const currentExtent = this.mapCmp.map.getView().calculateExtent();
        this.mapCmp.fitView(currentExtent, {maxZoom: 14});
        this.mapCmp.map.updateSize();
      });
  }
}
