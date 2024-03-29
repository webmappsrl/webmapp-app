import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Animation, AnimationController, Gesture, GestureController, Platform} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'wm-map-track-details',
  templateUrl: './map-track-details.component.html',
  styleUrls: ['./map-track-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapTrackDetailsComponent implements AfterViewInit {
  private _animationSwipe: Animation;
  private _gesture: Gesture;
  private _initialStep: number = 1;
  private _started: boolean = false;

  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleEVT: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('dragHandleIcon') dragHandleIcon: ElementRef;

  height = 700;
  isOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  maxInfoheight = 850;
  minInfoheight = 350;
  modeFullMap = false;
  stepStatus = 0;

  constructor(
    private _elRef: ElementRef,
    private _platform: Platform,
    private _animationCtrl: AnimationController,
    private _gestureCtrl: GestureController,
  ) {}

  ngAfterViewInit(): void {
    this.setAnimations();
    this._setGesture();
  }

  background(): void {
    this.setAnimations(`${this._getCurrentHeight()}px`, '0px');
    this.isOpen$.next(false);
  }

  full(): void {
    this.setAnimations(`${this._getCurrentHeight()}px`, `${this.height - 200}px`);
    this.isOpen$.next(true);
  }

  handleClick(): void {
    const shouldComplete = this.stepStatus >= 1;
    this.endAnimation(shouldComplete, this.stepStatus ? 0 : 1);
  }

  none(): void {
    this.background();
    this.closeEVT.emit();
  }

  onlyTitle(): void {
    this.setAnimations(`${this._getCurrentHeight()}px`, '60px');
    this.isOpen$.next(true);
  }

  open(): void {
    this.setAnimations(`${this._getCurrentHeight()}px`, `${320}px`);
    this.isOpen$.next(true);
  }

  async setAnimations(from = '0px', to = '0px') {
    await this._platform.ready();
    this.height = this._platform.height();
    this._animationSwipe?.destroy();
    this.maxInfoheight = this.height - 80;
    if (this._elRef != null && this._elRef.nativeElement != null) {
      const animationSwipePanel = this._animationCtrl
        .create()
        .addElement(this._elRef.nativeElement)
        .fromTo('height', from, to);

      this._animationSwipe = this._animationCtrl
        .create()
        .duration(250)
        .addAnimation([animationSwipePanel]);
      await this._animationSwipe.play();
    }
  }

  toggle(): boolean {
    if (this._getCurrentHeight() > this.maxInfoheight / 2 || this._getCurrentHeight() <= 110) {
      this.open();
      return true;
    } else {
      this.onlyTitle();
      return false;
    }
  }

  toogleFullMap() {
    this.modeFullMap = !this.toggle();
    this.toggleEVT.emit();
  }

  private _clamp(min: number, n: number, max: number): number {
    const val = Math.max(min, Math.min(n, max));
    this.stepStatus = val;
    return this.stepStatus;
  }

  private _getCurrentHeight(): number {
    return this._elRef.nativeElement.offsetHeight;
  }

  private _setGesture() {
    this._gesture = this._gestureCtrl.create({
      el: this.dragHandleIcon.nativeElement,
      threshold: 0,
      gestureName: 'handler-drag',
      onStart: ev => {
        this.toggleEVT.emit();

        if (this._getCurrentHeight() > this.maxInfoheight / 2 || this._getCurrentHeight() === 56) {
          this.open();
        } else {
          this.full();
        }
      },
    });

    this._gesture.enable(true);
  }

  private endAnimation(shouldComplete: boolean, step: number) {
    this._animationSwipe.progressEnd(shouldComplete ? 1 : 0, step);
    this._animationSwipe.onFinish(() => {
      this._gesture.enable(true);
    });
    this.stepStatus = shouldComplete ? 0 : 1;
  }

  private getStep(ev) {
    const delta = this._initialStep - ev.deltaY;
    return this._clamp(0, delta / (this.maxInfoheight - this.minInfoheight), 1);
  }

  private onEnd(ev) {
    if (!this._started) {
      return;
    }
    this._gesture.enable(false);
    const step = this.getStep(ev);
    const shouldComplete = step > 0.5;
    this.endAnimation(shouldComplete, step);
  }

  private onMove(ev) {
    if (!this._started) {
      this._animationSwipe.progressStart(false);
      this._started = true;
    }
    const step = this.getStep(ev);
    this._animationSwipe.progressStep(step);
  }
}
