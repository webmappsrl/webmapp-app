import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';

import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, takeUntil} from 'rxjs/operators';

import {GeolocationService} from 'src/app/services/geolocation.service';
import {NominatimService} from 'src/app/services/nominatim.service';

import {ModalWaypointSaveComponent} from './modal-waypoint-save/modal-waypoint-save.component';
import {Location} from 'src/app/types/location';
import {Store} from '@ngrx/store';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {ActivatedRoute, Router} from '@angular/router';
import {confMAP} from 'wm-core/store/conf/conf.selector';

@Component({
  selector: 'webmapp-waypoint',
  templateUrl: './waypoint.page.html',
  styleUrls: ['./waypoint.page.scss'],
})
export class WaypointPage implements OnInit, OnDestroy {
  private _destroyer: Subject<boolean> = new Subject<boolean>();

  confMap$: Observable<any> = this._store.select(confMAP);
  currentTrack$: BehaviorSubject<CGeojsonLineStringFeature | null> = new BehaviorSubject(null);
  location: Location;
  locationString: string;
  nominatimObj$: BehaviorSubject<any> = new BehaviorSubject(null);
  position1: string = 'nome città';
  position2: string = 'indirizzo';

  constructor(
    private _geolocationSvc: GeolocationService,
    private _nominatimSvc: NominatimService,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
    private _store: Store,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
    this._route.queryParams.subscribe(params => {
      if (this._router.getCurrentNavigation().extras.state) {
        const state = this._router.getCurrentNavigation().extras.state;
        if (state.currentTrack) {
          this.currentTrack$.next(state.currentTrack);
        }
      }
    });
  }

  ngOnInit(): void {
    this._geolocationSvc.start();
    this._geolocationSvc.onLocationChange
      .pipe(
        distinctUntilChanged((a, b) => a.latitude === b.latitude && a.longitude === b.longitude),
        takeUntil(this._destroyer),
      )
      .subscribe(x => {
        this.onChangeLocation(x);
      });
  }

  ngOnDestroy(): void {
    this._destroyer.next(true);
  }

  onChangeLocation(location: Location): void {
    this.locationString = `${location.latitude}, ${location.longitude}`;
    this.location = location;
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
      },
    });

    await modaSuccess.present();
    this._navCtrl.back();
  }
}
