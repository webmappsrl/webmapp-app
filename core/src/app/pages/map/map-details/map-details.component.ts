import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Animation, AnimationController, Gesture, GestureController, Platform} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {featureOpened} from '@wm-core/store/features/features.selector';
import {
  backOfMapDetails,
  setMapDetailsStatus,
} from '@wm-core/store/user-activity/user-activity.action';
import {mapDetailsStatus} from '@wm-core/store/user-activity/user-activity.selector';
import {mapDetailsStatus as TMapDetailsStatus} from '@wm-core/store/user-activity/user-activity.reducer';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {debounceTime, skip} from 'rxjs/operators';
import {DETAILS_ANIMATION_DURATION, MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS} from 'src/app/constants/map';

import {computeTargetHeight} from './map-details-height.util';

@Component({
  standalone: false,
  selector: 'wm-map-details',
  templateUrl: './map-details.component.html',
  styleUrls: ['./map-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapDetailsComponent implements AfterViewInit, OnDestroy {
  private _animationSwipe: Animation;
  private _featureOpened$ = this._store.select(featureOpened);
  private _gesture: Gesture;
  private _initialStep: number = 1;
  private _started: boolean = false;
  private _currentStatus: TMapDetailsStatus = 'background';
  private _gestureActive: boolean = false;
  private _resizeObserver: ResizeObserver;
  private _contentResize$ = new Subject<void>();
  private _contentResizeSub: Subscription;

  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('dragHandleIcon') dragHandleIcon: ElementRef;
  @ViewChild('contentWrapper') contentWrapperRef: ElementRef;
  @ViewChild('cardHeader') cardHeaderRef: ElementRef;

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
  ) {}

  ngAfterViewInit(): void {
    this.setAnimations();
    this._setGesture();
    this._contentResizeSub = this._contentResize$
      .pipe(debounceTime(MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS))
      .subscribe(() => this._applyContentResize());
    this._resizeObserver = new ResizeObserver(() => this._contentResize$.next());
    if (this.contentWrapperRef?.nativeElement != null) {
      this._resizeObserver.observe(this.contentWrapperRef.nativeElement);
    }
    this._featureOpened$.pipe(skip(1)).subscribe(featureopened => {
      if (featureopened) {
        this._store.dispatch(setMapDetailsStatus({status: 'open'}));
      }
    });
    this._store.select(mapDetailsStatus).subscribe(status => {
      this._currentStatus = status;
      switch (status) {
        case 'open':
          this.open();
          break;
        case 'onlyTitle':
          this.onlyTitle();
          break;
        case 'background':
          this.background();
          break;
        case 'full':
          this.full();
          break;
      }
    });
  }

  background(): void {
    this.setAnimations(`${this._getCurrentHeight()}px`, '0px');
    this.isOpen$.next(false);
  }

  full(): void {
    this._applyHeightForStatus('full');
    this.isOpen$.next(true);
  }

  handleClick(): void {
    const shouldComplete = this.stepStatus >= 1;
    this.endAnimation(shouldComplete, this.stepStatus ? 0 : 1);
  }

  back(): void {
    this._store.dispatch(backOfMapDetails());
    this.closeEVT.emit();
  }

  onlyTitle(): void {
    this.setAnimations(`${this._getCurrentHeight()}px`, '60px');
    this.isOpen$.next(true);
  }

  open(): void {
    this._applyHeightForStatus('open');
    this.isOpen$.next(true);
  }

  /**
   * Anima l'altezza dell'host da `from` a `to`. Se `instant` è true (usato solo dal
   * ridimensionamento automatico via ResizeObserver quando prefers-reduced-motion è
   * attivo), la transizione avviene senza animazione (durata 0).
   */
  async setAnimations(from = '0px', to = '0px', instant = false) {
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
        .duration(instant ? 0 : DETAILS_ANIMATION_DURATION)
        .addAnimation([animationSwipePanel]);
      await this._animationSwipe.play();
    }
  }

  /**
   * Alterna tra lo stato "open" e "onlyTitle" in base allo stato logico corrente
   * (non più all'altezza in pixel, inaffidabile ora che "full" è content-fit).
   */
  toggle(): boolean {
    if (
      this._currentStatus === 'full' ||
      this._currentStatus === 'onlyTitle' ||
      this._currentStatus === 'background'
    ) {
      this._store.dispatch(setMapDetailsStatus({status: 'open'}));
      return true;
    }
    this._store.dispatch(setMapDetailsStatus({status: 'onlyTitle'}));
    return false;
  }

  toogleFullMap() {
    this.modeFullMap = !this.toggle();
  }

  /**
   * Calcola e applica l'altezza target del pannello in base al contenuto reale
   * misurato, per lo stato "open" o "full". La galleria immagini (wm-image-detail)
   * è esclusa dal content-fit: è un visualizzatore a schermo intero che deve sempre
   * riempire lo spazio disponibile (tetto massimo), non adattarsi al contenuto —
   * misurarla comunque reintrodurrebbe il rischio di loop del ResizeObserver, dato
   * che la sua altezza CSS è percentuale e quindi già agganciata all'altezza animata
   * del pannello (vedi map-details.component.scss).
   */
  private _applyHeightForStatus(status: 'open' | 'full', instant = false): void {
    const ceiling = this._resizeCeilingForStatus(status);
    const target = this._isGalleryContentActive()
      ? ceiling
      : computeTargetHeight(
          this._measureContentHeight(),
          this._measureHeaderHeight(),
          this.minInfoheight,
          ceiling,
        );
    this.setAnimations(`${this._getCurrentHeight()}px`, `${target}px`, instant);
  }

  /** true se il contenuto proiettato è la galleria immagini a schermo intero. */
  private _isGalleryContentActive(): boolean {
    return this.contentWrapperRef?.nativeElement?.querySelector('wm-image-detail') != null;
  }

  /** Tetto massimo di altezza per lo stato dato: fisso per "open", quasi-fullscreen per "full". */
  private _resizeCeilingForStatus(status: 'open' | 'full'): number {
    if (status === 'full') {
      return this.height - 200 - this._getSafeAreaTopPx();
    }
    return this.minInfoheight;
  }

  /** Altezza reale del contenuto proiettato, misurata sul wrapper non vincolato in altezza. */
  private _measureContentHeight(): number {
    return this.contentWrapperRef?.nativeElement?.offsetHeight ?? 0;
  }

  /** Altezza reale dell'header (drag handle + eventuale contenuto proiettato in [header]). */
  private _measureHeaderHeight(): number {
    return this.cardHeaderRef?.nativeElement?.offsetHeight ?? 0;
  }

  /** Legge il safe-area-inset-top risolto da Ionic nella custom property --ion-safe-area-top. */
  private _getSafeAreaTopPx(): number {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--ion-safe-area-top')
      .trim();
    return parseFloat(raw) || 0;
  }

  /** true se l'utente ha richiesto animazioni ridotte a livello di sistema operativo. */
  private _prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    );
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._contentResizeSub?.unsubscribe();
  }

  /**
   * Reagisce a una variazione di altezza del contenuto rilevata dal ResizeObserver
   * (debounced). Non fa nulla mentre una gesture è in corso o se lo stato corrente
   * non è "open"/"full" (unico caso in cui l'altezza dipende dal contenuto).
   */
  private _applyContentResize(): void {
    if (this._gestureActive) {
      return;
    }
    if (this._currentStatus === 'open' || this._currentStatus === 'full') {
      this._applyHeightForStatus(this._currentStatus, this._prefersReducedMotion());
    }
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
        this._gestureActive = true;
        // Solo da 'full' si torna a 'open' (collassa dall'espanso al normale).
        // Da qualunque altro stato — inclusi 'background' (es. dopo backOfMapDetails$/
        // goToHome$) e 'onlyTitle' — si espande a 'full', fedele al comportamento
        // pixel-based originale (_getCurrentHeight() > minInfoheight ? 'open' : 'full').
        if (this._currentStatus === 'full') {
          this._store.dispatch(setMapDetailsStatus({status: 'open'}));
        } else {
          this._store.dispatch(setMapDetailsStatus({status: 'full'}));
        }
      },
      onEnd: ev => {
        ev.event?.preventDefault();
        this._gestureActive = false;
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
}
