import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { ILocation } from 'src/app/types/location';

@Component({
  selector: 'webmapp-modal-waypoint-save',
  templateUrl: './modal-waypoint-save.component.html',
  styleUrls: ['./modal-waypoint-save.component.scss'],
})
export class ModalWaypointSaveComponent implements OnInit {

  public position: ILocation;
  public displayPosition: ILocation;
  public title: string;
  public description: string;
  public waypointtype: string;

  public positionString: string;
  public positionCity: string = "città";

  constructor() { }

  ngOnInit() {
    console.log('------- ~ line 18 ~ ModalWaypointSaveComponent ~ ngOnInit ~ this.position', this.position);
    this.positionString = `${this.position.latitude}, ${this.position.longitude}`;
    setTimeout(() => {
      this.displayPosition = this.position;
    }, 2000);
  }

  save() { }

  isValid() {
    return this.title && this.waypointtype;

  }
}
