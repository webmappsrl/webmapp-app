import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
} from '@angular/core';
import {AnimationController, createAnimation} from '@ionic/angular';

@Component({
  selector: 'wm-map-track-details',
  templateUrl: './map-track-details.component.html',
  styleUrls: ['./map-track-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapTrackDetailsComponent implements OnInit {
  constructor(private _elRef: ElementRef, private _animationCtrl: AnimationController) {}

  close(): void {
    this._elRef.nativeElement.classList.remove('opened');
  }

  ngOnInit(): void {}

  open(): void {
    this._elRef.nativeElement.classList.add('opened');
  }
}
