import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {DeviceService} from '@wm-core/services/device.service';
import {GpsAlertKind, GpsAlertService} from 'src/app/services/gps-alert.service';
import {prefersReducedMotion} from 'src/app/functions/prefers-reduced-motion';
import {GpsSignalIconComponent} from './gps-signal-icon.component';

/** Tempo di lettura dell'avviso di segnale debole prima della trasformazione in badge. */
export const GPS_POOR_ALERT_READ_MS = 4000;
/** Durata dell'ingresso dell'avviso (ms). */
const ENTER_MS = 220;
/** Durata della dissolvenza usata al posto del volo (ms). */
const FADE_OUT_MS = 200;
/** Trasformazione avviso → badge, prima fase: il testo sfuma (ms). */
const TEXT_FADE_MS = 120;
/** Trasformazione avviso → badge, seconda fase: la scheda si stringe attorno all'icona (ms). */
const SHRINK_MS = 220;
/** Trasformazione avviso → badge, terza fase: il volo fino al badge (ms). */
const FLY_MS = 380;
/** Campioni della curva del volo: abbastanza per un arco morbido. */
const FLY_STEPS = 12;
/** Spostamento laterale del punto di controllo dell'arco, verso il bordo dello schermo (px). */
const FLY_ARC_OFFSET = 10;

/** Titolo e sottotitolo di ciascun avviso (chiavi i18n = testo italiano). */
const ALERT_TEXT: Record<GpsAlertKind, [string, string]> = {
  searching: ['Ricerca del segnale GPS…', "All'aperto e lontano dagli edifici è più rapido"],
  poor: [
    'Segnale GPS debole: la posizione potrebbe essere imprecisa',
    'Se succede spesso, controlla che "Posizione esatta" sia attiva nelle impostazioni dell\'app',
  ],
  denied: [
    'La posizione non è disponibile',
    "Controlla che la localizzazione sia attiva e che l'app abbia il permesso",
  ],
  disabled: ['Attiva la localizzazione del telefono', 'Serve per vedere la tua posizione sulla mappa'],
};

/** Rettangolo relativo all'host dell'avviso. */
interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Avviso sullo stato del GPS in alto sulla mappa (oc:8766). Per il segnale debole, dopo il tempo
 * di lettura, la scheda si stringe attorno alla sua icona e vola fino al badge del bottone della
 * posizione (`anchor`); con «riduci movimento», o con il bottone nascosto, sfuma e basta.
 */
@Component({
  selector: 'webmapp-gps-alert',
  templateUrl: './gps-alert.component.html',
  styleUrls: ['./gps-alert.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, WmPipeModule, GpsSignalIconComponent],
})
export class GpsAlertComponent implements AfterViewInit, OnDestroy {
  /** Elemento del badge su cui atterra l'avviso di segnale debole. */
  @Input() anchor: HTMLElement | null = null;
  @ViewChild('card') card?: ElementRef<HTMLElement>;
  @ViewChild('icon') icon?: ElementRef<HTMLElement>;
  @ViewChild('text') text?: ElementRef<HTMLElement>;

  readonly gpsAlertSvc = inject(GpsAlertService);
  /** «Apri impostazioni» solo nell'app nativa: nel browser non c'è una pagina da aprire. */
  readonly canOpenSettings = inject(DeviceService).isAppMobile;

  kind: GpsAlertKind | null = null;
  title = '';
  subtitle = '';

  private _cdr = inject(ChangeDetectorRef);
  private _host: HTMLElement = inject(ElementRef).nativeElement;
  private _readTimer: ReturnType<typeof setTimeout> | null = null;
  private _animations: Animation[] = [];
  private _sub?: Subscription;

  /** Si iscrive agli avvisi dopo la vista, perché `_onAlert` ha bisogno di `card` per animare. */
  ngAfterViewInit(): void {
    this._sub = this.gpsAlertSvc.alert$.subscribe(kind => this._onAlert(kind));
  }

  /** Chiude l'avviso (ricerca, permesso negato o localizzazione spenta). */
  dismiss(): void {
    this.gpsAlertSvc.dismiss();
  }

  /** Apre le impostazioni dell'app sul telefono. */
  openSettings(): void {
    this.gpsAlertSvc.openSettings();
  }

  /** Chiude la sottoscrizione e annulla timer e animazioni. */
  ngOnDestroy(): void {
    this._sub?.unsubscribe();
    this._stop();
  }

  /**
   * Mostra o nasconde l'avviso e, per il segnale debole, programma la trasformazione in badge.
   * @param kind avviso da mostrare, `null` per nasconderlo
   */
  private _onAlert(kind: GpsAlertKind | null): void {
    this._stop();
    this.kind = kind;
    if (kind) [this.title, this.subtitle] = ALERT_TEXT[kind];
    this._cdr.detectChanges();
    if (kind) {
      this._play([{opacity: 0, transform: 'translate(-50%, -12px)'}, {opacity: 1, transform: 'translate(-50%, 0)'}], ENTER_MS);
    }
    if (kind === 'poor') {
      this._readTimer = setTimeout(() => {
        this._readTimer = null;
        this._toBadge();
      }, GPS_POOR_ALERT_READ_MS);
    }
  }

  /** Trasforma l'avviso di segnale debole nel badge, poi chiede al servizio di accenderlo. */
  private async _toBadge(): Promise<void> {
    const card = this.card?.nativeElement;
    const icon = this.icon?.nativeElement;
    const text = this.text?.nativeElement;
    const anchor = this.anchor;
    // l'animazione d'ingresso resta applicata (`fill: forwards`) e prevale sugli stili inline: va
    // tolta prima di misurare, altrimenti la scheda salta di metà della sua larghezza
    this._cancelAnimations();
    // bottone della posizione nascosto (per esempio col pannello di registrazione): niente volo
    const anchorHidden = !anchor || anchor.getClientRects().length === 0;
    if (!card || !icon || !text || !anchor || anchorHidden || prefersReducedMotion() || typeof card.animate !== 'function') {
      if (await this._finished(this._play([{opacity: 1}, {opacity: 0}], FADE_OUT_MS))) {
        this.gpsAlertSvc.collapse();
      }
      return;
    }

    const c = this._box(card);
    const i = this._box(icon);
    const a = this._box(anchor);
    // misure del badge d'arrivo lette dal suo CSS, così restano allineate allo stile
    const badgeStyle = getComputedStyle(anchor);
    const badgeSize = parseFloat(badgeStyle.width);
    const ring = parseFloat(badgeStyle.borderTopWidth) || 0;
    const cardStyle = getComputedStyle(card);
    const px = (v: number) => `${v}px`;
    // la scheda passa a coordinate esplicite per poter cambiare forma e posizione
    Object.assign(card.style, {left: px(c.left), top: px(c.top), width: px(c.width), height: px(c.height), transform: 'none', maxWidth: 'none'});

    // 1. il testo sfuma, l'icona resta
    if (!(await this._finished(this._run(text, [{opacity: 1}, {opacity: 0}], TEXT_FADE_MS)))) return;

    // 2. la scheda si stringe attorno all'icona
    const shrunk: Box = {left: i.left - ring, top: i.top - ring, width: i.width + ring * 2, height: i.height + ring * 2};
    const shrink = this._run(
      card,
      [
        {...this._frame(c), padding: cardStyle.padding, borderRadius: cardStyle.borderRadius},
        {...this._frame(shrunk), padding: px(ring), borderRadius: '50%'},
      ],
      SHRINK_MS,
      'cubic-bezier(.4,0,.2,1)',
    );
    if (!(await this._finished(shrink))) return;

    // 3. vola lungo un arco fino al badge, riducendosi alla sua misura
    const easing = 'cubic-bezier(.45,0,.25,1)';
    const to = {x: a.left + a.width / 2, y: a.top + a.height / 2};
    this._run(icon, [{width: px(i.width), height: px(i.height)}, {width: px(badgeSize - ring * 2), height: px(badgeSize - ring * 2)}], FLY_MS, easing);
    const fly = this._run(card, this._flightFrames(shrunk, to, badgeSize, ring), FLY_MS, easing);
    if (!(await this._finished(fly))) return;
    this.gpsAlertSvc.collapse();
  }

  /**
   * Keyframe del volo: un arco (curva quadratica) dal centro dell'icona al centro del badge,
   * con la misura che passa da quella dell'icona a quella del badge.
   * @param from rettangolo di partenza (la scheda già stretta attorno all'icona)
   * @param to centro del badge d'arrivo
   * @param size misura finale, bordo compreso
   * @param ring spessore del bordo bianco
   * @returns i keyframe dell'animazione
   */
  private _flightFrames(from: Box, to: {x: number; y: number}, size: number, ring: number): Keyframe[] {
    const start = {x: from.left + from.width / 2, y: from.top + from.height / 2};
    const ctrl = {x: to.x + FLY_ARC_OFFSET, y: start.y};
    const frames: Keyframe[] = [];
    for (let k = 0; k <= FLY_STEPS; k++) {
      const p = k / FLY_STEPS;
      const q = 1 - p;
      const x = q * q * start.x + 2 * q * p * ctrl.x + p * p * to.x;
      const y = q * q * start.y + 2 * q * p * ctrl.y + p * p * to.y;
      const s = from.width + (size - from.width) * p;
      frames.push({...this._frame({left: x - s / 2, top: y - s / 2, width: s, height: s}), padding: `${ring}px`, borderRadius: '50%', offset: p});
    }
    return frames;
  }

  /**
   * Rettangolo di un elemento relativo all'host, che è il contenitore della scheda.
   * @param el elemento da misurare
   * @returns posizione e misura relative all'host
   */
  private _box(el: HTMLElement): Box {
    const h = this._host.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {left: r.left - h.left, top: r.top - h.top, width: r.width, height: r.height};
  }

  /**
   * Proprietà di posizione e misura di un keyframe.
   * @param b rettangolo
   * @returns `left`, `top`, `width` e `height` in px
   */
  private _frame(b: Box): Keyframe {
    return {left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px`};
  }

  /**
   * Anima la scheda, salvo con «riduci movimento» (in quel caso solo l'opacità).
   * @param frames keyframe
   * @param duration durata in ms
   * @returns l'animazione, o `null` se non c'è nulla da animare
   */
  private _play(frames: Keyframe[], duration: number): Animation | null {
    const card = this.card?.nativeElement;
    if (!card || typeof card.animate !== 'function') return null;
    const used = prefersReducedMotion() ? frames.map(f => ({opacity: f.opacity})) : frames;
    return this._run(card, used, duration);
  }

  /**
   * Avvia un'animazione e la registra, per poterla annullare.
   * @param el elemento da animare
   * @param frames keyframe
   * @param duration durata in ms
   * @param easing curva di andamento
   * @returns l'animazione avviata
   */
  private _run(el: HTMLElement, frames: Keyframe[], duration: number, easing = 'ease-out'): Animation {
    const anim = el.animate(frames, {duration, easing, fill: 'forwards'});
    this._animations.push(anim);
    return anim;
  }

  /**
   * Attende la fine di un'animazione.
   * @param anim animazione, o `null`
   * @returns `false` se è stata annullata (l'avviso è cambiato nel frattempo)
   */
  private async _finished(anim: Animation | null): Promise<boolean> {
    if (!anim) return true;
    try {
      await anim.finished;
      return true;
    } catch {
      return false;
    }
  }

  /** Annulla le animazioni in corso. */
  private _cancelAnimations(): void {
    this._animations.forEach(a => a.cancel());
    this._animations = [];
  }

  /** Annulla timer e animazioni in corso e riporta la scheda al suo stile. */
  private _stop(): void {
    if (this._readTimer != null) {
      clearTimeout(this._readTimer);
      this._readTimer = null;
    }
    this._cancelAnimations();
    this.card?.nativeElement.removeAttribute('style');
  }
}
