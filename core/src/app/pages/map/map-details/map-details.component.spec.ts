import {AnimationController, GestureController, Platform} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';

import {MapDetailsComponent} from './map-details.component';

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

  function getGestureOnEnd(cmp: MapDetailsComponent): (ev: any) => void {
    return (gestureCtrlCreateSpy(cmp).calls.mostRecent().args[0] as any).onEnd;
  }

  function gestureCtrlCreateSpy(cmp: MapDetailsComponent): jasmine.Spy {
    return (cmp as any)._gestureCtrl.create;
  }

  it('onStart da stato "full" dispatcha "open" e imposta _gestureActive a true', () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    getGestureOnStart(component)({event: {preventDefault: () => {}}});

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({status: 'open'}),
    );
    expect((component as any)._gestureActive).toBeTrue();
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

  it('onEnd riporta _gestureActive a false', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();

    getGestureOnStart(component)({event: {preventDefault: () => {}}});
    expect((component as any)._gestureActive).toBeTrue();

    getGestureOnEnd(component)({event: {preventDefault: () => {}}});
    expect((component as any)._gestureActive).toBeFalse();
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

  it('_prefersReducedMotion() riflette window.matchMedia', () => {
    component = createComponent(of('background'));
    spyOn(window, 'matchMedia').and.returnValue({matches: true} as MediaQueryList);

    expect((component as any)._prefersReducedMotion()).toBeTrue();
  });

  it('_applyContentResize non chiama _applyHeightForStatus se una gesture è attiva', () => {
    component = createComponent(of('open'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    (component as any)._gestureActive = true;
    const applySpy = spyOn(component as any, '_applyHeightForStatus');

    (component as any)._applyContentResize();

    expect(applySpy).not.toHaveBeenCalled();
  });

  it('_applyContentResize non chiama _applyHeightForStatus se lo stato è "onlyTitle"', () => {
    component = createComponent(of('onlyTitle'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    const applySpy = spyOn(component as any, '_applyHeightForStatus');

    (component as any)._applyContentResize();

    expect(applySpy).not.toHaveBeenCalled();
  });

  it('_applyContentResize non chiama _applyHeightForStatus se lo stato è "open" (target invariante: floor == tetto massimo, il ricalcolo sarebbe un restart superfluo dell\'animazione)', () => {
    component = createComponent(of('open'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    const applySpy = spyOn(component as any, '_applyHeightForStatus');

    (component as any)._applyContentResize();

    expect(applySpy).not.toHaveBeenCalled();
  });

  it("_applyContentResize chiama _applyHeightForStatus con lo stato corrente e il flag reduced-motion se non c'è gesture attiva", () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    spyOn(component as any, '_prefersReducedMotion').and.returnValue(true);
    const applySpy = spyOn(component as any, '_applyHeightForStatus');

    (component as any)._applyContentResize();

    expect(applySpy).toHaveBeenCalledWith('full', true);
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

  it('_applyHeightForStatus usa il tetto massimo come target (bypassa la misura del contenuto) quando la galleria immagini è attiva', () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    spyOn(component as any, '_isGalleryContentActive').and.returnValue(true);
    spyOn(component as any, '_resizeCeilingForStatus').and.returnValue(900);
    const measureSpy = spyOn(component as any, '_measureContentHeight');
    const setAnimationsSpy = spyOn(component, 'setAnimations');

    (component as any)._applyHeightForStatus('full');

    expect(measureSpy).not.toHaveBeenCalled();
    expect(setAnimationsSpy).toHaveBeenCalledWith(jasmine.any(String), '900px', false);
  });

  it('ngOnDestroy disconnette il ResizeObserver senza lanciare errori', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    (component as any).contentWrapperRef = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();

    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
