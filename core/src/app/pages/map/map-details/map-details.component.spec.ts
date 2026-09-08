import {AnimationController, GestureController, Platform} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {featureOpened} from '@wm-core/store/features/features.selector';
import {setMapDetailsStatus} from '@wm-core/store/user-activity/user-activity.action';
import {BehaviorSubject, of} from 'rxjs';

import {MapDetailsComponent} from './map-details.component';

/**
 * Cede il controllo abbastanza volte da lasciare avanzare ogni `.then()` già schedulato lungo la
 * catena `_resizeChain` (ognuno aggiunge un microtask), non solo il primo — un singolo
 * `await Promise.resolve()` risolve solo un link della catena per volta.
 */
async function flushMicrotasks(times = 5): Promise<void> {
  for (let i = 0; i < times; i++) {
    await Promise.resolve();
  }
}

describe('MapDetailsComponent (oc:8313)', () => {
  let storeSpy: jasmine.SpyObj<Store>;
  let component: MapDetailsComponent;

  function createComponent(mapDetailsStatus$ = of('background')): MapDetailsComponent {
    const elRefSpy = {nativeElement: document.createElement('div')} as any;
    const platformSpy = jasmine.createSpyObj<Platform>('Platform', ['ready', 'height']);
    platformSpy.ready.and.resolveTo();
    platformSpy.height.and.returnValue(800);
    const animationSpy = jasmine.createSpyObj('Animation', [
      'addElement',
      'fromTo',
      'duration',
      'addAnimation',
      'play',
      'destroy',
      'progressEnd',
      'onFinish',
    ]);
    animationSpy.addElement.and.returnValue(animationSpy);
    animationSpy.fromTo.and.returnValue(animationSpy);
    animationSpy.duration.and.returnValue(animationSpy);
    animationSpy.addAnimation.and.returnValue(animationSpy);
    animationSpy.play.and.resolveTo();
    const animationCtrlSpy = jasmine.createSpyObj<AnimationController>('AnimationController', [
      'create',
    ]);
    animationCtrlSpy.create.and.returnValue(animationSpy);
    const gestureCtrlSpy = jasmine.createSpyObj<GestureController>('GestureController', [
      'create',
    ]);
    gestureCtrlSpy.create.and.returnValue({enable: jasmine.createSpy('enable')} as any);
    storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(mapDetailsStatus$ as any);

    return new MapDetailsComponent(elRefSpy, platformSpy, animationCtrlSpy, gestureCtrlSpy, storeSpy);
  }

  it('imposta _currentStatus a "open" quando lo store emette "open"', () => {
    component = createComponent(of('open'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();

    expect((component as any)._currentStatus).toBe('open');
  });

  it('toggle() da stato "full" dispatcha "open"', () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    const result = component.toggle();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({status: 'open'}),
    );
    expect(result).toBeTrue();
  });

  it('toggle() da stato "open" dispatcha "onlyTitle"', () => {
    component = createComponent(of('open'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    const result = component.toggle();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({status: 'onlyTitle'}),
    );
    expect(result).toBeFalse();
  });

  it('toggle() da stato "onlyTitle" dispatcha "open"', () => {
    component = createComponent(of('onlyTitle'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    const result = component.toggle();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({status: 'open'}),
    );
    expect(result).toBeTrue();
  });

  function getGestureOnStart(cmp: MapDetailsComponent): (ev: any) => void {
    return (gestureCtrlCreateSpy(cmp).calls.mostRecent().args[0] as any).onStart;
  }

  function gestureCtrlCreateSpy(cmp: MapDetailsComponent): jasmine.Spy {
    return (cmp as any)._gestureCtrl.create;
  }

  it('onStart da stato "full" dispatcha "open"', () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    getGestureOnStart(component)({event: {preventDefault: () => {}}});

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({status: 'open'}),
    );
  });

  it('onStart da stato "onlyTitle" dispatcha "full"', () => {
    component = createComponent(of('onlyTitle'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    getGestureOnStart(component)({event: {preventDefault: () => {}}});

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({status: 'full'}),
    );
  });

  it('onStart da stato "background" dispatcha "full" (fedele al comportamento pixel-based originale)', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    getGestureOnStart(component)({event: {preventDefault: () => {}}});

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({status: 'full'}),
    );
  });

  it('_resizeCeilingForStatus("open") restituisce minInfoheight', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();

    expect((component as any)._resizeCeilingForStatus('open')).toBe(component.minInfoheight);
  });

  it('_resizeCeilingForStatus("full") restituisce height - 200 - safeAreaTop', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    component.height = 800;
    spyOn(component as any, '_getSafeAreaTopPx').and.returnValue(44);

    expect((component as any)._resizeCeilingForStatus('full')).toBe(800 - 200 - 44);
  });

  it('_isGalleryContentActive() rileva la presenza di wm-image-detail nel wrapper', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    const wrapper = document.createElement('div');
    (component as any).contentWrapperRef = {nativeElement: wrapper};

    expect((component as any)._isGalleryContentActive()).toBeFalse();

    wrapper.appendChild(document.createElement('wm-image-detail'));

    expect((component as any)._isGalleryContentActive()).toBeTrue();
  });

  it('_applyHeightForStatus usa il tetto massimo come target (bypassa la misura del contenuto) quando la galleria immagini è attiva', async () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    spyOn(component as any, '_isGalleryContentActive').and.returnValue(true);
    spyOn(component as any, '_resizeCeilingForStatus').and.returnValue(900);
    const measureSpy = spyOn(component as any, '_measureContentHeight');
    const setAnimationsSpy = spyOn(component, 'setAnimations');

    // `_applyHeightForStatus` accoda l'esecuzione su `_resizeChain` (oc:8427, evita di
    // interrompere un'animazione già in corso) — la chiamata a `setAnimations` non è più
    // sincrona, va atteso il completamento della catena.
    await (component as any)._applyHeightForStatus('full');

    expect(measureSpy).not.toHaveBeenCalled();
    expect(setAnimationsSpy).toHaveBeenCalledWith(jasmine.any(String), '900px', false);
  });

  it('_applyHeightForStatus non interrompe un resize in corso: la seconda richiesta si accoda e usa una misura fresca', async () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    let resolveFirstAnimation: () => void;
    const setAnimationsSpy = spyOn(component, 'setAnimations').and.returnValue(
      new Promise<void>(resolve => (resolveFirstAnimation = resolve)),
    );
    const measureSpy = spyOn(component as any, '_measureContentHeight').and.returnValues(100, 200);
    spyOn(component as any, '_resizeCeilingForStatus').and.returnValue(900);
    spyOn(component as any, '_measureHeaderHeight').and.returnValue(0);

    const firstCall = (component as any)._applyHeightForStatus('full');
    // Un tick perché la prima richiesta arrivi davvero ad "animare" (chiami setAnimations e resti
    // in attesa) prima di emettere la seconda — altrimenti le due si coalescerebbero prima ancora
    // che la prima parta, scenario diverso da quello che questo test vuole verificare.
    await Promise.resolve();
    const secondCall = (component as any)._applyHeightForStatus('full');

    // Nessuna interruzione: `setAnimations` (quindi anche un eventuale `Animation.destroy()`
    // interno) è stato chiamato una sola volta finché la prima richiesta non si conclude.
    expect(setAnimationsSpy).toHaveBeenCalledTimes(1);

    resolveFirstAnimation();
    await firstCall;
    await secondCall;

    expect(setAnimationsSpy).toHaveBeenCalledTimes(2);
    expect(measureSpy).toHaveBeenCalledTimes(2); // seconda richiesta misurata al momento dell'esecuzione, non della chiamata
  });

  it(
    'background()/onlyTitle() non chiamano setAnimations() mentre un resize open()/full() è ancora ' +
      'in animazione: si accodano sulla stessa _resizeChain invece di eseguire in parallelo ' +
      '(regressione oc:8427 review — la chiamata diretta preesistente distruggeva un\'animazione ' +
      'ancora "in play()", bloccando la coda di resize per il resto della sessione)',
    async () => {
      component = createComponent(of('background'));
      (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
      component.ngAfterViewInit();
      let resolveFirstAnimation: () => void;
      const setAnimationsSpy = spyOn(component, 'setAnimations').and.returnValues(
        new Promise<void>(resolve => (resolveFirstAnimation = resolve)),
        Promise.resolve(),
      );
      spyOn(component as any, '_resizeCeilingForStatus').and.returnValue(900);
      spyOn(component as any, '_measureContentHeight').and.returnValue(100);
      spyOn(component as any, '_measureHeaderHeight').and.returnValue(0);

      component.open();
      await flushMicrotasks();
      expect(setAnimationsSpy).toHaveBeenCalledTimes(1);

      component.background();
      await flushMicrotasks();
      // Ancora nessuna seconda chiamata: background() deve aspettare che il resize in corso
      // finisca, non chiamare setAnimations() in parallelo.
      expect(setAnimationsSpy).toHaveBeenCalledTimes(1);

      resolveFirstAnimation();
      await flushMicrotasks();

      // Una volta concluso il resize in corso, la transizione esplicita accodata viene eseguita.
      expect(setAnimationsSpy).toHaveBeenCalledTimes(2);
    },
  );

  it('un errore durante un resize non blocca le richieste successive sulla stessa _resizeChain (nessun `.catch()` mancante che la "avvelenerebbe")', async () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    spyOn(console, 'error'); // atteso: _enqueueAnimation logga l'errore, non è oggetto di questo test
    spyOn(component, 'setAnimations').and.returnValues(
      Promise.reject(new Error('boom')),
      Promise.resolve(),
    );
    spyOn(component as any, '_resizeCeilingForStatus').and.returnValue(900);
    spyOn(component as any, '_measureContentHeight').and.returnValue(100);
    spyOn(component as any, '_measureHeaderHeight').and.returnValue(0);

    await (component as any)._applyHeightForStatus('full');
    await (component as any)._applyHeightForStatus('full');

    expect(component.setAnimations).toHaveBeenCalledTimes(2);
  });

  it('ngOnDestroy annulla le subscription attivate in ngAfterViewInit (mapDetailsStatus/featureOpened) — nessun leak alla distruzione del componente', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();

    expect((component as any)._subscriptions.closed).toBeFalse();

    component.ngOnDestroy();

    expect((component as any)._subscriptions.closed).toBeTrue();
  });
});

describe('MapDetailsComponent - featureOpened$ senza skip (oc:8470)', () => {
  let component: MapDetailsComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let featureOpened$: BehaviorSubject<boolean>;

  beforeEach(() => {
    // true già al mount: simula il caso reale (feature selezionato PRIMA che il
    // componente esista, es. da un deep-link/query param iniziale — oc:8470)
    featureOpened$ = new BehaviorSubject<boolean>(true);

    storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    storeSpy.select.and.callFake((selector: any) => {
      if (selector === featureOpened) return featureOpened$.asObservable();
      return of('background');
    });

    const elRefStub = {nativeElement: {offsetHeight: 500}};
    component = new MapDetailsComponent(elRefStub as any, {} as any, {} as any, {} as any, storeSpy);
    spyOn(component as any, 'setAnimations');
    spyOn(component as any, '_setGesture');
  });

  it('apre il pannello se il feature è già selezionato al momento del mount (oc:8470)', () => {
    component.ngAfterViewInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(setMapDetailsStatus({status: 'open'}));
  });

  it('non apre il pannello se nessun feature è selezionato al mount', () => {
    featureOpened$.next(false);

    component.ngAfterViewInit();

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(setMapDetailsStatus({status: 'open'}));
  });

  it('apre il pannello su una transizione a true dopo il mount (comportamento preesistente)', () => {
    featureOpened$.next(false);
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    featureOpened$.next(true);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(setMapDetailsStatus({status: 'open'}));
  });

  it('ngOnDestroy annulla anche la subscription featureOpened$ (nessun leak, oc:8470 + oc:8313)', () => {
    component.ngAfterViewInit();

    expect((component as any)._subscriptions.closed).toBeFalse();

    component.ngOnDestroy();

    expect((component as any)._subscriptions.closed).toBeTrue();
  });
});
