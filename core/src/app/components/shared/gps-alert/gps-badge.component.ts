import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {GpsBadgeKind} from 'src/app/services/gps-alert.service';
import {prefersReducedMotion} from 'src/app/functions/prefers-reduced-motion';
import {GpsSignalIconComponent} from './gps-signal-icon.component';

/** Testo per gli screen reader di ciascun badge. */
const BADGE_LABEL: Record<GpsBadgeKind, string> = {
  poor: 'Segnale GPS debole',
  good: 'Segnale GPS tornato buono',
  denied: 'La posizione non è disponibile',
  disabled: 'Attiva la localizzazione del telefono',
};

/**
 * Badge dello stato del GPS sul bottone della posizione (oc:8766): tacche del segnale su giallo
 * (scarso) o su verde (tornato buono), «×» su rosso (permesso negato o localizzazione spenta).
 * Resta nel DOM anche spento, perché l'avviso animato usa la sua posizione come punto d'arrivo.
 */
@Component({
  selector: 'webmapp-gps-badge',
  template: `
    <ng-container [ngSwitch]="shown">
      <webmapp-gps-signal-icon *ngSwitchCase="'poor'"></webmapp-gps-signal-icon>
      <webmapp-gps-signal-icon *ngSwitchCase="'good'" [full]="true"></webmapp-gps-signal-icon>
      <svg *ngSwitchDefault viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true">
        <path d="M7 7l10 10M17 7L7 17" />
      </svg>
    </ng-container>
    <span class="webmapp-gps-sr" *ngIf="kind">{{ label | wmtrans }}</span>
  `,
  styleUrls: ['./gps-badge.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, WmPipeModule, GpsSignalIconComponent],
  host: {
    'class': 'webmapp-gps-badge',
    '[class.webmapp-gps-badge-on]': 'kind != null',
    '[attr.data-kind]': 'shown',
    '[attr.aria-hidden]': 'kind == null',
  },
})
export class GpsBadgeComponent implements OnChanges, OnDestroy {
  /** Badge da mostrare; `null` lo spegne. */
  @Input() kind: GpsBadgeKind | null = null;

  /** Elemento del badge, usato come punto d'arrivo dell'animazione dell'avviso. */
  readonly el: HTMLElement = inject(ElementRef).nativeElement;
  /** Badge disegnato: durante lo spegnimento resta l'ultimo, finché l'animazione non finisce. */
  shown: GpsBadgeKind | null = null;
  label = '';

  private _cdr = inject(ChangeDetectorRef);
  private _destroyed = false;

  /**
   * Accende, cambia o spegne il badge con una piccola animazione.
   * @param changes cambi degli input
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.kind) return;
    const prev: GpsBadgeKind | null = changes.kind.previousValue ?? null;
    const next = this.kind;
    if (next != null) {
      this.shown = next;
      this.label = BADGE_LABEL[next];
      if (prev !== next) this._animate([{transform: 'scale(0)'}, {transform: 'scale(1.35)'}, {transform: 'scale(1)'}], 260);
    } else if (prev != null) {
      const anim = this._animate([{transform: 'scale(1)', opacity: 1}, {transform: 'scale(0)', opacity: 0}], 220);
      const off = () => {
        // se nel frattempo è arrivato un altro badge, o la vista non c'è più, non c'è nulla da fare
        if (this.kind != null || this._destroyed) return;
        this.shown = null;
        this._cdr.detectChanges();
      };
      if (anim) anim.onfinish = off;
      else off();
    }
  }

  /** Segna la vista come distrutta, per le animazioni che finiscono dopo. */
  ngOnDestroy(): void {
    this._destroyed = true;
  }

  /**
   * Esegue un'animazione sul badge, salvo con «riduci movimento» attivo.
   * @param frames keyframe dell'animazione
   * @param duration durata in ms
   * @returns l'animazione avviata, o `null` se saltata
   */
  private _animate(frames: Keyframe[], duration: number): Animation | null {
    if (typeof this.el.animate !== 'function') return null;
    if (prefersReducedMotion()) return null;
    return this.el.animate(frames, {duration, easing: 'ease-out'});
  }
}
