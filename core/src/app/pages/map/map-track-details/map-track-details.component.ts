import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Animation, AnimationController, Gesture, GestureController, Platform} from '@ionic/angular';

@Component({
  selector: 'wm-map-track-details',
  templateUrl: './map-track-details.component.html',
  styleUrls: ['./map-track-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapTrackDetailsComponent implements AfterViewInit {
  private _animationClose: Animation;
  private _animationNone: Animation;
  private _gesture: Gesture;
  private _started: boolean = false;
  private _initialStep: number = 1;

  height = 700;
  maxInfoheight = 850;
  minInfoheight = 350;
  stepStatus = 1;
  isNone = false;
  @ViewChild('dragHandleIcon') dragHandleIcon: ElementRef;
  constructor(
    private _elRef: ElementRef,
    private _platform: Platform,
    private _animationCtrl: AnimationController,
    private _gestureCtrl: GestureController,
  ) {}

  close(): void {
    this.isNone = false;
    this._animationNone.progressEnd(1, 0.1);
  }

  handleClick(): void {
    const shouldComplete = this.stepStatus >= 1;
    this.endAnimation(shouldComplete, this.stepStatus ? 0 : 1);
  }

  ngAfterViewInit(): void {
    this.setAnimations();
  }

  open(): void {
    if (this.isNone) {
      this._animationNone.progressEnd(0, 1);
    } else {
      this._animationClose.progressEnd(0, 1);
    }
    this.isNone = false;
  }

  none(): void {
    if (!this.isNone) {
      this._animationNone.progressEnd(1, 0);
    }
    this.isNone = true;
  }

  async setAnimations() {
    await this._platform.ready();
    this.height = this._platform.height();
    this.maxInfoheight = this.height - 80;
    if (this._elRef != null && this._elRef.nativeElement != null) {
      const animationClosePanel = this._animationCtrl
        .create()
        .addElement(this._elRef.nativeElement)
        .fromTo('height', `${this.maxInfoheight - this.minInfoheight}px`, '55px');
      const animationNonePanel = this._animationCtrl
        .create()
        .addElement(this._elRef.nativeElement)
        .fromTo('height', `${this.maxInfoheight - this.minInfoheight}px`, '0px');

      this._animationClose = this._animationCtrl
        .create()
        .duration(250)
        .addAnimation([animationClosePanel]);

      this._animationNone = this._animationCtrl
        .create()
        .duration(250)
        .addAnimation([animationNonePanel]);
      this._gesture = this._gestureCtrl.create({
        el: this.dragHandleIcon.nativeElement,
        threshold: 0,
        gestureName: 'handler-drag',
        onMove: ev => this.onMove(ev),
        onEnd: ev => this.onEnd(ev),
      });

      this._gesture.enable(true);
    }
  }

  private endAnimation(shouldComplete: boolean, step: number) {
    console.log(step);
    this._animationClose.progressEnd(shouldComplete ? 1 : 0, step);
    this._animationClose.onFinish(() => {
      this._gesture.enable(true);
    });
    this.stepStatus = shouldComplete ? 0 : 1;
  }

  private onEnd(ev) {
    if (!this._started) {
      return;
    }
    this._gesture.enable(false);
    const step = this.getStep(ev);
    const shouldComplete = step > 0.5;
    console.log(step);
    this.endAnimation(shouldComplete, step);
  }

  private onMove(ev) {
    if (!this._started) {
      this._animationClose.progressStart(false);
      this._started = true;
    }
    const step = this.getStep(ev);
    console.log(step);
    this._animationClose.progressStep(step);
  }
  private getStep(ev) {
    const delta = this._initialStep - ev.deltaY;
    return this._clamp(0, delta / (this.maxInfoheight - this.minInfoheight), 1);
  }
  private _clamp(min: number, n: number, max: number): number {
    const val = Math.max(min, Math.min(n, max));
    this.stepStatus = 1 - val;
    return this.stepStatus;
  }
}
