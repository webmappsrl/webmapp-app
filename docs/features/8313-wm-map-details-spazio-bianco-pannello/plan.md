> Ticket: oc:8313

# wm-map-details: spazio bianco in fondo al pannello di dettaglio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Il pannello `wm-map-details` non forza più un'altezza fissa (320px in "open", quasi-fullscreen in "full") quando il contenuto reale è più corto — l'altezza si adatta dinamicamente al contenuto, con un minimo di 320px, restando invariata (fissa a 320px con scroll interno) quando il contenuto è più lungo.

**Architecture:** Una funzione pura (`computeTargetHeight`) calcola l'altezza target come `min(max(contentHeight + headerHeight, floor), ceiling)`. Il contenuto reale viene misurato via `ResizeObserver` su un wrapper interno non vincolato in altezza (per evitare un loop di resize), con le chiamate risultanti debounced e sospese durante una gesture attiva. Le soglie di stato di `toggle()`/`_setGesture()` (oggi basate su confronti di altezza in pixel, fragili con altezze dinamiche) vengono ancorate allo stato logico tracciato esplicitamente (`_currentStatus`), non re-inferite dall'altezza corrente. L'animazione continua a usare `AnimationController` con valori numerici espliciti.

**Tech Stack:** Angular 20 (standalone: false), Ionic 8 (`AnimationController`, `GestureController`), NgRx 20 (store `mapDetailsStatus`), Karma + Jasmine.

## Global Constraints

- Nessun commit o branch automatico in questa fase: i comandi `git commit` nei singoli step sono istruzioni testuali per lo sviluppatore, non azioni da eseguire autonomamente.
- Tutti i commit usano lo scope `fix(oc:8313): ...`.
- JSDoc obbligatorio su ogni nuovo metodo/funzione (convenzione ESLint del progetto, CLAUDE.md → Code Conventions).
- Membri privati con prefisso `_` (convenzione del progetto).
- Nessuna modifica al comportamento degli stati "background"/"onlyTitle", nessuna modifica al meccanismo di toggle-al-tocco in sé (solo ai valori/soglie su cui opera), nessuna gestione della rotazione device a pannello aperto, nessuna estensione di `prefers-reduced-motion` alle transizioni di stato manuali — tutti esplicitamente out of scope (vedi `overview.md`).
- `handleClick()` / `endAnimation()` / `stepStatus` (righe 95-98, 176-182 del file originale) sono codice morto — non referenziato da alcun template né da `_setGesture()` (nessun `onMove`/`.progressStep()` in tutto il componente). Non toccarli: sono fuori scope per questo fix, non introdurre refactoring collaterali.

---

### Task 1: Funzione pura di calcolo dell'altezza target

**Files:**
- Create: `core/src/app/pages/map/map-details/map-details-height.util.ts`
- Test: `core/src/app/pages/map/map-details/map-details-height.util.spec.ts`

**Interfaces:**
- Produces: `computeTargetHeight(contentHeight: number, headerHeight: number, floor: number, ceiling: number): number` — usata da Task 5 (`_applyHeightForStatus`).

- [ ] **Step 1: Scrivi il test che fallisce**

Crea `core/src/app/pages/map/map-details/map-details-height.util.spec.ts`:

```ts
import {computeTargetHeight} from './map-details-height.util';

describe('computeTargetHeight (oc:8313)', () => {
  it('in stato "open" con contenuto più corto di 320px, resta a 320px (floor == ceiling)', () => {
    expect(computeTargetHeight(100, 56, 320, 320)).toBe(320);
  });

  it('in stato "open" con contenuto più alto di 320px, resta a 320px con scroll interno (floor == ceiling)', () => {
    expect(computeTargetHeight(500, 56, 320, 320)).toBe(320);
  });

  it('in stato "full" con contenuto più corto del floor, si ferma al floor (320px)', () => {
    expect(computeTargetHeight(100, 56, 320, 900)).toBe(320);
  });

  it('in stato "full" con contenuto tra floor e ceiling, si adatta al contenuto reale', () => {
    expect(computeTargetHeight(700, 56, 320, 900)).toBe(756);
  });

  it('in stato "full" con contenuto più alto del ceiling, si ferma al ceiling', () => {
    expect(computeTargetHeight(1000, 56, 320, 900)).toBe(900);
  });
});
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details-height.util.spec.ts' --watch=false`
Expected: FAIL — `Cannot find module './map-details-height.util'`

- [ ] **Step 3: Scrivi l'implementazione minima**

Crea `core/src/app/pages/map/map-details/map-details-height.util.ts`:

```ts
/**
 * Calcola l'altezza target del pannello dato l'altezza reale del contenuto,
 * garantendo un minimo (`floor`) e un massimo (`ceiling`).
 */
export function computeTargetHeight(
  contentHeight: number,
  headerHeight: number,
  floor: number,
  ceiling: number,
): number {
  return Math.min(Math.max(contentHeight + headerHeight, floor), ceiling);
}
```

- [ ] **Step 4: Esegui il test e verifica che passi**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details-height.util.spec.ts' --watch=false`
Expected: PASS — 5 test verdi

- [ ] **Step 5: Commit**

```bash
git add core/src/app/pages/map/map-details/map-details-height.util.ts core/src/app/pages/map/map-details/map-details-height.util.spec.ts
git commit -m "fix(oc:8313): add pure height-calculation util for map-details panel"
```

---

### Task 2: Tracciamento dello stato logico corrente e ancoraggio di `toggle()`

**Files:**
- Modify: `core/src/app/pages/map/map-details/map-details.component.ts`
- Test: `core/src/app/pages/map/map-details/map-details.component.spec.ts` (nuovo)

**Interfaces:**
- Consumes: nessuna dipendenza da Task 1.
- Produces: campo privato `_currentStatus: TMapDetailsStatus` (default `'background'`), aggiornato nella subscription di `ngAfterViewInit()`. Usato da Task 3 (`_setGesture`) e Task 6 (`_applyContentResize`).

- [ ] **Step 1: Scrivi il test che fallisce**

Crea `core/src/app/pages/map/map-details/map-details.component.spec.ts`:

```ts
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
    const animationCtrlSpy = jasmine.createSpyObj<AnimationController>('AnimationController', [
      'create',
    ]);
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
});
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details.component.spec.ts' --watch=false`
Expected: FAIL — `_currentStatus` è `undefined`, i test su `toggle()` falliscono (dispatch con lo status calcolato dal vecchio confronto su `_getCurrentHeight()`, non deterministico in questo contesto senza DOM reale)

- [ ] **Step 3: Scrivi l'implementazione minima**

In `core/src/app/pages/map/map-details/map-details.component.ts`, aggiungi l'import del tipo (alias per evitare collisione col selector già importato con lo stesso nome):

```ts
import {mapDetailsStatus as TMapDetailsStatus} from '@wm-core/store/user-activity/user-activity.reducer';
```

Aggiungi il campo privato subito dopo `private _started: boolean = false;`:

```ts
  private _currentStatus: TMapDetailsStatus = 'background';
```

Nella subscription dentro `ngAfterViewInit()`, aggiungi il tracciamento dello stato prima dello `switch`:

```ts
    this._store.select(mapDetailsStatus).subscribe(status => {
      this._currentStatus = status;
      switch (status) {
```

Sostituisci l'implementazione di `toggle()`:

```ts
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
```

- [ ] **Step 4: Esegui il test e verifica che passi**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details.component.spec.ts' --watch=false`
Expected: PASS — 4 test verdi

- [ ] **Step 5: Commit**

```bash
git add core/src/app/pages/map/map-details/map-details.component.ts core/src/app/pages/map/map-details/map-details.component.spec.ts
git commit -m "fix(oc:8313): anchor toggle() to logical status instead of pixel height"
```

---

### Task 3: Ancoraggio della soglia di `_setGesture()` e guardia gesture-attiva

**Files:**
- Modify: `core/src/app/pages/map/map-details/map-details.component.ts`
- Modify: `core/src/app/pages/map/map-details/map-details.component.spec.ts`

**Interfaces:**
- Consumes: `_currentStatus` (Task 2).
- Produces: campo privato `_gestureActive: boolean` (default `false`). Usato da Task 6 (`_applyContentResize`).

- [ ] **Step 1: Scrivi il test che fallisce**

Aggiungi in fondo a `map-details.component.spec.ts` (stesso `describe`):

```ts
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

  it('onEnd riporta _gestureActive a false', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();

    getGestureOnStart(component)({event: {preventDefault: () => {}}});
    expect((component as any)._gestureActive).toBeTrue();

    getGestureOnEnd(component)({event: {preventDefault: () => {}}});
    expect((component as any)._gestureActive).toBeFalse();
  });
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details.component.spec.ts' --watch=false`
Expected: FAIL — `_gestureActive` è `undefined`, il gesture di test usa ancora `_getCurrentHeight()` (che con `nativeElement` di `document.createElement('div')` vale sempre 0, quindi i due `onStart` restituirebbero risultati indistinguibili dallo stato reale)

- [ ] **Step 3: Scrivi l'implementazione minima**

Aggiungi il campo privato subito dopo `_currentStatus`:

```ts
  private _gestureActive: boolean = false;
```

Sostituisci il corpo di `_setGesture()`:

```ts
  private _setGesture() {
    this._gesture = this._gestureCtrl.create({
      el: this.dragHandleIcon.nativeElement,
      threshold: 0,
      gestureName: 'handler-drag',
      gesturePriority: 100,
      passive: false,
      onStart: ev => {
        ev.event?.preventDefault();
        this._gestureActive = true;
        // 'background' copre anche il mount iniziale (prima che lo stato sia stato
        // dispatchato la prima volta) — stesso comportamento del vecchio controllo
        // su _getCurrentHeight() === 56.
        if (this._currentStatus === 'full' || this._currentStatus === 'background') {
          this._store.dispatch(setMapDetailsStatus({status: 'open'}));
        } else {
          this._store.dispatch(setMapDetailsStatus({status: 'full'}));
        }
      },
      onEnd: ev => {
        ev.event?.preventDefault();
        this._gestureActive = false;
      },
    });

    this._gesture.enable(true);
  }
```

- [ ] **Step 4: Esegui il test e verifica che passi**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details.component.spec.ts' --watch=false`
Expected: PASS — 7 test verdi in totale

- [ ] **Step 5: Commit**

```bash
git add core/src/app/pages/map/map-details/map-details.component.ts core/src/app/pages/map/map-details/map-details.component.spec.ts
git commit -m "fix(oc:8313): anchor gesture threshold to logical status, track gesture-active flag"
```

---

### Task 4: Wrapper di contenuto/header nel template e rimozione del padding-bottom

**Files:**
- Modify: `core/src/app/pages/map/map-details/map-details.component.html`
- Modify: `core/src/app/pages/map/map-details/map-details.component.ts`
- Modify: `core/src/app/pages/map/map-details/map-details.component.scss`

**Interfaces:**
- Produces: `@ViewChild('contentWrapper') contentWrapperRef: ElementRef;` e `@ViewChild('cardHeader') cardHeaderRef: ElementRef;`. Usati da Task 5 (`_measureContentHeight`/`_measureHeaderHeight`) e Task 6 (`ResizeObserver`).

- [ ] **Step 1: Modifica il template**

In `core/src/app/pages/map/map-details/map-details.component.html`, sostituisci:

```html
  <ion-card-header class="wm-drag">
```

con:

```html
  <ion-card-header class="wm-drag" #cardHeader>
```

E sostituisci:

```html
  <ion-card-content>
    <ng-content></ng-content>
  </ion-card-content>
```

con:

```html
  <ion-card-content>
    <div class="wm-content-wrapper" #contentWrapper>
      <ng-content></ng-content>
    </div>
  </ion-card-content>
```

- [ ] **Step 2: Aggiungi i `@ViewChild` nel componente**

In `map-details.component.ts`, dopo `@ViewChild('dragHandleIcon') dragHandleIcon: ElementRef;`, aggiungi:

```ts
  @ViewChild('contentWrapper') contentWrapperRef: ElementRef;
  @ViewChild('cardHeader') cardHeaderRef: ElementRef;
```

- [ ] **Step 3: Aggiorna la SCSS**

In `map-details.component.scss`, rimuovi la riga `padding-bottom: 15%;` dal blocco `> ion-card` (riga 53 del file originale):

```diff
   > ion-card {
     margin-inline: 0 !important;
     margin: 0;
     padding: 10px;
     height: inherit;
-    padding-bottom: 15%;
     border-radius: 16px 16px 0 0;
```

Aggiungi la regola per il nuovo wrapper, dentro il blocco `> ion-card-content` (dopo `margin: 0 !important;`):

```diff
     > ion-card-content {
       height: 100%;
       overflow-y: auto;
       overflow-x: hidden;
       padding: 0 !important;
       margin: 0 !important;
+
+      .wm-content-wrapper {
+        display: block;
+      }
```

- [ ] **Step 4: Verifica manuale che il componente compili e renderizzi**

Run: `cd core && npx ng build --configuration=development 2>&1 | tail -30`
Expected: build senza errori di compilazione template (i due nuovi `@ViewChild` sono opzionali finché non referenziati altrove — nessun errore atteso)

- [ ] **Step 5: Commit**

```bash
git add core/src/app/pages/map/map-details/map-details.component.html core/src/app/pages/map/map-details/map-details.component.ts core/src/app/pages/map/map-details/map-details.component.scss
git commit -m "fix(oc:8313): add content/header wrapper refs, remove forced padding-bottom"
```

---

### Task 5: Calcolo dell'altezza dinamica in `open()`/`full()` e supporto reduced-motion

**Files:**
- Modify: `core/src/app/pages/map/map-details/map-details.component.ts`
- Modify: `core/src/app/pages/map/map-details/map-details.component.spec.ts`

**Interfaces:**
- Consumes: `computeTargetHeight()` (Task 1), `contentWrapperRef`/`cardHeaderRef` (Task 4), `minInfoheight`/`height` (esistenti).
- Produces: `_measureContentHeight(): number`, `_measureHeaderHeight(): number`, `_getSafeAreaTopPx(): number`, `_resizeCeilingForStatus(status: 'open' | 'full'): number`, `_applyHeightForStatus(status: 'open' | 'full', instant?: boolean): void`, `_prefersReducedMotion(): boolean`. `setAnimations()` guadagna un terzo parametro opzionale `instant: boolean`. Usati da Task 6 (`_applyContentResize`).

- [ ] **Step 1: Scrivi il test che fallisce**

Aggiungi in fondo a `map-details.component.spec.ts`:

```ts
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
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details.component.spec.ts' --watch=false`
Expected: FAIL — `_resizeCeilingForStatus is not a function`, `_prefersReducedMotion is not a function`

- [ ] **Step 3: Scrivi l'implementazione minima**

Aggiungi l'import in cima al file:

```ts
import {computeTargetHeight} from './map-details-height.util';
```

Sostituisci il metodo `setAnimations()` esistente con:

```ts
  /**
   * Anima l'altezza dell'host da `from` a `to`. Se `instant` è true (usato solo dal
   * ridimensionamento automatico via ResizeObserver quando prefers-reduced-motion è
   * attivo), la transizione avviene senza animazione (durata 0).
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
```

Sostituisci `open()` e `full()`:

```ts
  open(): void {
    this._applyHeightForStatus('open');
    this.isOpen$.next(true);
  }

  full(): void {
    this._applyHeightForStatus('full');
    this.isOpen$.next(true);
  }
```

Aggiungi i nuovi metodi privati (subito prima di `private _getCurrentHeight()`):

```ts
  /**
   * Calcola e applica l'altezza target del pannello in base al contenuto reale
   * misurato, per lo stato "open" o "full".
   */
  private _applyHeightForStatus(status: 'open' | 'full', instant = false): void {
    const target = computeTargetHeight(
      this._measureContentHeight(),
      this._measureHeaderHeight(),
      this.minInfoheight,
      this._resizeCeilingForStatus(status),
    );
    this.setAnimations(`${this._getCurrentHeight()}px`, `${target}px`, instant);
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

  /** true se l'utente ha richiesto animazioni ridotte a livello di sistema operativo. */
  private _prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  }
```

- [ ] **Step 4: Esegui il test e verifica che passi**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details.component.spec.ts' --watch=false`
Expected: PASS — 10 test verdi in totale

- [ ] **Step 5: Commit**

```bash
git add core/src/app/pages/map/map-details/map-details.component.ts core/src/app/pages/map/map-details/map-details.component.spec.ts
git commit -m "fix(oc:8313): compute dynamic target height in open()/full(), add reduced-motion support"
```

---

### Task 6: ResizeObserver, debounce e guardia gesture-attiva

**Files:**
- Modify: `core/src/app/pages/map/map-details/map-details.component.ts`
- Modify: `core/src/app/pages/map/map-details/map-details.component.spec.ts`
- Modify: `core/src/app/constants/map.ts`

**Interfaces:**
- Consumes: `_gestureActive` (Task 3), `_currentStatus` (Task 2), `_applyHeightForStatus`/`_prefersReducedMotion` (Task 5), `contentWrapperRef` (Task 4).
- Produces: `_applyContentResize(): void` (metodo privato, chiamato dal debounce), `ngOnDestroy(): void`.

- [ ] **Step 1: Scrivi il test che fallisce**

Aggiungi in fondo a `map-details.component.spec.ts`:

```ts
  it('_applyContentResize non chiama _applyHeightForStatus se una gesture è attiva', () => {
    component = createComponent(of('open'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    (component as any)._gestureActive = true;
    const applySpy = spyOn(component as any, '_applyHeightForStatus');

    (component as any)._applyContentResize();

    expect(applySpy).not.toHaveBeenCalled();
  });

  it('_applyContentResize non chiama _applyHeightForStatus se lo stato non è "open"/"full"', () => {
    component = createComponent(of('onlyTitle'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    const applySpy = spyOn(component as any, '_applyHeightForStatus');

    (component as any)._applyContentResize();

    expect(applySpy).not.toHaveBeenCalled();
  });

  it('_applyContentResize chiama _applyHeightForStatus con lo stato corrente e il flag reduced-motion se non c\'è gesture attiva', () => {
    component = createComponent(of('full'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();
    spyOn(component as any, '_prefersReducedMotion').and.returnValue(true);
    const applySpy = spyOn(component as any, '_applyHeightForStatus');

    (component as any)._applyContentResize();

    expect(applySpy).toHaveBeenCalledWith('full', true);
  });

  it('ngOnDestroy disconnette il ResizeObserver senza lanciare errori', () => {
    component = createComponent(of('background'));
    (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
    (component as any).contentWrapperRef = {nativeElement: document.createElement('div')};
    component.ngAfterViewInit();

    expect(() => component.ngOnDestroy()).not.toThrow();
  });
```

- [ ] **Step 2: Esegui il test e verifica che fallisca**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details.component.spec.ts' --watch=false`
Expected: FAIL — `_applyContentResize is not a function`, `ngOnDestroy is not a function`

- [ ] **Step 3: Scrivi l'implementazione minima**

In `core/src/app/constants/map.ts`, aggiungi in fondo:

```ts
export const MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS = 120;
```

In `map-details.component.ts`, aggiorna gli import:

```ts
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
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {debounceTime, skip} from 'rxjs/operators';
import {DETAILS_ANIMATION_DURATION, MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS} from 'src/app/constants/map';

import {computeTargetHeight} from './map-details-height.util';
```

Cambia la dichiarazione della classe per implementare `OnDestroy`:

```ts
export class MapDetailsComponent implements AfterViewInit, OnDestroy {
```

Aggiungi i nuovi campi privati subito dopo `_gestureActive`:

```ts
  private _resizeObserver: ResizeObserver;
  private _contentResize$ = new Subject<void>();
  private _contentResizeSub: Subscription;
```

Nel corpo di `ngAfterViewInit()`, dopo `this._setGesture();`, aggiungi:

```ts
    this._contentResizeSub = this._contentResize$
      .pipe(debounceTime(MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS))
      .subscribe(() => this._applyContentResize());
    this._resizeObserver = new ResizeObserver(() => this._contentResize$.next());
    if (this.contentWrapperRef?.nativeElement != null) {
      this._resizeObserver.observe(this.contentWrapperRef.nativeElement);
    }
```

Aggiungi il nuovo metodo pubblico `ngOnDestroy()` e il metodo privato `_applyContentResize()` (subito dopo `_prefersReducedMotion()`):

```ts
  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._contentResizeSub?.unsubscribe();
  }

  /**
   * Reagisce a una variazione di altezza del contenuto rilevata dal ResizeObserver
   * (debounced). Non fa nulla mentre una gesture è in corso o se lo stato corrente
   * non è "open"/"full" (unico caso in cui l'altezza dipende dal contenuto).
   */
  private _applyContentResize(): void {
    if (this._gestureActive) {
      return;
    }
    if (this._currentStatus === 'open' || this._currentStatus === 'full') {
      this._applyHeightForStatus(this._currentStatus, this._prefersReducedMotion());
    }
  }
```

- [ ] **Step 4: Esegui il test e verifica che passi**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/map-details.component.spec.ts' --watch=false`
Expected: PASS — 14 test verdi in totale

- [ ] **Step 5: Commit**

```bash
git add core/src/app/pages/map/map-details/map-details.component.ts core/src/app/pages/map/map-details/map-details.component.spec.ts core/src/app/constants/map.ts
git commit -m "fix(oc:8313): wire ResizeObserver with debounce and gesture guard"
```

---

### Task 7: Includere `map-details` nella scoperta test di CI

**Files:**
- Modify: `core/angular.json`
- Modify: `core/tsconfig.spec.json`

**Interfaces:**
- Nessuna (configurazione di build/test, nessuna interfaccia di codice).

- [ ] **Step 1: Aggiorna `angular.json`**

Nel blocco `architect.test.options.include` (vedi CLAUDE.md → CI/CD, stesso pattern usato per `src/app/pages/favourites` in oc:8176), aggiungi la nuova cartella:

```diff
             "include": [
               "src/app/services",
-              "src/app/pages/favourites"
+              "src/app/pages/favourites",
+              "src/app/pages/map/map-details"
             ],
```

- [ ] **Step 2: Aggiorna `tsconfig.spec.json`**

```diff
   "include": [
     "src/app/services/**/*.spec.ts",
     "src/app/pages/favourites/**/*.spec.ts",
+    "src/app/pages/map/map-details/**/*.spec.ts",
     "src/**/*.d.ts"
   ]
```

- [ ] **Step 3: Esegui l'intera suite e verifica che tutti i test passino**

Run: `cd core && npm run test -- --watch=false`
Expected: PASS — inclusi i test di `map-details-height.util.spec.ts` e `map-details.component.spec.ts`, nessuna regressione sugli altri spec già inclusi (`src/app/services`, `src/app/pages/favourites`)

- [ ] **Step 4: Commit**

```bash
git add core/angular.json core/tsconfig.spec.json
git commit -m "fix(oc:8313): include map-details specs in CI test discovery"
```

---

### Task 8: Verifica manuale (golden path + edge case)

**Files:** nessuno (verifica, non codice)

- [ ] **Step 1: Avvia il dev server**

Run: `cd core && npm start`
Expected: server disponibile su `http://localhost:4200`

- [ ] **Step 2: Apri un POI/cammino con contenuto corto in stato "open"**

Nel browser (emulazione mobile, viewport 412×832 per coerenza con la config Cypress del progetto), apri sulla mappa un POI con descrizione breve (poche righe, nessuna galleria immagini lunga).
Expected: il pannello in stato "open" non mostra più una fascia bianca vuota evidente in fondo alla card (oltre al normale minimo di 320px, coerente con la decisione presa in Fase: reverse-interaction).

- [ ] **Step 3: Espandi a stato "full" lo stesso contenuto corto**

Tocca il drag handle per passare a "full".
Expected: il pannello si adatta al contenuto reale (non resta quasi-fullscreen con spazio bianco vuoto).

- [ ] **Step 4: Verifica un contenuto lungo (con galleria immagini o testo esteso)**

Apri un POI/cammino con contenuto lungo.
Expected: in "open" il pannello resta a 320px con scroll interno; in "full" il pannello raggiunge il tetto massimo (quasi-fullscreen) come oggi.

- [ ] **Step 5: Verifica il toggle-al-tocco del drag handle**

Da "full", tocca il drag handle → deve tornare a "open" (non a "onlyTitle"). Da "open", tocca il drag handle tramite `toogleFullMap()` → deve andare a "full" (via `_setGesture`) o "onlyTitle" (via `toggle()`, se invocato dal pulsante corrispondente nel template `map.page.html`).
Expected: nessuna transizione di stato inattesa, coerente con il comportamento pre-fix.

- [ ] **Step 6: Verifica `prefers-reduced-motion`**

Nei DevTools Chrome, emula `prefers-reduced-motion: reduce` (Rendering tab → Emulate CSS media feature). Naviga tra POI collegati (o attendi il caricamento di un'immagine) mentre il pannello è aperto.
Expected: il ridimensionamento automatico avviene senza animazione visibile (snap immediato); le transizioni manuali (tap su open/full/onlyTitle) restano animate come oggi (comportamento invariato, per decisione esplicita presa in Fase: challenge).

- [ ] **Step 7: Verifica assenza di loop/flicker in console**

Con i DevTools aperti sulla Console, ripeti gli step 2-4.
Expected: nessun warning `ResizeObserver loop limit exceeded` o simile.
