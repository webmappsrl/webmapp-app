import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {GeoutilsService} from '@wm-core/services/geoutils.service';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {ModalSaveComponent} from '../shared/modal-save/modal-save.component';
import {ModalController, NavController} from '@ionic/angular';
import {confTRACKFORMS} from '@wm-core/store/conf/conf.selector';
import {
  onRecord,
  trackLiveDistanceVm,
  TrackLiveDistanceVm,
} from '@wm-core/store/user-activity/user-activity.selector';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {
  setEnablePoiRecorderPanel,
  setEnableTrackRecorderPanel,
  setOnRecord,
} from '@wm-core/store/user-activity/user-activity.action';
import {minimizeOpenMapDetails} from 'src/app/functions/minimize-open-map-details';
import {UgcTrackStatsService} from '@wm-core/services/ugc-track-stats.service';
import {UgcTrackStatsParams} from '@wm-core/types/config';
import {computeUgcTrackLocalStats, haversineMeters} from '@wm-core/utils/ugc-track-stats';
import {Location} from '@wm-types/feature';
import {RecorderPanelLayoutService} from 'src/app/services/recorder-panel-layout.service';
import {prefersReducedMotion} from 'src/app/functions/prefers-reduced-motion';

/** Informazione mostrata sulla seconda riga della linguetta, scelta scorrendo. */
export type RecorderMiniInfo = 'to' | 'from' | 'odo' | 'speed' | 'average';

/** Riduzione della plancia alla linguetta (ms). */
const MINIMIZE_MS = 250;
/** Riapertura: un po' più lenta, perché l'occhio deve seguire un elemento che entra (ms). */
const EXPAND_MS = 300;
/** Comparsa del contenuto a fine trasformazione (ms). */
const CONTENT_FADE_MS = 160;
/** Dissolvenza al posto del movimento con «riduci movimento» (ms). */
const REDUCED_FADE_MS = 140;
/** Stessa curva del restringimento dell'avviso GPS. */
const TOGGLE_EASING = 'cubic-bezier(.4,0,.2,1)';
/** Informazioni della linguetta con una traccia selezionata: la prima è la predefinita. */
const MINI_INFOS_TRACK: RecorderMiniInfo[] = ['to', 'from', 'odo', 'speed', 'average'];
/** Informazioni della linguetta senza traccia: la prima è la predefinita. */
const MINI_INFOS_FREE: RecorderMiniInfo[] = ['odo', 'speed', 'average'];
/** Spostamento verticale che cambia l'informazione (px). */
const MINI_SWIPE_PX = 16;
/** Sotto questo spostamento il gesto è un tocco, che riapre la plancia (px). */
const MINI_TAP_PX = 8;
/** Tempo minimo dal punto di partenza prima della riduzione automatica (ms). */
const AUTO_MINIMIZE_MS = 15000;
/** Spostamento netto minimo dal punto di partenza per la riduzione automatica (m). */
const AUTO_MINIMIZE_M = 20;

@Component({
  standalone: false,
  selector: 'wm-track-recorder',
  templateUrl: './track-recorder.component.html',
  styleUrls: ['./track-recorder.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackRecorderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('panel', {read: ElementRef}) panel?: ElementRef<HTMLElement>;

  /** La linguetta è sotto `*ngIf`: si osserva quando compare. */
  @ViewChild('mini', {read: ElementRef}) set mini(ref: ElementRef<HTMLElement> | undefined) {
    if (this._mini) this._resizeObserver?.unobserve(this._mini);
    this._mini = ref?.nativeElement;
    if (this._mini) this._resizeObserver?.observe(this._mini);
  }

  /** Dettaglio della mappa aperto: la plancia lascia libero il suo bottone indietro in alto a sinistra. */
  @Input() detailsOpen: boolean | null = false;

  //TODO: Gestire il flusso della registrazione dallo store creando action, effect, selector e reducer necessari
  actualSpeed: number = 0;
  // Distanza e velocità media vengono dai soli punti tenuti dalla pulizia GPS, con le stesse
  // funzioni del pannello dei dettagli (oc:8743); null quando non calcolabile, il template mostra "—"
  averageSpeed: number | null = null;
  isPaused = false;
  length: number | null = null;
  /** Informazione scelta per la linguetta; vale per la registrazione in corso. */
  miniInfo: RecorderMiniInfo = 'odo';
  /** Plancia ridotta alla linguetta sul bordo destro; vale per la registrazione in corso. */
  minimized = false;
  opacity: number = 0;
  time: {hours: number; minutes: number; seconds: number} = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  confTRACKFORMS$: Observable<any[]> = this._store.select(confTRACKFORMS);
  focusPosition$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  onRecord$: Observable<boolean> = this._store.select(onRecord);
  // Selettore condiviso con tab-detail.component.ts (oc:8177) — vedi commento su
  // trackLiveDistanceVm in user-activity.selector.ts per il gate su
  // OPTIONS.showTrackRemainingDistance.
  trackLiveDistanceVm$: Observable<TrackLiveDistanceVm> = this._store.select(trackLiveDistanceVm);

  /**
   * Punto di partenza della riduzione automatica: istante e posizione da cui si contano tempo e
   * spostamento. Si rifissa all'avvio, alla riapertura, alla ripresa e a ogni tocco sulla plancia.
   */
  private _autoAnchor: {time: number; location: Location | null} = {time: 0, location: null};
  private _hasTrack = false;
  /** Ora dell'ultimo punto tenuto già visto: una riemissione dello stesso punto non conta. */
  private _lastKeptTime: number | null = null;
  private _mini?: HTMLElement;
  /** Inizio del gesto sulla linguetta. */
  private _pointerStart: {x: number; y: number} | null = null;
  /** L'ultimo gesto è stato uno scorrimento: il click che segue non riapre la plancia. */
  private _swiped = false;
  private _onRecord = false;
  private _resizeObserver: ResizeObserver | null = null;
  private _statsParams: UgcTrackStatsParams | null = null;
  private _timerInterval: any;
  private _transition: Animation[] = [];
  /** Trasformazione in corso: finché c'è, l'avviso GPS non si sposta. */
  private _shape: Animation | null = null;
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private _store: Store,
    private _geolocationSvc: GeolocationService,
    private _cdr: ChangeDetectorRef,
    private _geoutilsSvc: GeoutilsService,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
    private _ugcTrackStatsSvc: UgcTrackStatsService,
    private _panelLayoutSvc: RecorderPanelLayoutService,
  ) {}

  ngOnInit() {
    this.onRecord$.pipe(takeUntil(this._destroy$)).subscribe(onRecord => {
      this._onRecord = onRecord;
      this._publishPanelBottom();
    });
    this.trackLiveDistanceVm$.pipe(takeUntil(this._destroy$)).subscribe(vm => this._onTrackChange(vm));
    this._ugcTrackStatsSvc.params$
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => (this._statsParams = params));
    this._geolocationSvc.onLocationChange$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.updateMap();
    });
    // Il valore già presente (BehaviorSubject, anche dopo una ripresa all'avvio) fissa solo il
    // punto di partenza: la sua replica all'iscrizione ha la stessa ora e viene ignorata
    this._resetAutoMinimize();
    this._lastKeptTime = this._autoAnchor.location?.time ?? null;
    this._geolocationSvc.recordedKeptLocations$
      .pipe(takeUntil(this._destroy$))
      .subscribe(kept => this._onKeptLocations(kept));
    this.checkRecording();
  }

  /** Osserva l'altezza della plancia, che cambia con i badge, la pausa e la riduzione. */
  ngAfterViewInit(): void {
    if (typeof ResizeObserver === 'undefined') return;
    this._resizeObserver = new ResizeObserver(() => this._onResize());
    if (this.panel) this._resizeObserver.observe(this.panel.nativeElement);
    if (this._mini) this._resizeObserver.observe(this._mini);
  }

  ngOnDestroy(): void {
    try {
      clearInterval(this._timerInterval);
    } catch (e) {}
    this._cancelTransition();
    this._resizeObserver?.disconnect();
    this._panelLayoutSvc.setPanelBottom(null);
    this._destroy$.next();
    this._destroy$.complete();
  }

  recordMove(ev: number): void {
    this.opacity = ev;
  }

  recordStart(event: boolean): void {
    this.isPaused = false;
    this._geolocationSvc.startRecording();
    // Riduce il pannello di dettaglio (es. traccia aperta) a solo titolo all'avvio della
    // registrazione, così la mappa resta visibile durante il movimento — non azzera
    // currentEcTrack (a differenza della chiusura esplicita del pannello), quindi le
    // distanze inizio/fine restano disponibili nel box (vedi trackLiveDistanceVm$).
    // Un pannello chiuso resta chiuso (oc:8762).
    minimizeOpenMapDetails(this._store);
    this._resetAutoMinimize();
    this.checkRecording();
  }

  checkRecording(): void {
    this.onRecord$.pipe(take(1)).subscribe(onRecord => {
      if (onRecord) {
        this.isPaused = this._geolocationSvc.paused;
        this.opacity = 1;
        this._timerInterval = setInterval(() => {
          this.time = GeoutilsService.formatTime(this._geolocationSvc.recordTime / 1000);
          this._cdr.detectChanges();
        }, 1000);
        setTimeout(() => {
          this.updateMap();
        }, 100);
      }
    });
  }

  updateMap(): void {
    this.onRecord$.pipe(take(1)).subscribe(onRecord => {
      // Il getter ricostruisce la feature a ogni lettura: una sola per aggiornamento
      const recordedFeature = this._geolocationSvc.recordedFeature;
      if (onRecord && recordedFeature) {
        const stats = this._statsParams
          ? computeUgcTrackLocalStats(
              this._geolocationSvc.recordedKeptLocations$.value,
              this._statsParams,
            )
          : null;
        this.length = stats?.distance ?? null;
        // La velocità attuale resta quella del GPS grezzo
        this.actualSpeed =
          this._geolocationSvc.location.speed ??
          this._geoutilsSvc.getCurrentSpeed(recordedFeature);
        this.averageSpeed = stats?.avg_speed ?? null;
      }
    });
  }

  backToMap(): void {
    this.reset();
  }

  /**
   * Riduce la plancia alla linguetta sul bordo destro: la linguetta parte dalla forma della plancia
   * e si stringe verso l'angolo. L'avviso GPS si sposta a transizione finita.
   */
  async minimize(): Promise<void> {
    if (this.minimized) return;
    await this._toggle(true, MINIMIZE_MS);
  }

  /** Riapre la plancia dalla linguetta, con il percorso inverso. */
  async expand(): Promise<void> {
    if (!this.minimized) return;
    // Dopo la riapertura il conteggio riparte: camminando, la plancia si riduce di nuovo
    this._resetAutoMinimize();
    await this._toggle(false, EXPAND_MS);
  }

  /** Un tocco sulla plancia aperta, bottoni compresi, fa ripartire il conteggio della riduzione automatica. */
  onPanelPointerDown(): void {
    this._resetAutoMinimize();
  }

  reset(): void {
    this.opacity = 0;
    this.time = {hours: 0, minutes: 0, seconds: 0};
    this.actualSpeed = 0;
    this.averageSpeed = null;
    this.length = null;
    this._store.dispatch(setOnRecord({onRecord: false}));
    this._store.dispatch(setEnableTrackRecorderPanel({enable: false}));
    this.focusPosition$.next(false);

    this._cancelTransition();
    this.isPaused = false;
    this.minimized = false;
    this.miniInfo = this.miniInfos(this._hasTrack)[0];
    this._panelLayoutSvc.setPanelBottom(null);
    this._geolocationSvc.stopRecording();
  }

  async pause(): Promise<void> {
    await this._geolocationSvc.pauseRecording();
    this.isPaused = true;
  }

  async resume(): Promise<void> {
    await this._geolocationSvc.resumeRecording();
    this.focusPosition$.next(true);
    this.isPaused = false;
    this._resetAutoMinimize();
    // Stesso motivo di recordStart(): se durante la pausa l'utente ha riaperto un pannello di
    // dettaglio (map-details.component.ts lo forza sempre a 'open' all'apertura di una
    // feature), riprendere la registrazione deve tornare a liberare la mappa.
    minimizeOpenMapDetails(this._store);
  }

  async stop(): Promise<void> {
    this.stopRecording();
    this.focusPosition$.next(false);
  }

  async stopRecording(): Promise<void> {
    await this._geolocationSvc.pauseRecording();
    this.isPaused = true;

    // TODO: show dialog no coordinates recorded

    const recordedFeature = this._geolocationSvc.recordedFeature;
    const modal = await this._modalCtrl.create({
      component: ModalSaveComponent,
      componentProps: {
        acquisitionFORM$: this.confTRACKFORMS$,
        recordedFeature,
      },
    });
    await modal.present();
    const res = await modal.onDidDismiss();

    if (!res.data.dismissed && res.data.save) {
      this._geolocationSvc.stopRecording();
      clearInterval(this._timerInterval);
      this.backToMap();
    } else if (!res.data.dismissed) {
      await this._geolocationSvc.stopRecording();
      this.backToMap();
    }
  }

  /**
   * Informazioni che la linguetta può mostrare.
   * @param hasTrack c'è una traccia selezionata
   * @returns l'elenco nell'ordine dello scorrimento, la predefinita per prima
   */
  miniInfos(hasTrack: boolean): RecorderMiniInfo[] {
    return hasTrack ? MINI_INFOS_TRACK : MINI_INFOS_FREE;
  }

  /**
   * Posizione dell'informazione scelta nell'elenco, per lo scorrimento e i puntini.
   * @param hasTrack c'è una traccia selezionata
   * @returns indice in `miniInfos(hasTrack)`
   */
  miniIndex(hasTrack: boolean): number {
    return Math.max(0, this.miniInfos(hasTrack).indexOf(this.miniInfo));
  }

  /**
   * Inizio del gesto sulla linguetta.
   * @param event pointerdown
   */
  onMiniPointerDown(event: PointerEvent): void {
    this._pointerStart = {x: event.clientX, y: event.clientY};
    this._swiped = false;
  }

  /**
   * Fine del gesto: uno scorrimento verticale cambia informazione, verso l'alto la successiva.
   * In pausa la riga mostra «In pausa» e lo scorrimento non cambia nulla.
   * @param event pointerup
   */
  onMiniPointerUp(event: PointerEvent): void {
    if (!this._pointerStart) return;
    const dx = event.clientX - this._pointerStart.x;
    const dy = event.clientY - this._pointerStart.y;
    this._pointerStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= MINI_TAP_PX) this._swiped = true;
    if (this.isPaused || Math.abs(dy) < MINI_SWIPE_PX) return;
    const infos = this.miniInfos(this._hasTrack);
    const next = this.miniIndex(this._hasTrack) + (dy < 0 ? 1 : -1);
    this.miniInfo = infos[Math.max(0, Math.min(infos.length - 1, next))];
    this._cdr.markForCheck();
  }

  /** Gesto annullato dal sistema. */
  onMiniPointerCancel(): void {
    this._pointerStart = null;
  }

  /** Il tocco sulla linguetta la riapre; il click che chiude uno scorrimento no. */
  onMiniClick(): void {
    if (this._swiped) {
      this._swiped = false;
      return;
    }
    this.expand();
  }

  /**
   * Avanzamento sulla traccia selezionata, per la barra della plancia.
   * @param vm distanze dalla partenza e dall'arrivo
   * @returns percentuale da 0 a 100
   */
  progressPercent(vm: TrackLiveDistanceVm): number {
    const covered = vm.distanceCovered ?? 0;
    const total = covered + (vm.remainingDistance ?? 0);
    return total > 0 ? (covered / total) * 100 : 0;
  }

  waypoint(): void {
    this._store.dispatch(setEnablePoiRecorderPanel({enable: true}));
  }

  /**
   * Passa fra plancia e linguetta animando l'elemento che compare dalla forma di quello che sparisce.
   * Le animazioni non usano `fill: 'forwards'`: a fine corsa l'elemento torna ai suoi stili.
   * @param minimized stato d'arrivo
   * @param duration durata della trasformazione (ms)
   */
  private async _toggle(minimized: boolean, duration: number): Promise<void> {
    this._cancelTransition();
    const from = (minimized ? this.panel?.nativeElement : this._mini)?.getBoundingClientRect();
    this.minimized = minimized;
    this._cdr.detectChanges();
    const el = minimized ? this._mini : this.panel?.nativeElement;
    if (!el || !from || typeof el.animate !== 'function') {
      this._publishPanelBottom();
      return;
    }
    if (prefersReducedMotion()) {
      // solo una dissolvenza breve, senza movimento; non si aspetta
      this._transition.push(el.animate([{opacity: 0}, {opacity: 1}], {duration: REDUCED_FADE_MS}));
      this._publishPanelBottom();
      return;
    }
    const to = el.getBoundingClientRect();
    const shape = el.animate(
      [
        {
          transformOrigin: 'top left',
          transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`,
        },
        {transformOrigin: 'top left', transform: 'none'},
      ],
      {duration, easing: TOGGLE_EASING},
    );
    this._transition.push(shape);
    this._shape = shape;
    // il contenuto compare quando la forma è quasi arrivata, così non si vede deformato
    Array.from(el.children).forEach(child =>
      this._transition.push(
        child.animate([{opacity: 0}, {opacity: 1}], {duration: CONTENT_FADE_MS, delay: duration - CONTENT_FADE_MS / 2, fill: 'backwards'}),
      ),
    );
    try {
      await shape.finished;
    } catch {
      return; // annullata da un'altra transizione o dalla fine della registrazione
    } finally {
      if (this._shape === shape) this._shape = null;
    }
    this._publishPanelBottom();
  }

  /**
   * Traccia selezionata o tolta: con una traccia nuova la linguetta passa ad Arrivo; senza traccia
   * Arrivo e Partenza non esistono più e si passa ai km percorsi; le altre scelte restano.
   * @param vm distanze sulla traccia selezionata
   */
  private _onTrackChange(vm: TrackLiveDistanceVm): void {
    const hasTrack = vm?.remainingDistance != null;
    if (hasTrack === this._hasTrack && this.miniInfos(hasTrack).includes(this.miniInfo)) return;
    if (hasTrack && !this._hasTrack) this.miniInfo = 'to';
    else if (!this.miniInfos(hasTrack).includes(this.miniInfo)) this.miniInfo = this.miniInfos(hasTrack)[0];
    this._hasTrack = hasTrack;
    this._cdr.markForCheck();
  }

  /**
   * Rifissa il punto di partenza della riduzione automatica: adesso, dall'ultimo punto tenuto.
   */
  private _resetAutoMinimize(): void {
    const kept = this._geolocationSvc.recordedKeptLocations$.value;
    this._autoAnchor = {time: Date.now(), location: kept.length ? kept[kept.length - 1] : null};
  }

  /**
   * Nuovo elenco di punti tenuti dalla pulizia GPS: se l'utente cammina da abbastanza tempo e si è
   * spostato abbastanza dal punto di partenza, la plancia si riduce. L'ultimo punto dell'elenco è
   * sempre un punto buono; contano solo i punti nuovi, non le riemissioni dopo un ricalcolo.
   * In pausa i punti continuano ad arrivare: il controllo su `isPaused` deve restare qui.
   * @param kept i punti tenuti, in ordine
   */
  private _onKeptLocations(kept: Location[]): void {
    if (!kept?.length) return;
    const last = kept[kept.length - 1];
    if (last.time === this._lastKeptTime) return;
    this._lastKeptTime = last.time ?? null;
    if (!this._autoAnchor.location) {
      this._autoAnchor.location = last;
      return;
    }
    if (!this._onRecord || this.isPaused || this.minimized) return;
    const meters = haversineMeters(this._autoAnchor.location, last);
    // Lo spostamento deve superare l'errore peggiore fra partenza e ultimo punto: da fermi, sul
    // web, arriva un punto al secondo e l'oscillazione supera facilmente i 20 m; all'avvio il
    // primo punto, che fa da partenza, è spesso il meno preciso
    const accuracy = Math.max(last.accuracy ?? 0, this._autoAnchor.location.accuracy ?? 0);
    if (
      Date.now() - this._autoAnchor.time >= AUTO_MINIMIZE_MS &&
      meters >= AUTO_MINIMIZE_M &&
      meters > accuracy
    ) {
      this.minimize();
    }
  }

  /** Ridimensionamento di plancia o linguetta: l'avviso si sposta solo a transizione finita. */
  private _onResize(): void {
    if (!this._shape) this._publishPanelBottom();
  }

  /** Annulla la transizione in corso. */
  private _cancelTransition(): void {
    this._transition.forEach(a => a.cancel());
    this._transition = [];
    this._shape = null;
  }

  /**
   * Pubblica dove finisce l'elemento visibile — linguetta se ridotta, altrimenti la plancia —
   * perché l'avviso GPS compaia sotto. Prima dello slider la plancia è montata ma trasparente:
   * senza registrazione attiva non conta.
   */
  private _publishPanelBottom(): void {
    const el = this.minimized ? this._mini : this.panel?.nativeElement;
    this._panelLayoutSvc.setPanelBottom(this._onRecord && el ? el.getBoundingClientRect().bottom : null);
  }
}
