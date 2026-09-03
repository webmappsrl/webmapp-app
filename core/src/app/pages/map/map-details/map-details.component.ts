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
import {BehaviorSubject, Subscription} from 'rxjs';
import {skip} from 'rxjs/operators';
import {DETAILS_ANIMATION_DURATION} from 'src/app/constants/map';

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
  private _subscriptions = new Subscription();
  /**
   * Catena di promise su cui si accoda OGNI animazione di altezza del pannello — sia il resize
   * content-fit di `_applyHeightForStatus()` sia le transizioni di stato esplicite di
   * `background()`/`onlyTitle()` — per non chiamare mai `Animation.destroy()` (dentro
   * `setAnimations()`) su un'animazione ancora `.play()`-ata da un'altra chiamata in corso.
   * `Animation.destroy()` non chiama mai `stop()` (verificato nel sorgente Ionic): se questo
   * accadesse, la Promise di quel `play()` non si risolverebbe più, `_runPendingResize()`
   * resterebbe sospeso per sempre, e con esso l'intera catena — ogni `open()`/`full()` successivo
   * per il resto della sessione resterebbe accodato dietro una Promise mai risolta. Vedi
   * `_enqueueAnimation()` (oc:8427, review: bug reale trovato e corretto qui).
   */
  private _resizeChain: Promise<void> = Promise.resolve();
  private _pendingResizeRequest: {status: 'open' | 'full'; instant: boolean} | null = null;

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
    this._subscriptions.add(
      this._featureOpened$.pipe(skip(1)).subscribe(featureopened => {
        if (featureopened) {
          this._store.dispatch(setMapDetailsStatus({status: 'open'}));
        }
      }),
    );
    this._subscriptions.add(
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
      }),
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  background(): void {
    // Transizione di stato esplicita: annulla un eventuale resize di contenuto ancora solo
    // accodato (non avrebbe più senso una volta nascosto il pannello), ma va comunque accodata
    // sulla stessa `_resizeChain` — mai chiamare `setAnimations()` direttamente qui: se un resize
    // precedente sta ancora animando, chiamarla in parallelo distruggerebbe la sua animazione in
    // corso e bloccherebbe la catena per sempre (vedi commento su `_resizeChain`, oc:8427).
    this._pendingResizeRequest = null;
    this._enqueueAnimation(() => this.setAnimations(`${this._getCurrentHeight()}px`, '0px'));
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
    // Stesso motivo di `background()`: transizione di stato esplicita, non content-fit — ma
    // sempre accodata su `_resizeChain`, mai un `setAnimations()` diretto (oc:8427).
    this._pendingResizeRequest = null;
    this._enqueueAnimation(() => this.setAnimations(`${this._getCurrentHeight()}px`, '60px'));
    this.isOpen$.next(true);
  }

  open(): void {
    this._applyHeightForStatus('open');
    this.isOpen$.next(true);
  }

  /**
   * Anima l'altezza dell'host da `from` a `to`. `instant` (durata 0, nessuna animazione visibile)
   * non è oggi usato da alcun chiamante di questo repo, ma resta supportato per compatibilità con
   * `_runPendingResize()`, che lo inoltra.
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
   * Calcola e applica l'altezza target del pannello in base al contenuto reale misurato AL
   * MOMENTO DELL'INGRESSO nello stato "open" o "full" — chiamato solo da `open()`/`full()`, mai
   * automaticamente in risposta a un cambio successivo del contenuto proiettato (oc:8427): una
   * volta calcolata, l'altezza resta quella finché non si cambia esplicitamente stato. La galleria
   * immagini (wm-image-detail) è esclusa dal content-fit: è un visualizzatore a schermo intero che
   * deve sempre riempire lo spazio disponibile (tetto massimo), non adattarsi al contenuto — la
   * sua altezza CSS è percentuale, agganciata all'altezza animata del pannello (vedi
   * map-details.component.scss).
   *
   * Se un resize di questo tipo è già in corso, la nuova richiesta viene accodata sulla stessa
   * catena di promise (`_resizeChain`, vedi `_enqueueAnimation()`) invece di interrompere quello
   * in corso — mai chiamare `Animation.destroy()` su un'animazione ancora in corso generata da
   * questo metodo.
   *
   * Più richieste ravvicinate si "coalescono": `_pendingResizeRequest` tiene solo l'ultima, quindi
   * se ne arrivano diverse prima che la catena arrivi a eseguirle, verrà applicata solo la più
   * recente (con una misura fresca del contenuto al momento dell'esecuzione, non quella — ormai
   * stale — del momento della richiesta). La Promise restituita a OGNI chiamante si risolve solo
   * quando il resize realmente eseguito (il proprio, o quello più recente che l'ha soppiantato) è
   * concluso — mai prima, per non risolvere un eventuale chiamante in attesa prima che il resize
   * sia davvero completato.
   */
  private _applyHeightForStatus(status: 'open' | 'full', instant = false): Promise<void> {
    this._pendingResizeRequest = {status, instant};
    return this._enqueueAnimation(() => this._runPendingResize());
  }

  /**
   * Accoda `work` sulla stessa `_resizeChain` usata da `_applyHeightForStatus()`, così qualunque
   * animazione di altezza del pannello (resize content-fit o transizione di stato esplicita da
   * `background()`/`onlyTitle()`) è sempre serializzata rispetto alle altre — mai eseguita mentre
   * un'altra sta ancora animando (vedi commento su `_resizeChain`). Un eventuale errore in `work`
   * viene loggato e non propagato: senza questo `.catch()`, un solo reject "avvelenerebbe" la
   * catena per il resto della sessione, bloccando silenziosamente ogni richiesta di resize
   * successiva (stesso sintomo del bug corretto qui, per una causa diversa).
   *
   * @param work Funzione che esegue l'animazione e ne restituisce la Promise di completamento.
   * @returns Promise che si risolve quando `work` (o quello più recente che l'ha soppiantato in
   *   coda) è concluso.
   */
  private _enqueueAnimation(work: () => Promise<void>): Promise<void> {
    this._resizeChain = this._resizeChain.then(work).catch(err => {
      console.error('[MapDetailsComponent] animazione di resize del pannello fallita', err);
    });
    return this._resizeChain;
  }

  /**
   * Esegue l'ultima richiesta di resize accodata (`_pendingResizeRequest`), se ce n'è ancora una
   * da eseguire — un link della catena successivo a uno che l'ha già consumata e soppiantata
   * (coalescenza, vedi `_applyHeightForStatus()`) non fa nulla.
   */
  private async _runPendingResize(): Promise<void> {
    const request = this._pendingResizeRequest;
    if (request == null) return;
    this._pendingResizeRequest = null;
    const ceiling = this._resizeCeilingForStatus(request.status);
    const target = this._isGalleryContentActive()
      ? ceiling
      : computeTargetHeight(
          this._measureContentHeight(),
          this._measureHeaderHeight(),
          this.minInfoheight,
          ceiling,
        );
    await this.setAnimations(`${this._getCurrentHeight()}px`, `${target}px`, request.instant);
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
