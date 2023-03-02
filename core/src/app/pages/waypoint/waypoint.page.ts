import {NominatimService} from './../../services/nominatim.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';
import {BehaviorSubject, Subject} from 'rxjs';
import {distinctUntilChanged, take, takeUntil} from 'rxjs/operators';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {ILocation} from 'src/app/types/location';
import {ModalWaypointSaveComponent} from './modal-waypoint-save/modal-waypoint-save.component';

@Component({
  selector: 'webmapp-waypoint',
  templateUrl: './waypoint.page.html',
  styleUrls: ['./waypoint.page.scss'],
})
export class WaypointPage implements OnInit, OnDestroy {
  public position1: string = 'nome città';
  public position2: string = 'indirizzo';
  public locationString: string;
  public location: ILocation;
  nominatimObj$: BehaviorSubject<any> = new BehaviorSubject(null);

  private _destroyer: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _geolocationService: GeolocationService,
    private _modalController: ModalController,
    private _navController: NavController,
    private _nominatimSvc: NominatimService,
  ) {}

  ngOnInit() {
    this._geolocationService.start();
    this._geolocationService.onLocationChange
      .pipe(
        distinctUntilChanged((a, b) => a.latitude === b.latitude && a.longitude === b.longitude),
        takeUntil(this._destroyer),
      )
      .subscribe(x => {
        this.onChangeLocation(x);
      });
  }

  ngOnDestroy() {
    this._destroyer.next(true);
  }

  onChangeLocation(location: ILocation) {
    this.locationString = `${location.latitude}, ${location.longitude}`;
    this.location = location;
    this._nominatimSvc
      .getFromPosition(location)
      .pipe(takeUntil(this._destroyer))
      .subscribe(v => this.nominatimObj$.next(v));
  }

  async save() {
    const modaSuccess = await this._modalController.create({
      component: ModalWaypointSaveComponent,
      componentProps: {
        position: this.location,
        nominatim: this.nominatimObj$.value,
      },
    });
    await modaSuccess.present();

    this._navController.back();
  }
}
