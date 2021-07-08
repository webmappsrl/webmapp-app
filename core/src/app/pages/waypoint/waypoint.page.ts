import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { ILocation } from 'src/app/types/location';

@Component({
  selector: 'webmapp-waypoint',
  templateUrl: './waypoint.page.html',
  styleUrls: ['./waypoint.page.scss'],
})
export class WaypointPage implements OnInit, OnDestroy {

  public position1: string = 'nome città';
  public position2: string = 'indirizzo';
  public location: string;

  private _destroyer: Subject<boolean> = new Subject<boolean>();

  constructor(
    private geolocationService: GeolocationService
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
    console.log('------- ~ file: waypoint.page.ts ~ line 25 ~ WaypointPage ~ onChangeLocation ~ pos', pos);
    this.location = `${pos.latitude}, ${pos.longitude}`;

  }

  save(){
    
  }
}
