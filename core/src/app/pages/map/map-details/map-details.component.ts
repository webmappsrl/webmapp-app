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
import {Store} from '@ngrx/store';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {featureOpened} from '@wm-core/store/features/features.selector';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import {skip} from 'rxjs/operators';

@Component({
  selector: 'wm-map-details',
  templateUrl: './map-details.component.html',
  styleUrls: ['./map-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapDetailsComponent implements AfterViewInit {
  private _animationSwipe: Animation;
  private _featureOpened$ = this._store.select(featureOpened);
  private _gesture: Gesture;
  private _initialStep: number = 1;
  private _started: boolean = false;

  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleEVT: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('dragHandleIcon') dragHandleIcon: ElementRef;

  height = 700;
  isOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  maxInfoheight = 850;
  minInfoheight = 320;
  modeFullMap = false;
  stepStatus = 0;

  constructor(
    private _elRef: ElementRef,
    private _platform: Platform,
    private _animationCtrl: AnimationController,
    private _gestureCtrl: GestureController,
    private _store: Store,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  ngAfterViewInit(): void {
    this.setAnimations();
    this._setGesture();
    this._featureOpened$.pipe(skip(1)).subscribe(featureopened => {
      if (featureopened) {
        this.open();
      } else {
        this.none();
      }
    });
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
    const queryParams = this._urlHandlerSvc.getCurrentQueryParams();
    if (queryParams.poi != null) {
      this._urlHandlerSvc.updateURL({poi: undefined});
      this.background();
    } else if (queryParams.ec_related_poi != null) {
      this._urlHandlerSvc.updateURL({ec_related_poi: undefined});
    } else if (queryParams.ugc_poi != null) {
      this._urlHandlerSvc.updateURL({ugc_poi: undefined});
    } else {
      this.background();
      this._urlHandlerSvc.updateURL({track: undefined, ugc_track: undefined});
    }

    this.closeEVT.emit();
  }

  onlyTitle(): void {
    this.setAnimations(`${this._getCurrentHeight()}px`, '60px');
    this.isOpen$.next(true);
  }

  open(): void {
    this.setAnimations(`${this._getCurrentHeight()}px`, `${this.minInfoheight}px`);
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

  private _getCurrentHeight(): number {
    return this._elRef.nativeElement.offsetHeight;
  }

  private _setGesture() {
    this._gesture = this._gestureCtrl.create({
      el: this.dragHandleIcon.nativeElement,
      threshold: 0,
      gestureName: 'handler-drag',
      gesturePriority: 100,
      passive: false,
      onStart: ev => {
        ev.event?.preventDefault();
        this.toggleEVT.emit();

        if (this._getCurrentHeight() > this.minInfoheight || this._getCurrentHeight() === 56) {
          this.open();
        } else {
          this.full();
        }
      },
      onEnd: ev => {
        ev.event?.preventDefault();
      }
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
}
