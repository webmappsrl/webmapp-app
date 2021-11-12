import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'webmapp-btn-orientation',
  templateUrl: './btn-orientation.component.html',
  styleUrls: ['./btn-orientation.component.scss'],
})
export class BtnOrientationComponent implements OnInit {

  // @Output() click: EventEmitter<any> = new EventEmitter();

  @Input('degrees')  angle: number = 0;

  constructor() { }

  ngOnInit() {}

  orientNorth(ev){

  }

}
