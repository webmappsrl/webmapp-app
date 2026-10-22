import {CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ModalController, NavController} from '@ionic/angular';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {BehaviorSubject, of, ReplaySubject} from 'rxjs';
import {Location} from '@wm-types/feature';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {GeoutilsService} from '@wm-core/services/geoutils.service';
import {UgcTrackStatsService} from '@wm-core/services/ugc-track-stats.service';
import {confTRACKFORMS} from '@wm-core/store/conf/conf.selector';
import {
  mapDetailsStatus,
  onRecord,
  trackLiveDistanceVm,
  TrackLiveDistanceVm,
} from '@wm-core/store/user-activity/user-activity.selector';
import {RecorderPanelLayoutService} from 'src/app/services/recorder-panel-layout.service';
import {TrackRecorderComponent} from './track-recorder.component';

/** Sostituto di `wmtrans`: il pipe vero richiede le traduzioni in DI. */
@Pipe({name: 'wmtrans', standalone: false})
class FakeTransPipe implements PipeTransform {
  /**
   * Restituisce la chiave così com'è.
   * @param v chiave di traduzione
   * @returns la chiave
   */
  transform(v: string): string {
    return v;
  }
}

const NO_DISTANCE: TrackLiveDistanceVm = {distanceCovered: null, remainingDistance: null, stale: false};

/** Plancia di registrazione: bottone indietro, riduzione, posizione pubblicata. */
describe('TrackRecorderComponent', () => {
  let fixture: ComponentFixture<TrackRecorderComponent>;
  let cmp: TrackRecorderComponent;
  let store: MockStore;
  let geolocation: jasmine.SpyObj<GeolocationService>;
  let kept$: BehaviorSubject<Location[]>;

  /**
   * Crea il componente con lo stato di registrazione indicato.
   * @param recording valore del selettore `onRecord`
   * @param distance valore del selettore `trackLiveDistanceVm`
   * @param initialKept punti tenuti già presenti all'iscrizione
   */
  async function setup(
    recording: boolean,
    distance: TrackLiveDistanceVm = NO_DISTANCE,
    initialKept: Location[] = [],
  ): Promise<void> {
    kept$ = new BehaviorSubject<Location[]>(initialKept);
    geolocation = jasmine.createSpyObj<GeolocationService>(
      'GeolocationService',
      ['startRecording', 'stopRecording', 'pauseRecording', 'resumeRecording'],
      {
        onLocationChange$: new ReplaySubject<any>(1),
        paused: false,
        recordedFeature: null,
        recordedKeptLocations$: kept$,
      },
    );
    await TestBed.configureTestingModule({
      declarations: [TrackRecorderComponent, FakeTransPipe],
      imports: [CommonModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            {selector: onRecord, value: recording},
            {selector: trackLiveDistanceVm, value: distance},
            {selector: confTRACKFORMS, value: []},
            {selector: mapDetailsStatus, value: 'background'},
          ],
        }),
        {provide: GeolocationService, useValue: geolocation},
        {provide: GeoutilsService, useValue: {}},
        {provide: UgcTrackStatsService, useValue: {params$: of(null)}},
        {provide: ModalController, useValue: jasmine.createSpyObj('ModalController', ['create'])},
        {provide: NavController, useValue: {}},
      ],
    }).compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(TrackRecorderComponent);
    cmp = fixture.componentInstance;
    fixture.detectChanges();
  }

  /**
   * Primo elemento che corrisponde al selettore nel template.
   * @param selector selettore CSS
   * @returns l'elemento o `null`
   */
  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  describe('plancia riducibile', () => {
    let layout: RecorderPanelLayoutService;
    let observers: FakeResizeObserver[];
    const realResizeObserver = window.ResizeObserver;

    /** `ResizeObserver` finto: la callback parte solo quando il test chiama `trigger()`. */
    class FakeResizeObserver {
      targets: Element[] = [];

      /** @param cb callback da invocare */
      constructor(private _cb: ResizeObserverCallback) {
        observers.push(this);
      }

      /** @param el elemento osservato */
      observe(el: Element): void {
        this.targets.push(el);
      }

      /** @param el elemento non più osservato */
      unobserve(el: Element): void {
        this.targets = this.targets.filter(t => t !== el);
      }

      /** Smette di osservare tutto. */
      disconnect(): void {
        this.targets = [];
      }

      /** Invoca la callback come farebbe il browser. */
      trigger(): void {
        this._cb([], this as unknown as ResizeObserver);
      }
    }

    /**
     * Fa misurare all'elemento il bordo inferiore indicato.
     * @param el elemento
     * @param bottom bordo inferiore in px
     */
    function fakeBottom(el: HTMLElement | null, bottom: number): void {
      spyOn(el as HTMLElement, 'getBoundingClientRect').and.returnValue({bottom} as DOMRect);
    }

    /** Invoca le callback di tutti gli observer creati. */
    function resize(): void {
      observers.forEach(o => o.trigger());
    }

    /**
     * Prepara la plancia con il servizio vero sotto spia.
     * @param recording valore di `onRecord`
     */
    async function setupLayout(recording: boolean): Promise<void> {
      observers = [];
      (window as any).ResizeObserver = FakeResizeObserver;
      await setup(recording);
      layout = TestBed.inject(RecorderPanelLayoutService);
      spyOn(layout, 'setPanelBottom').and.callThrough();
    }

    afterEach(() => {
      (window as any).ResizeObserver = realResizeObserver;
    });

    it('pubblica il bordo della plancia aperta', async () => {
      await setupLayout(true);
      fakeBottom(query('ion-card'), 180);
      resize();
      expect(layout.setPanelBottom).toHaveBeenCalledWith(180);
    });

    it('non pubblica nulla prima della registrazione', async () => {
      await setupLayout(false);
      fakeBottom(query('ion-card'), 180);
      resize();
      expect(layout.setPanelBottom).not.toHaveBeenCalledWith(180);
      expect((layout.setPanelBottom as jasmine.Spy).calls.mostRecent().args).toEqual([null]);
    });

    it('ridotta pubblica il bordo della linguetta', async () => {
      await setupLayout(true);
      const done = cmp.minimize();
      fakeBottom(query('.wm-recorder-mini'), 115);
      document.getAnimations().forEach(a => a.finish());
      await done;
      resize();
      expect((layout.setPanelBottom as jasmine.Spy).calls.mostRecent().args).toEqual([115]);
      expect(query('.wm-recorder-mini')).not.toBeNull();
      expect(query('ion-card')?.classList).toContain('wm-recorder-card-hidden');
    });

    it('riaperta torna a pubblicare il bordo', async () => {
      await setupLayout(true);
      fakeBottom(query('ion-card'), 180);
      const minimizing = cmp.minimize();
      document.getAnimations().forEach(a => a.finish());
      await minimizing;
      const expanding = cmp.expand();
      document.getAnimations().forEach(a => a.finish());
      await expanding;
      resize();
      expect((layout.setPanelBottom as jasmine.Spy).calls.mostRecent().args).toEqual([180]);
      expect(query('.wm-recorder-mini')).toBeNull();
    });

    it('reset azzera ridotto e posizione', async () => {
      await setupLayout(true);
      cmp.minimize();
      cmp.reset();
      expect(cmp.minimized).toBeFalse();
      expect((layout.setPanelBottom as jasmine.Spy).calls.mostRecent().args).toEqual([null]);
    });

    it('il tempo continua da ridotta', async () => {
      await setupLayout(true);
      // OnPush: nell'app ridisegna il timer con `_cdr.detectChanges()`; qui lo fa `minimize()`
      cmp.time = {hours: 0, minutes: 1, seconds: 54};
      cmp.minimize();
      expect(query('.wm-recorder-mini')?.textContent).toContain('00:01:54');
    });
  });

  describe('contenuto della linguetta', () => {
    /**
     * Prepara la plancia in registrazione e la riduce.
     * @param distance distanze della traccia selezionata
     * @param prepare modifiche allo stato prima della riduzione
     */
    async function minimized(distance: TrackLiveDistanceVm, prepare?: () => void): Promise<HTMLElement> {
      await setup(true, distance);
      prepare?.();
      cmp.minimize();
      return query('.wm-recorder-mini') as HTMLElement;
    }

    it("mostra la distanza dall'arrivo con una traccia", async () => {
      const mini = await minimized({distanceCovered: 1200, remainingDistance: 7100, stale: false});
      const badge = mini.querySelector('wm-track-live-distance-badge') as any;
      expect(badge).not.toBeNull();
      expect(badge.distanceMeters).toBe(7100);
      expect(mini.querySelector('.wm-recorder-mini-to')).not.toBeNull();
    });

    it('passa ai km percorsi senza traccia', async () => {
      const mini = await minimized(NO_DISTANCE, () => (cmp.length = 6.3));
      expect(mini.querySelector('wm-track-live-distance-badge')).toBeNull();
      expect(mini.textContent).toContain('6.30');
      expect(mini.querySelector('.wm-recorder-mini-odo')).not.toBeNull();
    });

    it("con il testo ingrandito tronca l'etichetta e non il valore", async () => {
      const mini = await minimized({distanceCovered: 1200, remainingDistance: 7100, stale: false});
      // gli stili calcolati valgono solo per un elemento attaccato al documento, e quelli della
      // plancia sono annidati sotto `wm-track-recorder`, mentre l'host di TestBed è un div
      const wrapper = document.body.appendChild(document.createElement('wm-track-recorder'));
      wrapper.appendChild(fixture.nativeElement);
      mini.style.fontSize = '40px';
      mini.querySelectorAll<HTMLElement>('*').forEach(el => (el.style.fontSize = '40px'));
      const box = mini.getBoundingClientRect();
      const badge = (mini.querySelector('wm-track-live-distance-badge') as HTMLElement).getBoundingClientRect();
      expect(getComputedStyle(mini).overflowX).toBe('hidden');
      expect(badge.right).toBeLessThanOrEqual(box.right + 0.5);
      expect(getComputedStyle(mini.querySelector('.wm-recorder-mini-label') as HTMLElement).textOverflow).toBe('ellipsis');
      wrapper.remove();
    });

    it('niente barretta di presa', async () => {
      const mini = await minimized(NO_DISTANCE);
      expect(mini.querySelector('.wm-recorder-mini-grip')).toBeNull();
    });

    it('segnala la posizione vecchia', async () => {
      const mini = await minimized({distanceCovered: 1200, remainingDistance: 7100, stale: true});
      expect((mini.querySelector('wm-track-live-distance-badge') as any).stale).toBeTrue();
    });

    it('in pausa cambia aspetto', async () => {
      const mini = await minimized({distanceCovered: 1200, remainingDistance: 7100, stale: false}, () => (cmp.isPaused = true));
      expect(mini.classList).toContain('wm-recorder-mini-paused');
      expect(mini.textContent).toContain('In pausa');
      expect(mini.querySelector('wm-track-live-distance-badge')).toBeNull();
    });
  });

  describe('informazione a scelta sulla linguetta', () => {
    const WITH_TRACK: TrackLiveDistanceVm = {distanceCovered: 1200, remainingDistance: 7100, stale: false};

    /**
     * Prepara la linguetta in registrazione.
     * @param distance distanze della traccia selezionata
     * @returns la linguetta
     */
    async function tab(distance: TrackLiveDistanceVm): Promise<HTMLElement> {
      await setup(true, distance);
      cmp.minimize();
      return query('.wm-recorder-mini') as HTMLElement;
    }

    /**
     * Trascina in verticale sulla linguetta.
     * @param el linguetta
     * @param dy spostamento (negativo verso l'alto)
     */
    function drag(el: HTMLElement, dy: number): void {
      el.dispatchEvent(new PointerEvent('pointerdown', {clientX: 300, clientY: 100, bubbles: true}));
      el.dispatchEvent(new PointerEvent('pointerup', {clientX: 300, clientY: 100 + dy, bubbles: true}));
      fixture.detectChanges();
    }

    /**
     * Cambia la traccia selezionata durante la registrazione.
     * @param distance nuove distanze
     */
    function selectTrack(distance: TrackLiveDistanceVm): void {
      store.overrideSelector(trackLiveDistanceVm, distance);
      store.refreshState();
      fixture.detectChanges();
    }

    /** @returns quanti puntini mostra la linguetta */
    function steps(): number {
      return fixture.nativeElement.querySelectorAll('.wm-recorder-mini-dot-step').length;
    }

    it('con una traccia parte da Arrivo', async () => {
      await tab(WITH_TRACK);
      expect(cmp.miniInfo).toBe('to');
      expect(steps()).toBe(5);
    });

    it('senza traccia parte dai km percorsi', async () => {
      await tab(NO_DISTANCE);
      expect(cmp.miniInfo).toBe('odo');
      expect(steps()).toBe(3);
    });

    it("scorrere verso l'alto passa alla successiva", async () => {
      const mini = await tab(WITH_TRACK);
      drag(mini, -30);
      expect(cmp.miniInfo).toBe('from');
      expect(query('.wm-recorder-mini-dot-step-on')).toBe(fixture.nativeElement.querySelectorAll('.wm-recorder-mini-dot-step')[1]);
    });

    it('scorrere verso il basso torna alla precedente', async () => {
      const mini = await tab(WITH_TRACK);
      drag(mini, -30);
      drag(mini, -30);
      drag(mini, 30);
      expect(cmp.miniInfo).toBe('from');
    });

    it("si ferma alla prima e all'ultima", async () => {
      const mini = await tab(NO_DISTANCE);
      drag(mini, 30);
      expect(cmp.miniInfo).toBe('odo');
      drag(mini, -30);
      drag(mini, -30);
      drag(mini, -30);
      expect(cmp.miniInfo).toBe('average');
    });

    it('uno scorrimento breve non cambia informazione', async () => {
      const mini = await tab(WITH_TRACK);
      drag(mini, -12);
      expect(cmp.miniInfo).toBe('to');
    });

    it('uno scorrimento non riapre la plancia', async () => {
      const mini = await tab(WITH_TRACK);
      spyOn(cmp, 'expand');
      drag(mini, -30);
      mini.click();
      expect(cmp.expand).not.toHaveBeenCalled();
    });

    it('un tocco riapre la plancia', async () => {
      const mini = await tab(WITH_TRACK);
      spyOn(cmp, 'expand');
      drag(mini, 3);
      mini.click();
      expect(cmp.expand).toHaveBeenCalled();
    });

    it('la scelta sopravvive a riduci e riapri', async () => {
      const mini = await tab(WITH_TRACK);
      drag(mini, -30);
      const expanded = cmp.expand();
      document.getAnimations().filter(a => a.effect?.getComputedTiming().endTime !== Infinity).forEach(a => a.finish());
      await expanded;
      cmp.minimize();
      expect(cmp.miniInfo).toBe('from');
    });

    it('una nuova registrazione riparte dalla predefinita', async () => {
      const mini = await tab(WITH_TRACK);
      drag(mini, -30);
      cmp.reset();
      expect(cmp.miniInfo).toBe('to');
    });

    it('selezionare una traccia porta ad Arrivo', async () => {
      const mini = await tab(NO_DISTANCE);
      drag(mini, -30);
      selectTrack(WITH_TRACK);
      expect(cmp.miniInfo).toBe('to');
    });

    it('togliere la traccia da Partenza porta ai km percorsi', async () => {
      const mini = await tab(WITH_TRACK);
      drag(mini, -30);
      selectTrack(NO_DISTANCE);
      expect(cmp.miniInfo).toBe('odo');
    });

    it('Velocità resta Velocità quando la traccia viene tolta', async () => {
      const mini = await tab(WITH_TRACK);
      drag(mini, -30);
      drag(mini, -30);
      drag(mini, -30);
      selectTrack(NO_DISTANCE);
      expect(cmp.miniInfo).toBe('speed');
    });

    it("in pausa lo scorrimento non cambia l'informazione", async () => {
      await setup(true, WITH_TRACK);
      cmp.isPaused = true;
      cmp.minimize();
      drag(query('.wm-recorder-mini') as HTMLElement, -30);
      expect(cmp.miniInfo).toBe('to');
    });

    it('mostra velocità e media con «—» se mancano', async () => {
      await setup(true, NO_DISTANCE);
      cmp.actualSpeed = 4.2;
      cmp.averageSpeed = null;
      cmp.minimize();
      expect((query('.wm-recorder-mini-speed') as HTMLElement).textContent).toContain('4');
      expect((query('.wm-recorder-mini-average') as HTMLElement).textContent).toContain('—');
    });

    it("l'etichetta sta sopra il valore", async () => {
      const mini = await tab(WITH_TRACK);
      const wrapper = document.body.appendChild(document.createElement('wm-track-recorder'));
      wrapper.appendChild(fixture.nativeElement);
      document.getAnimations().filter(a => a.effect?.getComputedTiming().endTime !== Infinity).forEach(a => a.finish());
      const item = mini.querySelector('.wm-recorder-mini-to') as HTMLElement;
      const label = (item.querySelector('.wm-recorder-mini-label') as HTMLElement).getBoundingClientRect();
      const value = (item.querySelector('.wm-recorder-mini-value') as HTMLElement).getBoundingClientRect();
      wrapper.remove();
      expect(label.bottom).toBeLessThanOrEqual(value.top + 0.5);
    });
  });

  describe('transizione', () => {
    let layout: RecorderPanelLayoutService;

    beforeEach(async () => {
      await setup(true);
      layout = TestBed.inject(RecorderPanelLayoutService);
      spyOn(layout, 'setPanelBottom').and.callThrough();
    });

    /** Porta a termine le animazioni in corso: in Chrome headless senza focus non avanzano. */
    function finishAnimations(): void {
      document.getAnimations().forEach(a => a.finish());
    }

    it('la riduzione anima la linguetta e pubblica a fine animazione', async () => {
      const done = cmp.minimize();
      const mini = query('.wm-recorder-mini') as HTMLElement;
      expect(mini.getAnimations().length).toBeGreaterThan(0);
      expect(layout.setPanelBottom).not.toHaveBeenCalled();
      finishAnimations();
      await done;
      expect((layout.setPanelBottom as jasmine.Spy).calls.mostRecent().args).toEqual([mini.getBoundingClientRect().bottom]);
    });

    it("durante la transizione un ridimensionamento non sposta l'avviso", async () => {
      const done = cmp.minimize();
      (cmp as any)._onResize();
      expect(layout.setPanelBottom).not.toHaveBeenCalled();
      finishAnimations();
      await done;
      (cmp as any)._onResize();
      expect(layout.setPanelBottom).toHaveBeenCalled();
    });

    it('la riapertura anima la plancia', async () => {
      const minimizing = cmp.minimize();
      finishAnimations();
      await minimizing;
      const done = cmp.expand();
      expect((query('ion-card') as HTMLElement).getAnimations().length).toBeGreaterThan(0);
      finishAnimations();
      await done;
      expect(query('.wm-recorder-mini')).toBeNull();
    });

    it('con riduci movimento non anima la forma', async () => {
      spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);
      await cmp.minimize();
      const mini = query('.wm-recorder-mini') as HTMLElement;
      const transforms = mini.getAnimations().filter(a => {
        const frames = (a.effect as KeyframeEffect).getKeyframes();
        return frames.some(f => f['transform'] && f['transform'] !== 'none');
      });
      expect(transforms.length).toBe(0);
      expect(layout.setPanelBottom).toHaveBeenCalled();
    });
  });

  describe('plancia aperta', () => {
    const WITH_TRACK: TrackLiveDistanceVm = {distanceCovered: 1200, remainingDistance: 7100, stale: false};

    it("su uno schermo stretto la velocità media non finisce sopra il tempo", async () => {
      await setup(true);
      cmp.isPaused = true;
      cmp.averageSpeed = 59774.3;
      cmp.time = {hours: 2, minutes: 7, seconds: 12};
      (cmp as any)._cdr.detectChanges(); // OnPush: nell'app ridisegna il timer
      // larghezza di un iPhone SE; gli stili della plancia sono annidati sotto `wm-track-recorder`
      const wrapper = document.body.appendChild(document.createElement('wm-track-recorder'));
      Object.assign(wrapper.style, {position: 'relative', display: 'block', width: '320px', height: '400px'});
      wrapper.appendChild(fixture.nativeElement);
      const card = (query('ion-card') as HTMLElement).getBoundingClientRect();
      const time = (query('.wm-recorder-time') as HTMLElement).getBoundingClientRect();
      const average = (query('.wm-recorder-average') as HTMLElement).getBoundingClientRect();
      wrapper.remove();
      expect(time.right).toBeLessThanOrEqual(average.left + 0.5);
      expect(average.right).toBeLessThanOrEqual(card.right + 0.5);
    });

    it('con il dettaglio aperto lascia libero il bottone indietro', async () => {
      await setup(true);
      fixture.componentRef.setInput('detailsOpen', true);
      fixture.detectChanges();
      const wrapper = document.body.appendChild(document.createElement('wm-track-recorder'));
      Object.assign(wrapper.style, {position: 'relative', display: 'block', width: '320px', height: '400px'});
      wrapper.appendChild(fixture.nativeElement);
      const left = (query('ion-card') as HTMLElement).getBoundingClientRect().left - wrapper.getBoundingClientRect().left;
      wrapper.remove();
      // bottone indietro di map-details: 16px dal bordo, fab small da 40px, più 8px di spazio
      expect(left).toBeGreaterThanOrEqual(64);
    });

    it('con il dettaglio chiuso resta larga', async () => {
      await setup(true);
      const wrapper = document.body.appendChild(document.createElement('wm-track-recorder'));
      Object.assign(wrapper.style, {position: 'relative', display: 'block', width: '320px', height: '400px'});
      wrapper.appendChild(fixture.nativeElement);
      const left = (query('ion-card') as HTMLElement).getBoundingClientRect().left - wrapper.getBoundingClientRect().left;
      wrapper.remove();
      expect(left).toBeLessThan(20);
    });

    it("il bottone riduci punta all'angolo della linguetta", async () => {
      await setup(true);
      const btn = query('[e2e-recorder-minimize-btn]') as HTMLElement;
      expect(btn.querySelector('ion-icon[name="contract-outline"]')).toBeNull();
      expect(btn.querySelector('svg path')?.getAttribute('d')).toBe('M7 17L17 7M9 7h8v8');
    });

    it('bottoni e tempo più piccoli, con l\'area di tocco da 44px', async () => {
      await setup(true);
      const wrapper = document.body.appendChild(document.createElement('wm-track-recorder'));
      Object.assign(wrapper.style, {position: 'relative', display: 'block', width: '390px', height: '400px'});
      wrapper.appendChild(fixture.nativeElement);
      const btn = query('[e2e-recorder-stop-btn]') as HTMLElement;
      const box = btn.getBoundingClientRect();
      const timeSize = parseFloat(getComputedStyle(query('.wm-recorder-time') as HTMLElement).fontSize);
      // 2px fuori dal cerchio, a metà altezza: il tocco arriva ancora al bottone
      const outside = document.elementFromPoint(box.left - 1.5, box.top + box.height / 2);
      wrapper.remove();
      expect(box.width).toBe(40);
      expect(box.height).toBe(40);
      expect(timeSize).toBeLessThanOrEqual(26);
      expect(btn.contains(outside)).toBeTrue();
    });

    it('conserva i comandi', async () => {
      await setup(true);
      ['e2e-recorder-pause-btn', 'e2e-recorder-stop-btn', 'e2e-recorder-waypoint-btn', 'e2e-recorder-minimize-btn'].forEach(attr =>
        expect(query(`[${attr}]`)).withContext(attr).not.toBeNull(),
      );
    });

    it('in pausa mostra riprendi al posto di pausa', async () => {
      await setup(true);
      cmp.isPaused = true;
      cmp.minimize();
      const expanded = cmp.expand();
      // in headless le animazioni non avanzano sempre: si chiudono per non dipendere dal tempo
      document.getAnimations().forEach(a => a.finish());
      await expanded;
      expect(query('[e2e-recorder-resume-btn]')).not.toBeNull();
      expect(query('[e2e-recorder-pause-btn]')).toBeNull();
    });

    it('mostra partenza e arrivo con una traccia', async () => {
      await setup(true, WITH_TRACK);
      expect(fixture.nativeElement.querySelectorAll('ion-card wm-track-live-distance-badge').length).toBe(2);
    });

    it("mostra l'avanzamento sulla traccia", async () => {
      await setup(true, WITH_TRACK);
      const fill = query('.wm-recorder-progress-fill') as HTMLElement;
      expect(fill).not.toBeNull();
      expect(parseFloat(fill.style.width)).toBeCloseTo((1200 / 8300) * 100, 1);
    });

    it('senza traccia niente barra di avanzamento', async () => {
      await setup(true);
      expect(query('.wm-recorder-progress')).toBeNull();
      expect(query('ion-card wm-track-live-distance-badge')).toBeNull();
    });
  });

  describe('riduzione automatica', () => {
    const T0 = new Date(2026, 9, 22, 10, 0, 0);
    let minimize: jasmine.Spy;
    let pts: Location[];

    /**
     * Punto a una certa distanza verso nord da un'origine fissa.
     * @param metersNorth metri a nord dell'origine
     * @param time ora del punto, usata per riconoscere un punto nuovo
     * @param accuracy accuratezza dichiarata (m)
     * @returns il punto
     */
    function point(metersNorth: number, time: number, accuracy = 5): Location {
      return {latitude: 43.7 + metersNorth / 111195, longitude: 10.4, accuracy, time};
    }

    /**
     * Aggiunge un punto tenuto ed emette l'elenco, come fa la pulizia GPS.
     * @param p il punto
     */
    function keep(p: Location): void {
      pts = [...pts, p];
      kept$.next(pts);
    }

    /**
     * Crea il componente con l'orologio finto e la riduzione spiata.
     * @param recording registrazione attiva
     * @param initialKept punti già presenti all'iscrizione
     */
    async function start(recording = true, initialKept: Location[] = []): Promise<void> {
      pts = [...initialKept];
      await setup(recording, NO_DISTANCE, initialKept);
      minimize = spyOn(cmp, 'minimize').and.resolveTo();
    }

    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(T0);
    });

    afterEach(() => jasmine.clock().uninstall());

    it('riduce dopo 15 s e 20 m', async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(15000);
      keep(point(21, 2));
      expect(minimize).toHaveBeenCalledTimes(1);
    });

    it('non riduce prima di 15 s', async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(14000);
      keep(point(21, 2));
      expect(minimize).not.toHaveBeenCalled();
    });

    it('non riduce sotto i 20 m', async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(15000);
      keep(point(19, 2));
      expect(minimize).not.toHaveBeenCalled();
    });

    it("non riduce entro l'accuratezza del punto", async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(15000);
      keep(point(25, 2, 30));
      expect(minimize).not.toHaveBeenCalled();
      keep(point(35, 3, 30));
      expect(minimize).toHaveBeenCalledTimes(1);
    });

    it("non riduce entro l'accuratezza del punto di partenza", async () => {
      await start();
      keep(point(0, 1, 35));
      jasmine.clock().tick(15000);
      keep(point(30, 2, 5));
      expect(minimize).not.toHaveBeenCalled();
      keep(point(40, 3, 5));
      expect(minimize).toHaveBeenCalledTimes(1);
    });

    it("il valore iniziale fissa solo la partenza", async () => {
      await start(true, [point(0, 1), point(500, 2)]);
      jasmine.clock().tick(60000);
      expect(minimize).not.toHaveBeenCalled();
      keep(point(510, 3));
      expect(minimize).not.toHaveBeenCalled();
      keep(point(521, 4));
      expect(minimize).toHaveBeenCalledTimes(1);
    });

    it('ignora la riemissione dello stesso ultimo punto', async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(15000);
      cmp.minimized = true;
      keep(point(21, 2));
      cmp.minimized = false;
      kept$.next([...pts]);
      expect(minimize).not.toHaveBeenCalled();
    });

    it("ignora l'elenco vuoto", async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(15000);
      expect(() => kept$.next([])).not.toThrow();
      expect(minimize).not.toHaveBeenCalled();
    });

    it('non riduce se già ridotta', async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(15000);
      cmp.minimized = true;
      keep(point(21, 2));
      expect(minimize).not.toHaveBeenCalled();
    });

    it('un tocco sulla plancia fa ripartire il conteggio', async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(10000);
      cmp.panel!.nativeElement.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
      jasmine.clock().tick(10000);
      keep(point(21, 2));
      expect(minimize).not.toHaveBeenCalled();
      jasmine.clock().tick(5000);
      keep(point(42, 3));
      expect(minimize).toHaveBeenCalledTimes(1);
    });

    it('un tocco su un bottone della plancia fa ripartire il conteggio', async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(10000);
      const btn = query('[e2e-recorder-waypoint-btn]') as HTMLElement;
      btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
      jasmine.clock().tick(10000);
      keep(point(21, 2));
      expect(minimize).not.toHaveBeenCalled();
    });

    it('dopo la riapertura riparte e riduce di nuovo', async () => {
      await start();
      keep(point(0, 1));
      cmp.minimized = true;
      jasmine.clock().tick(60000);
      await cmp.expand();
      jasmine.clock().tick(10000);
      keep(point(21, 2));
      expect(minimize).not.toHaveBeenCalled();
      jasmine.clock().tick(5000);
      keep(point(42, 3));
      expect(minimize).toHaveBeenCalledTimes(1);
    });

    it('in pausa non riduce', async () => {
      await start();
      keep(point(0, 1));
      await cmp.pause();
      jasmine.clock().tick(15000);
      keep(point(50, 2));
      expect(minimize).not.toHaveBeenCalled();
    });

    it('alla ripresa riparte da zero', async () => {
      await start();
      keep(point(0, 1));
      await cmp.pause();
      jasmine.clock().tick(60000);
      keep(point(100, 2));
      await cmp.resume();
      jasmine.clock().tick(10000);
      keep(point(121, 3));
      expect(minimize).not.toHaveBeenCalled();
      jasmine.clock().tick(5000);
      keep(point(142, 4));
      expect(minimize).toHaveBeenCalledTimes(1);
    });

    it("all'avvio riparte da zero", async () => {
      await start();
      keep(point(0, 1));
      jasmine.clock().tick(60000);
      cmp.recordStart(true);
      jasmine.clock().tick(10000);
      keep(point(21, 2));
      expect(minimize).not.toHaveBeenCalled();
    });

    it('non riduce senza registrazione', async () => {
      await start(false);
      keep(point(0, 1));
      jasmine.clock().tick(15000);
      keep(point(21, 2));
      expect(minimize).not.toHaveBeenCalled();
    });
  });

  describe('bottone indietro', () => {
    it('nasconde il bottone indietro durante la registrazione', async () => {
      await setup(true);
      expect(query('.wm-track-recorder-close-btn')).toBeNull();
    });

    it('mostra il bottone indietro prima della registrazione', async () => {
      await setup(false);
      expect(query('.wm-track-recorder-close-btn')).not.toBeNull();
    });
  });
});
