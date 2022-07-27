import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'webmapp-btn-orientation',
  templateUrl: './btn-orientation.component.html',
  styleUrls: ['./btn-orientation.component.scss'],
})
export class BtnOrientationComponent {
  @Input() degrees: number = 0;
}
