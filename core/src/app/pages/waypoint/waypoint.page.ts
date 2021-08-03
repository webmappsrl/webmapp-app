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
  public location: string;
  private position: ILocation;

  private _destroyer: Subject<boolean> = new Subject<boolean>();

  constructor(
    private geolocationService: GeolocationService,
    private modalController: ModalController,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.geolocationService.start();
    this.geolocationService.onLocationChange.pipe(takeUntil(this._destroyer)).subscribe(x => {
      this.onChangeLocation(x);
    });
  }

  ngOnDestroy() {
    this._destroyer.next(true);
  }

  onChangeLocation(pos: ILocation) {
    this.location = `${pos.latitude}, ${pos.longitude}`;
    this.position = pos;
  }

  async save() {
    const modaSuccess = await this.modalController.create({
      component: ModalWaypointSaveComponent,
      componentProps: {
        position: this.position
      }
    });
    await modaSuccess.present();

    this.navController.back();
  }
}
