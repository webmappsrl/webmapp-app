import {fakeAsync, tick} from '@angular/core/testing';
import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {GpsStatus} from '@wm-core/utils/gps-status';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {DeviceService} from '@wm-core/services/device.service';
import {WmPosthogClient} from '@wm-types/posthog';
import {
  GPS_GOOD_BADGE_MS,
  GPS_SEARCHING_ALERT_DELAY_MS,
  GPS_SUSPENDED_EPISODE_MS,
  GpsAlertKind,
  GpsAlertService,
  GpsBadgeKind,
} from './gps-alert.service';

/** Regole d'interfaccia degli avvisi sullo stato del GPS (oc:8766). */
describe('GpsAlertService', () => {
  let status$: BehaviorSubject<GpsStatus>;
  let location$: ReplaySubject<{accuracy: number}>;
  let device: {isMobile: boolean};
  let posthog: jasmine.SpyObj<WmPosthogClient>;
  let geo: {gpsStatus$: BehaviorSubject<GpsStatus>; onLocationChange$: ReplaySubject<any>; openAppSettings: jasmine.Spy};
  let svc: GpsAlertService;
  let alert: GpsAlertKind | null;
  let badge: GpsBadgeKind | null;
  let pulse: boolean;

  /** Crea il servizio con un telefono o un desktop. */
  function create(isMobile = true): void {
    status$ = new BehaviorSubject<GpsStatus>('off');
    location$ = new ReplaySubject(1);
    device = {isMobile};
    posthog = jasmine.createSpyObj<WmPosthogClient>('posthog', ['capture']);
    geo = {gpsStatus$: status$, onLocationChange$: location$, openAppSettings: jasmine.createSpy('openAppSettings')};
    svc = new GpsAlertService(
      geo as unknown as GeolocationService,
      device as unknown as DeviceService,
      posthog,
    );
    svc.alert$.subscribe(v => (alert = v));
    svc.badge$.subscribe(v => (badge = v));
    svc.pulse$.subscribe(v => (pulse = v));
  }

  afterEach(() => svc?.ngOnDestroy());

  it("searching fa pulsare e mostra l'avviso dopo 8 s", fakeAsync(() => {
    create();
    status$.next('searching');
    expect(pulse).toBeTrue();
    tick(GPS_SEARCHING_ALERT_DELAY_MS - 1);
    expect(alert).toBeNull();
    tick(1);
    expect(alert).toBe('searching');
    status$.next('ok');
    expect(alert).toBeNull();
    expect(pulse).toBeFalse();
  }));

  it("l'avviso di ricerca compare una sola volta per avvio", fakeAsync(() => {
    create();
    status$.next('searching');
    tick(GPS_SEARCHING_ALERT_DELAY_MS);
    status$.next('ok');
    status$.next('off');
    status$.next('searching');
    tick(GPS_SEARCHING_ALERT_DELAY_MS);
    expect(alert).toBeNull();
    expect(pulse).toBeTrue();
  }));

  it("poor mostra l'avviso e collapse lo trasforma in badge", () => {
    create();
    status$.next('ok');
    status$.next('poor');
    expect(alert).toBe('poor');
    expect(badge).toBeNull();
    svc.collapse();
    expect(alert).toBeNull();
    expect(badge).toBe('poor');
  });

  it("un nuovo ingresso in poor con il badge acceso non rimostra l'avviso", () => {
    create();
    status$.next('poor');
    svc.collapse();
    status$.next('searching');
    status$.next('poor');
    expect(alert).toBeNull();
    expect(badge).toBe('poor');
  });

  it("l'uscita da poor accende il badge verde per 5 s, poi lo spegne", fakeAsync(() => {
    create();
    status$.next('poor');
    svc.collapse();
    status$.next('ok');
    expect(badge).toBe('good');
    tick(GPS_GOOD_BADGE_MS - 1);
    expect(badge).toBe('good');
    tick(1);
    expect(badge).toBeNull();
  }));

  it('rientrare in poor durante il badge verde riaccende il badge giallo senza avviso', fakeAsync(() => {
    create();
    status$.next('poor');
    svc.collapse();
    status$.next('ok');
    tick(1000);
    status$.next('poor');
    expect(badge).toBe('poor');
    expect(alert).toBeNull();
    tick(GPS_GOOD_BADGE_MS);
    expect(badge).toBe('poor');
  }));

  it('un riavvio del watcher durante poor non accende il verde senza prova', fakeAsync(() => {
    create();
    status$.next('poor');
    svc.collapse();
    status$.next('searching');
    status$.next('ok');
    expect(badge).toBeNull();
    tick(GPS_GOOD_BADGE_MS);
  }));

  it("un nuovo episodio di poor dopo la sparizione del badge rimostra l'avviso", fakeAsync(() => {
    create();
    status$.next('poor');
    svc.collapse();
    status$.next('ok');
    tick(GPS_GOOD_BADGE_MS);
    status$.next('poor');
    expect(alert).toBe('poor');
  }));

  it('poor su desktop non mostra nulla', () => {
    create(false);
    status$.next('poor');
    expect(alert).toBeNull();
    expect(badge).toBeNull();
  });

  it("denied mostra avviso e badge; dismiss nasconde l'avviso ma non il badge", () => {
    create();
    status$.next('denied');
    expect(alert).toBe('denied');
    expect(badge).toBe('denied');
    svc.dismiss();
    expect(alert).toBeNull();
    expect(badge).toBe('denied');
  });

  it('un denied chiuso non ricompare nello stesso avvio', () => {
    create();
    status$.next('denied');
    svc.dismiss();
    status$.next('searching');
    status$.next('denied');
    expect(alert).toBeNull();
    expect(badge).toBe('denied');
  });

  it("disabled mostra il suo avviso, indipendente da un denied chiuso", () => {
    create();
    status$.next('denied');
    svc.dismiss();
    status$.next('disabled');
    expect(alert).toBe('disabled');
    expect(badge).toBe('disabled');
  });

  it('ok e off spengono avviso, badge e pulsazione', () => {
    create();
    status$.next('denied');
    status$.next('ok');
    expect(alert).toBeNull();
    expect(badge).toBeNull();
    status$.next('searching');
    status$.next('off');
    expect(pulse).toBeFalse();
    expect(badge).toBeNull();
  });

  it("l'uscita da poor verso denied spegne il verde e mostra il badge rosso", fakeAsync(() => {
    create();
    status$.next('poor');
    svc.collapse();
    status$.next('denied');
    expect(badge).toBe('denied');
    tick(GPS_GOOD_BADGE_MS);
    expect(badge).toBe('denied');
  }));

  it('ogni avviso mostrato manda gpsAlertShown con il tipo, e con accuracy per poor', () => {
    create();
    location$.next({accuracy: 87});
    status$.next('poor');
    expect(posthog.capture).toHaveBeenCalledWith('gpsAlertShown', jasmine.objectContaining({kind: 'poor', accuracy: 87}));
    status$.next('denied');
    expect(posthog.capture).toHaveBeenCalledWith('gpsAlertShown', jasmine.objectContaining({kind: 'denied'}));
    expect(posthog.capture).toHaveBeenCalledTimes(2);
  });

  it('dopo il background, il segnale ancora debole riaccende il badge senza avviso', fakeAsync(() => {
    create();
    status$.next('poor');
    svc.collapse();
    posthog.capture.calls.reset();
    // l'app va in background (watcher fermo) e torna attiva
    status$.next('off');
    status$.next('searching');
    status$.next('ok');
    status$.next('poor');
    expect(alert).toBeNull();
    expect(badge).toBe('poor');
    expect(posthog.capture).not.toHaveBeenCalled();
    tick(GPS_SEARCHING_ALERT_DELAY_MS);
  }));

  it("dopo il background, 15 s di segnale buono chiudono l'episodio senza verde", fakeAsync(() => {
    create();
    status$.next('poor');
    svc.collapse();
    status$.next('off');
    status$.next('searching');
    status$.next('ok');
    tick(GPS_SUSPENDED_EPISODE_MS);
    expect(badge).toBeNull();
    status$.next('poor');
    expect(alert).toBe('poor');
  }));

  it('la localizzazione spenta da desktop non mostra nulla', () => {
    create(false);
    status$.next('disabled');
    expect(alert).toBeNull();
    expect(badge).toBeNull();
  });

  it("l'avviso di ricerca si può chiudere", fakeAsync(() => {
    create();
    status$.next('searching');
    tick(GPS_SEARCHING_ALERT_DELAY_MS);
    svc.dismiss();
    expect(alert).toBeNull();
    expect(pulse).toBeTrue();
  }));

  it('openSettings delega a GeolocationService.openAppSettings', () => {
    create();
    svc.openSettings();
    expect(geo.openAppSettings).toHaveBeenCalled();
  });
});
