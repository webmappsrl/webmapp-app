import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { ILocation } from 'src/app/types/location';
import { ModalWaypointSaveComponent } from './modal-waypoint-save/modal-waypoint-save.component';

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

  private _destroyer: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _geolocationService: GeolocationService,
    private _modalController: ModalController,
    private _navController: NavController
  ) {}

  ngOnInit() {
    this._geolocationService.start();
    this._geolocationService.onLocationChange
      .pipe(takeUntil(this._destroyer))
      .subscribe((x) => {
        this.onChangeLocation(x);
      });
  }

  ngOnDestroy() {
    this._destroyer.next(true);
  }

  onChangeLocation(location: ILocation) {
    this.locationString = `${location.latitude}, ${location.longitude}`;
    this.location = location;
  }

  async save() {
    const modaSuccess = await this._modalController.create({
      component: ModalWaypointSaveComponent,
      componentProps: {
        position: this.location,
      },
    });
    await modaSuccess.present();

    this._navController.back();
  }
}
