import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

/**
 * Icona delle tacche del segnale GPS (oc:8766), condivisa da avviso e badge perché l'una si
 * trasforma nell'altro: con `full` le tre tacche sono accese, altrimenti solo la prima.
 */
@Component({
  selector: 'webmapp-gps-signal-icon',
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="15" width="4" height="6" rx="1" />
      <rect x="10" y="10" width="4" height="11" rx="1" [attr.opacity]="full ? null : 0.3" />
      <rect x="17" y="5" width="4" height="16" rx="1" [attr.opacity]="full ? null : 0.3" />
    </svg>
  `,
  styles: ['webmapp-gps-signal-icon { display: contents; }'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GpsSignalIconComponent {
  /** Segnale buono: tutte le tacche accese. */
  @Input() full = false;
}
