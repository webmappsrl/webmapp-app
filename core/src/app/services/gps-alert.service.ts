import {Inject, Injectable, OnDestroy, Optional} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {DeviceService} from '@wm-core/services/device.service';
import {POSTHOG_CLIENT} from '@wm-core/store/conf/conf.token';
import {GPS_POOR_EXIT_MS, GpsStatus} from '@wm-core/utils/gps-status';
import {WmPosthogClient} from '@wm-types/posthog';

/** Avviso da mostrare sulla mappa. */
export type GpsAlertKind = 'searching' | 'poor' | 'denied' | 'disabled';
/** Badge sul bottone della posizione; `good` conferma che il segnale è tornato buono. */
export type GpsBadgeKind = 'poor' | 'good' | 'denied' | 'disabled';

/** Attesa del primo fix prima di mostrare l'avviso di ricerca. */
export const GPS_SEARCHING_ALERT_DELAY_MS = 8000;
/** Durata del badge verde dopo l'uscita dal segnale scarso. */
export const GPS_GOOD_BADGE_MS = 5000;
/**
 * Dopo un passaggio in background, per quanto un episodio di segnale scarso resta sospeso: se in
 * questo tempo il segnale torna scarso il badge riappare senza avviso. Stessa durata dell'uscita
 * da `poor`, cioè il tempo che serve per dire che il segnale è buono.
 */
export const GPS_SUSPENDED_EPISODE_MS = GPS_POOR_EXIT_MS;

/**
 * Traduce lo stato del GPS di `GeolocationService` nelle regole d'interfaccia della mappa
 * (oc:8766): quando mostrare un avviso, quando il badge, quando la pulsazione del bottone.
 * Gli eventi PostHog partono da qui e non da wm-core, così la webapp non ne manda.
 */
@Injectable({providedIn: 'root'})
export class GpsAlertService implements OnDestroy {
  private _alert$ = new BehaviorSubject<GpsAlertKind | null>(null);
  private _badge$ = new BehaviorSubject<GpsBadgeKind | null>(null);
  private _pulse$ = new BehaviorSubject<boolean>(false);
  /** L'avviso di ricerca compare al massimo una volta per avvio dell'app. */
  private _searchingShown = false;
  /** Avvisi chiusi dall'utente in questo avvio: non ricompaiono fino al prossimo. */
  private _dismissed = new Set<GpsAlertKind>();
  private _searchingTimer: ReturnType<typeof setTimeout> | null = null;
  private _goodTimer: ReturnType<typeof setTimeout> | null = null;
  private _lastAccuracy: number | null = null;
  /** Stato precedente: il verde conferma solo un'uscita da `poor`, non un riavvio del watcher. */
  private _prevStatus: GpsStatus = 'off';
  /** Episodio di segnale scarso interrotto da un passaggio in background. */
  private _suspendedEpisode = false;
  private _suspendedTimer: ReturnType<typeof setTimeout> | null = null;
  private _subs = new Subscription();

  readonly alert$: Observable<GpsAlertKind | null> = this._alert$.pipe(distinctUntilChanged());
  readonly badge$: Observable<GpsBadgeKind | null> = this._badge$.pipe(distinctUntilChanged());
  readonly pulse$: Observable<boolean> = this._pulse$.pipe(distinctUntilChanged());

  constructor(
    private _geolocationSvc: GeolocationService,
    private _deviceSvc: DeviceService,
    @Optional() @Inject(POSTHOG_CLIENT) private _posthogClient: WmPosthogClient | null,
  ) {
    this._subs.add(
      this._geolocationSvc.onLocationChange$.subscribe(l => (this._lastAccuracy = l?.accuracy ?? null)),
    );
    this._subs.add(
      this._geolocationSvc.gpsStatus$.pipe(distinctUntilChanged()).subscribe(s => this._onStatus(s)),
    );
  }

  /** Fine dell'animazione dell'avviso di segnale scarso: l'avviso diventa il badge. */
  collapse(): void {
    if (this._alert$.value !== 'poor') return;
    this._alert$.next(null);
    this._badge$.next('poor');
  }

  /** L'utente chiude l'avviso di ricerca, di permesso negato o di localizzazione spenta. */
  dismiss(): void {
    const kind = this._alert$.value;
    if (kind !== 'searching' && kind !== 'denied' && kind !== 'disabled') return;
    this._dismissed.add(kind);
    this._alert$.next(null);
  }

  /** Apre le impostazioni dell'app sul telefono. */
  openSettings(): void {
    this._geolocationSvc.openAppSettings();
  }

  /** Chiude le sottoscrizioni e i timer. */
  ngOnDestroy(): void {
    this._subs.unsubscribe();
    this._clearSearchingTimer();
    this._clearGoodTimer();
    this._clearSuspendedEpisode();
  }

  /**
   * Applica le regole d'interfaccia a un nuovo stato del GPS.
   * @param status nuovo stato del GPS
   */
  private _onStatus(status: GpsStatus): void {
    this._clearSearchingTimer();
    this._pulse$.next(status === 'searching');
    const alert = this._alert$.value;
    const badge = this._badge$.value;
    // un episodio di segnale scarso è in corso se l'avviso o il badge giallo sono visibili
    const poorEpisode = alert === 'poor' || badge === 'poor';

    // un avviso vale solo per lo stato che l'ha generato
    if (alert != null && alert !== status) this._alert$.next(null);
    // il verde vale solo finché si resta in `ok`
    if (status !== 'ok') this._clearGoodTimer();

    switch (status) {
      case 'searching':
        if (badge === 'denied' || badge === 'disabled' || badge === 'good') this._badge$.next(null);
        if (!this._searchingShown) {
          this._searchingTimer = setTimeout(() => {
            this._searchingTimer = null;
            this._searchingShown = true;
            this._show('searching');
          }, GPS_SEARCHING_ALERT_DELAY_MS);
        }
        break;
      case 'ok':
        if (poorEpisode && this._prevStatus === 'poor') {
          this._showGoodBadge();
        } else {
          if (badge != null && badge !== 'good') this._badge$.next(null);
          // primo fix dopo un rientro: l'episodio sospeso resta valido ancora per un po'
          if (this._suspendedEpisode && this._prevStatus === 'searching') this._expireSuspendedEpisode();
        }
        break;
      case 'poor':
        if (!this._deviceSvc.isMobile) break;
        if (badge === 'poor' || badge === 'good' || this._suspendedEpisode) {
          // rientro durante l'episodio, anche dopo un passaggio in background: niente avviso
          this._clearSuspendedEpisode();
          this._badge$.next('poor');
        } else if (alert !== 'poor') {
          this._badge$.next(null);
          this._show('poor');
        }
        break;
      case 'denied':
      case 'disabled':
        this._clearSuspendedEpisode();
        // da desktop la «localizzazione del telefono» non ha senso, e la posizione del browser
        // può mancare per motivi che l'utente non controlla: come per `poor`, solo sui telefoni
        if (status === 'disabled' && !this._deviceSvc.isMobile) break;
        this._badge$.next(status);
        if (!this._dismissed.has(status) && alert !== status) this._show(status);
        break;
      case 'off':
        // watcher fermo (background, impostazioni): un episodio in corso resta sospeso, così al
        // rientro non si ripresenta l'avviso a ogni sblocco del telefono
        if (poorEpisode) this._suspendedEpisode = true;
        this._alert$.next(null);
        this._badge$.next(null);
        break;
    }
    this._prevStatus = status;
  }

  /** Badge verde di conferma, che si spegne da solo. */
  private _showGoodBadge(): void {
    this._badge$.next('good');
    this._goodTimer = setTimeout(() => {
      this._goodTimer = null;
      this._badge$.next(null);
    }, GPS_GOOD_BADGE_MS);
  }

  /** Chiude l'episodio sospeso se il segnale resta buono abbastanza a lungo dopo il rientro. */
  private _expireSuspendedEpisode(): void {
    if (this._suspendedTimer != null) return;
    this._suspendedTimer = setTimeout(() => {
      this._suspendedTimer = null;
      this._suspendedEpisode = false;
    }, GPS_SUSPENDED_EPISODE_MS);
  }

  /** Dimentica l'episodio sospeso e il suo timer. */
  private _clearSuspendedEpisode(): void {
    this._suspendedEpisode = false;
    if (this._suspendedTimer != null) {
      clearTimeout(this._suspendedTimer);
      this._suspendedTimer = null;
    }
  }

  /**
   * Mostra un avviso e registra l'evento PostHog.
   * @param kind tipo di avviso
   */
  private _show(kind: GpsAlertKind): void {
    this._alert$.next(kind);
    const props: Record<string, any> = {kind};
    if (kind === 'poor' && this._lastAccuracy != null) props.accuracy = this._lastAccuracy;
    this._posthogClient?.capture('gpsAlertShown', props);
  }

  /** Cancella il timer dell'avviso di ricerca, se attivo. */
  private _clearSearchingTimer(): void {
    if (this._searchingTimer != null) {
      clearTimeout(this._searchingTimer);
      this._searchingTimer = null;
    }
  }

  /** Cancella il timer del badge verde, se attivo. */
  private _clearGoodTimer(): void {
    if (this._goodTimer != null) {
      clearTimeout(this._goodTimer);
      this._goodTimer = null;
    }
  }
}
