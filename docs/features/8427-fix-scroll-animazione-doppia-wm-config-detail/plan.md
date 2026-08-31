> Ticket: oc:8427

# Fix scroll e animazione doppia in wm-config-detail — Implementation Plan (webmapp-app)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In modalità `full`, coordinare in sequenza (mai in parallelo) la transizione CSS di apertura/chiusura di un item `wm-config-detail`, il resize del pannello `wm-map-details` e lo scroll automatico verso l'item aperto — sostituendo la sovrapposizione attuale (debounce fisso 120ms che scatta durante la transizione CSS di 300ms) con un'attesa esplicita della fine di quella transizione nota.

**Architecture:** `MapDetailsComponent` riceve, tramite un nuovo metodo pubblico `onProjectedContentToggle(event: ConfigDetailToggleEvent)`, la notifica di ogni apertura/chiusura di un item — inoltrata da `wm-home-layer`/`wm-track-properties` (wm-core, vedi plan.md di quel repo) e da `wm-poi-properties` (questo repo, Task 2), tutti e tre montati come contenuto proiettato dentro `wm-map-details` in `map.page.html`. Alla ricezione: se lo stato è `'full'`, sospende il resize "generico" guidato da `ResizeObserver`/debounce per quella specifica transizione, attende la fine reale della transizione CSS nota (`transitionend` filtrato su `grid-template-rows`, con fallback a timeout se l'evento non arriva — caso garantito, non raro, quando un secondo toggle interrompe la transizione in corso), poi ridimensiona il pannello e infine esegue lo scroll. In stato diverso da `'full'` (es. `'open'`), nessun resize necessario: lo scroll avviene subito dopo la fine della stessa transizione CSS attesa. Il `ResizeObserver`/debounce esistente resta invariato per resize non annunciati da un toggle (es. immagini a caricamento lento).

**Tech Stack:** Angular 20, Ionic `AnimationController` (già in uso), API DOM native (`transitionend`, `scrollIntoView`) — nessuna nuova dipendenza.

**Spec:** `docs/features/8427-fix-scroll-animazione-doppia-wm-config-detail/overview.md` (questo repo).

## Global Constraints

- **Prerequisito**: il tipo `ConfigDetailToggleEvent` deve già esistere in `@wm-types/config` (plan.md di `wm-types`), e i pass-through di `wm-home-layer`/`wm-track-properties` devono già esistere in wm-core (plan.md di quel repo, Task 2/3) — questo piano li consuma via il template reference `#details` in `map.page.html`, senza dipendere dall'ordine di merge dei due submodule tra loro (i due sono indipendenti), ma entrambi devono precedere questo piano.
- **Test via istanza TS pura (`new MapDetailsComponent(...)`), non `TestBed`**: pattern già in uso in `map-details.component.spec.ts` (oc:8313) — mantenerlo per coerenza, non introdurre `TestBed` in questo file.
- JSDoc obbligatorio su ogni metodo pubblico/privato non trivialmente auto-esplicativo (enforced da ESLint).
- Nessun commit o branch va eseguito automaticamente durante l'esecuzione di questo piano: i comandi `git commit`/`git checkout -b` riportati in ogni task sono istruzioni testuali per lo sviluppatore, da eseguire solo dopo la sua approvazione esplicita (vedi `wm-plan` → Fase: execution → review-gate).
- Percorso base per tutti i path relativi di questo piano: `core/` (repo principale `webmapp-app`).
- Nessuna regressione sui 3 fix di oc:8313 già coperti da `map-details.component.spec.ts` (galleria immagini, gesture da stato `'background'`) — l'intera suite esistente deve restare verde.

---

## File Structure

| File | Responsabilità |
|---|---|
| `tsconfig.spec.json` (**modifica**) | Estende la discovery test a `src/app/components/poi-properties` |
| `angular.json` (**modifica**) | Stesso scope, lato `architect.test.options.include` |
| `src/app/components/poi-properties/poi-properties.component.ts` (**modifica**) | `@Output() configDetailToggled`; pass-through |
| `src/app/components/poi-properties/poi-properties.component.html` (**modifica**) | Binding `(toggled)` su `<wm-config-detail>` |
| `src/app/components/poi-properties/poi-properties.component.spec.ts` (**nuovo**) | Verifica pass-through |
| `src/app/pages/map/map.page.html` (**modifica**) | Binding `(configDetailToggled)` su `wm-home-layer`/`wm-poi-properties`/`wm-track-properties`, verso `#details.onProjectedContentToggle($event)` |
| `src/app/constants/map.ts` (**modifica**) | Nuova costante `PROJECTED_CONTENT_TOGGLE_TRANSITION_FALLBACK_MS` |
| `src/app/pages/map/map-details/map-details.component.ts` (**modifica**) | `onProjectedContentToggle()`, guardia in `_applyContentResize()`, `_applyHeightForStatus()` ritorna una Promise |
| `src/app/pages/map/map-details/map-details.component.spec.ts` (**modifica**) | Nuovi test per la sequenza toggle→transitionend/timeout→resize→scroll |

---

## Task 1: Estendere la discovery dei test a `poi-properties`

**Files:**
- Modify: `tsconfig.spec.json`
- Modify: `angular.json`

**Interfaces:** nessuna (solo configurazione)

- [ ] **Step 1: Aggiungere `poi-properties` a `tsconfig.spec.json`**

In `core/tsconfig.spec.json`, modificare l'array `include`:

```json
  "include": [
    "src/app/services/**/*.spec.ts",
    "src/app/pages/favourites/**/*.spec.ts",
    "src/app/pages/map/map-details/**/*.spec.ts",
    "src/app/components/poi-properties/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
```

- [ ] **Step 2: Aggiungere `poi-properties` a `angular.json`**

In `core/angular.json`, nel progetto `webmapp` → `architect.test.options.include`, aggiungere la nuova riga:

```json
            "include": [
              "src/app/services",
              "src/app/pages/favourites",
              "src/app/pages/map/map-details",
              "src/app/components/poi-properties"
            ],
```

- [ ] **Step 3: Verificare che la configurazione sia valida**

Run: `cd core && npx ng test --include='src/app/components/poi-properties/**/*.spec.ts' --watch=false 2>&1 | tail -20`

Expected: Karma parte senza errori di configurazione (0 test eseguiti è atteso, dato che `poi-properties.component.spec.ts` non esiste ancora — verrà creato al Task 2).

- [ ] **Step 4: Commit**

```bash
cd core
git add tsconfig.spec.json angular.json
git commit -m "chore(oc:8427): include poi-properties in test discovery"
```

---

## Task 2: `PoiPropertiesComponent` — pass-through `configDetailToggled`

**Files:**
- Modify: `src/app/components/poi-properties/poi-properties.component.ts`
- Modify: `src/app/components/poi-properties/poi-properties.component.html`
- Test: `src/app/components/poi-properties/poi-properties.component.spec.ts` (nuovo)

**Interfaces:**
- Consumes: `ConfigDetailComponent.toggled` (wm-core, plan.md di quel repo), `ConfigDetailToggleEvent` da `@wm-types/config`
- Produces: `PoiPropertiesComponent.configDetailToggled: EventEmitter<ConfigDetailToggleEvent>`; `onConfigDetailToggled(event: ConfigDetailToggleEvent): void`

- [ ] **Step 1: Scrivere il test che deve fallire**

Creare `core/src/app/components/poi-properties/poi-properties.component.spec.ts`:

```typescript
import {PoiPropertiesComponent} from './poi-properties.component';
import {Store} from '@ngrx/store';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {DomSanitizer} from '@angular/platform-browser';
import {of} from 'rxjs';

describe('PoiPropertiesComponent — pass-through configDetailToggled (oc:8427)', () => {
  function createComponent(): PoiPropertiesComponent {
    const storeSpy = jasmine.createSpyObj<Store>('Store', ['select']);
    storeSpy.select.and.returnValue(of(null));
    const geolocationSvcSpy = jasmine.createSpyObj<GeolocationService>('GeolocationService', [
      'getDistanceFromCurrentLocation$',
    ]);
    geolocationSvcSpy.getDistanceFromCurrentLocation$.and.returnValue(of(null));
    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', [
      'bypassSecurityTrustHtml',
    ]);
    return new PoiPropertiesComponent(storeSpy, geolocationSvcSpy, sanitizerSpy);
  }

  it('inoltra l\'evento ricevuto da wm-config-detail via configDetailToggled', () => {
    const component = createComponent();
    const emitted: any[] = [];
    component.configDetailToggled.subscribe(e => emitted.push(e));
    const fakeEvent = {opening: true, headerElement: document.createElement('button')};

    component.onConfigDetailToggled(fakeEvent);

    expect(emitted).toEqual([fakeEvent]);
  });
});
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `cd core && npx ng test --include='src/app/components/poi-properties/**/*.spec.ts' --watch=false`

Expected: FAIL — `Property 'configDetailToggled' does not exist on type 'PoiPropertiesComponent'`.

- [ ] **Step 3: Implementare il pass-through**

In `src/app/components/poi-properties/poi-properties.component.ts`, modificare l'import da `'@angular/core'` (riga 1):

```typescript
import {Component, ChangeDetectionStrategy, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
```

Aggiungere un nuovo import, subito dopo l'import esistente da `'@angular/forms'` (riga 11):

```typescript
import {ConfigDetailToggleEvent} from '@wm-types/config';
```

Aggiungere, in coda alla classe `PoiPropertiesComponent` (dopo il metodo `sanitize`):

```typescript

  /**
   * Inoltra al consumer (`wm-map-details`, vedi `map.page.html`) l'evento di apertura/chiusura di
   * un item di `wm-config-detail`, annidato nel proprio template — `wm-map-details` non può
   * ascoltarlo direttamente perché è contenuto proiettato, non un figlio diretto del suo template
   * (oc:8427).
   *
   * @param event Evento ricevuto da `wm-config-detail`.
   */
  onConfigDetailToggled(event: ConfigDetailToggleEvent): void {
    this.configDetailToggled.emit(event);
  }
```

E il nuovo `@Output()`, subito dopo `showUsefulUrls$` (ultima property della classe prima del costruttore):

```typescript
  /**
   * Notifica al consumer (`wm-map-details`) ogni apertura/chiusura di un item di
   * `wm-config-detail` annidato in questo template (oc:8427).
   */
  @Output() readonly configDetailToggled = new EventEmitter<ConfigDetailToggleEvent>();
```

In `src/app/components/poi-properties/poi-properties.component.html`, modificare la riga:

```html
    <wm-config-detail [groups]="properties?.config_detail"></wm-config-detail>
```

in:

```html
    <wm-config-detail
      [groups]="properties?.config_detail"
      (toggled)="onConfigDetailToggled($event)"
    ></wm-config-detail>
```

- [ ] **Step 4: Eseguire il test e verificare che passi**

Run: `cd core && npx ng test --include='src/app/components/poi-properties/**/*.spec.ts' --watch=false`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd core
git add src/app/components/poi-properties/poi-properties.component.ts src/app/components/poi-properties/poi-properties.component.html src/app/components/poi-properties/poi-properties.component.spec.ts
git commit -m "feat(oc:8427): forward wm-config-detail toggle event from wm-poi-properties"
```

---

## Task 3: Wiring in `map.page.html`

**Files:**
- Modify: `src/app/pages/map/map.page.html`

**Interfaces:**
- Consumes: `configDetailToggled` di `WmHomeLayerComponent`/`TrackPropertiesComponent` (wm-core) e `PoiPropertiesComponent` (Task 2); `MapDetailsComponent.onProjectedContentToggle()` (Task 4, deve esistere prima di verificare questo task senza errori di compilazione template — i due task possono comunque essere scritti in quest'ordine, l'errore di compilazione è atteso e transitorio fino al Task 4)

Nessun test dedicato: è puro wiring di template, verificato dalla compilazione (`ng build`) e dai test end-to-end manuali del Task 5.

- [ ] **Step 1: Aggiungere i tre binding**

In `src/app/pages/map/map.page.html`, alla riga 65:

```html
                <wm-home-layer></wm-home-layer>
```

sostituire con:

```html
                <wm-home-layer
                  (configDetailToggled)="details.onProjectedContentToggle($event)"
                ></wm-home-layer>
```

Alla riga 70:

```html
              <wm-poi-properties></wm-poi-properties>
```

sostituire con:

```html
              <wm-poi-properties
                (configDetailToggled)="details.onProjectedContentToggle($event)"
              ></wm-poi-properties>
```

Alle righe 73-77:

```html
              <wm-track-properties
                (dismiss)="updateEcTrack()"
                (click)="savePosition()"
                class="webmapp-track-details"
              >
```

sostituire con:

```html
              <wm-track-properties
                (dismiss)="updateEcTrack()"
                (click)="savePosition()"
                (configDetailToggled)="details.onProjectedContentToggle($event)"
                class="webmapp-track-details"
              >
```

(`details` è il template reference variable già dichiarato alla riga 8, `<wm-map-details #details (closeEVT)="close()">` — resta accessibile qui nonostante l'annidamento in più blocchi `*ngIf`/`ng-template`, essendo tutti parte dello stesso template di `MapPage`.)

- [ ] **Step 2: Verificare che il progetto compili (atteso un errore transitorio se il Task 4 non è ancora stato eseguito)**

Run: `cd core && npx ng build --configuration=camminiditalia 2>&1 | tail -50`

Expected: se il Task 4 è già stato completato, nessun errore. Se non ancora, unico errore atteso: `Property 'onProjectedContentToggle' does not exist on type 'MapDetailsComponent'` — verrà risolto dal Task 4.

- [ ] **Step 3: Commit**

```bash
cd core
git add src/app/pages/map/map.page.html
git commit -m "feat(oc:8427): wire config-detail toggle events to map-details panel"
```

---

## Task 4: `MapDetailsComponent` — coordinamento transizione→resize→scroll

**Files:**
- Modify: `src/app/constants/map.ts`
- Modify: `src/app/pages/map/map-details/map-details.component.ts`
- Test: `src/app/pages/map/map-details/map-details.component.spec.ts` (modifica)

**Interfaces:**
- Consumes: `ConfigDetailToggleEvent` da `@wm-types/config`
- Produces: `MapDetailsComponent.onProjectedContentToggle(event: ConfigDetailToggleEvent): void`; `_applyHeightForStatus()` ora ritorna `Promise<void>` (era `void`)

- [ ] **Step 1: Scrivere i test che devono fallire**

Aggiungere a `map-details.component.spec.ts` (in coda al file, prima dell'ultima `});` di chiusura del `describe` principale — NON toccare i test esistenti):

```typescript
  describe('onProjectedContentToggle (oc:8427)', () => {
    function dispatchTransitionEnd(wrapper: HTMLElement, propertyName = 'grid-template-rows') {
      wrapper.dispatchEvent(new Event('transitionend') as any);
      Object.defineProperty(
        wrapper,
        '__lastTransitionEndPropertyName',
        {value: propertyName, configurable: true},
      );
    }

    function createComponentWithWrapper(status: string): {
      component: MapDetailsComponent;
      wrapper: HTMLElement;
    } {
      const component = createComponent(of(status));
      (component as any).dragHandleIcon = {nativeElement: document.createElement('div')};
      const wrapper = document.createElement('div');
      (component as any).contentWrapperRef = {nativeElement: wrapper};
      component.ngAfterViewInit();
      return {component, wrapper};
    }

    it('in stato "full": attende transitionend, poi ridimensiona e infine scrolla (in quest\'ordine)', async () => {
      const {component, wrapper} = createComponentWithWrapper('full');
      const callOrder: string[] = [];
      spyOn(component as any, '_applyHeightForStatus').and.callFake(() => {
        callOrder.push('resize');
        return Promise.resolve();
      });
      const fakeHeader = document.createElement('button');
      spyOn(fakeHeader, 'scrollIntoView').and.callFake(() => callOrder.push('scroll'));

      const togglePromise = component.onProjectedContentToggle({
        opening: true,
        headerElement: fakeHeader,
      });
      wrapper.dispatchEvent(
        Object.assign(new Event('transitionend'), {propertyName: 'grid-template-rows'}),
      );
      await togglePromise;

      expect(callOrder).toEqual(['resize', 'scroll']);
      expect((component as any)._applyHeightForStatus).toHaveBeenCalledWith(
        'full',
        jasmine.any(Boolean),
      );
    });

    it('ignora transitionend di proprietà diverse da grid-template-rows', async () => {
      const {component, wrapper} = createComponentWithWrapper('full');
      const applySpy = spyOn(component as any, '_applyHeightForStatus').and.returnValue(
        Promise.resolve(),
      );
      const fakeHeader = document.createElement('button');
      spyOn(fakeHeader, 'scrollIntoView');

      const togglePromise = component.onProjectedContentToggle({
        opening: true,
        headerElement: fakeHeader,
      });
      wrapper.dispatchEvent(Object.assign(new Event('transitionend'), {propertyName: 'border-color'}));

      expect(applySpy).not.toHaveBeenCalled();

      wrapper.dispatchEvent(
        Object.assign(new Event('transitionend'), {propertyName: 'grid-template-rows'}),
      );
      await togglePromise;

      expect(applySpy).toHaveBeenCalled();
    });

    it('usa il fallback a timeout se transitionend non arriva mai (transizione interrotta)', async () => {
      jasmine.clock().install();
      try {
        const {component} = createComponentWithWrapper('full');
        const applySpy = spyOn(component as any, '_applyHeightForStatus').and.returnValue(
          Promise.resolve(),
        );
        const fakeHeader = document.createElement('button');
        spyOn(fakeHeader, 'scrollIntoView');

        const togglePromise = component.onProjectedContentToggle({
          opening: true,
          headerElement: fakeHeader,
        });
        jasmine.clock().tick(500);
        await togglePromise;

        expect(applySpy).toHaveBeenCalled();
        expect(fakeHeader.scrollIntoView).toHaveBeenCalled();
      } finally {
        jasmine.clock().uninstall();
      }
    });

    it('un secondo toggle ravvicinato annulla la sequenza di attesa precedente (nessuna doppia esecuzione)', async () => {
      jasmine.clock().install();
      try {
        const {component, wrapper} = createComponentWithWrapper('full');
        const applySpy = spyOn(component as any, '_applyHeightForStatus').and.returnValue(
          Promise.resolve(),
        );
        const firstHeader = document.createElement('button');
        const secondHeader = document.createElement('button');
        spyOn(firstHeader, 'scrollIntoView');
        spyOn(secondHeader, 'scrollIntoView');

        component.onProjectedContentToggle({opening: true, headerElement: firstHeader});
        const secondTogglePromise = component.onProjectedContentToggle({
          opening: true,
          headerElement: secondHeader,
        });
        wrapper.dispatchEvent(
          Object.assign(new Event('transitionend'), {propertyName: 'grid-template-rows'}),
        );
        await secondTogglePromise;
        jasmine.clock().tick(500);

        expect(applySpy).toHaveBeenCalledTimes(1);
        expect(firstHeader.scrollIntoView).not.toHaveBeenCalled();
        expect(secondHeader.scrollIntoView).toHaveBeenCalled();
      } finally {
        jasmine.clock().uninstall();
      }
    });

    it('in stato diverso da "full" (es. "open"): non ridimensiona, scrolla comunque dopo la transizione', async () => {
      const {component, wrapper} = createComponentWithWrapper('open');
      const applySpy = spyOn(component as any, '_applyHeightForStatus');
      const fakeHeader = document.createElement('button');
      spyOn(fakeHeader, 'scrollIntoView');

      const togglePromise = component.onProjectedContentToggle({
        opening: true,
        headerElement: fakeHeader,
      });
      wrapper.dispatchEvent(
        Object.assign(new Event('transitionend'), {propertyName: 'grid-template-rows'}),
      );
      await togglePromise;

      expect(applySpy).not.toHaveBeenCalled();
      expect(fakeHeader.scrollIntoView).toHaveBeenCalledWith({block: 'start', behavior: 'smooth'});
    });

    it('in chiusura (opening: false): nessuno scroll, ma il resize in "full" avviene comunque', async () => {
      const {component, wrapper} = createComponentWithWrapper('full');
      const applySpy = spyOn(component as any, '_applyHeightForStatus').and.returnValue(
        Promise.resolve(),
      );

      const togglePromise = component.onProjectedContentToggle({
        opening: false,
        headerElement: null,
      });
      wrapper.dispatchEvent(
        Object.assign(new Event('transitionend'), {propertyName: 'grid-template-rows'}),
      );
      await togglePromise;

      expect(applySpy).toHaveBeenCalled();
    });

    it('_applyContentResize non fa nulla mentre è in corso l\'attesa di un toggle annunciato', () => {
      const {component} = createComponentWithWrapper('full');
      const applySpy = spyOn(component as any, '_applyHeightForStatus');
      const fakeHeader = document.createElement('button');

      component.onProjectedContentToggle({opening: true, headerElement: fakeHeader});
      (component as any)._applyContentResize();

      expect(applySpy).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/**/*.spec.ts' --watch=false`

Expected: FAIL — `Property 'onProjectedContentToggle' does not exist on type 'MapDetailsComponent'`.

- [ ] **Step 3: Implementare la costante di fallback**

In `src/app/constants/map.ts`, subito dopo `MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS`:

```typescript
/**
 * Fallback quando la transizione CSS di `wm-config-detail` (0.3s su `grid-template-rows`, in
 * `config-detail.component.scss`, submodule wm-core — verificare quel file se questo valore va
 * aggiornato) non emette `transitionend`: caso garantito dalla specifica CSS quando una seconda
 * transizione la interrompe prima che finisca, non un edge case raro (oc:8427). 300ms di durata
 * nota + 100ms di margine.
 */
export const PROJECTED_CONTENT_TOGGLE_TRANSITION_FALLBACK_MS = 400;
```

- [ ] **Step 4: Implementare `onProjectedContentToggle` e la guardia in `_applyContentResize`**

In `map-details.component.ts`, aggiungere l'import del tipo, subito dopo l'import da `'./map-details-height.util'` (riga 25):

```typescript
import {computeTargetHeight} from './map-details-height.util';
import {ConfigDetailToggleEvent} from '@wm-types/config';
```

Aggiungere l'import della nuova costante, modificando la riga 23:

```typescript
import {
  DETAILS_ANIMATION_DURATION,
  MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS,
  PROJECTED_CONTENT_TOGGLE_TRANSITION_FALLBACK_MS,
} from 'src/app/constants/map';
```

Aggiungere un nuovo campo privato, subito dopo `_contentResizeSub` (riga 45):

```typescript
  private _pendingProjectedToggleCleanup: (() => void) | null = null;
  private _awaitingProjectedTransition = false;
```

Sostituire il metodo `_applyHeightForStatus` esistente:

```typescript
  private _applyHeightForStatus(status: 'open' | 'full', instant = false): void {
    const ceiling = this._resizeCeilingForStatus(status);
    const target = this._isGalleryContentActive()
      ? ceiling
      : computeTargetHeight(
          this._measureContentHeight(),
          this._measureHeaderHeight(),
          this.minInfoheight,
          ceiling,
        );
    this.setAnimations(`${this._getCurrentHeight()}px`, `${target}px`, instant);
  }
```

con (unica differenza: `return` sul `setAnimations` finale, per permettere a `onProjectedContentToggle` di attendere la fine del resize prima di scrollare):

```typescript
  private _applyHeightForStatus(status: 'open' | 'full', instant = false): Promise<void> {
    const ceiling = this._resizeCeilingForStatus(status);
    const target = this._isGalleryContentActive()
      ? ceiling
      : computeTargetHeight(
          this._measureContentHeight(),
          this._measureHeaderHeight(),
          this.minInfoheight,
          ceiling,
        );
    return this.setAnimations(`${this._getCurrentHeight()}px`, `${target}px`, instant);
  }
```

Sostituire il metodo `_applyContentResize` esistente:

```typescript
  private _applyContentResize(): void {
    if (this._gestureActive) {
      return;
    }
    if (this._currentStatus === 'full') {
      this._applyHeightForStatus('full', this._prefersReducedMotion());
    }
  }
```

con (nuova guardia `_awaitingProjectedTransition`):

```typescript
  /**
   * Reagisce a una variazione di altezza del contenuto rilevata dal ResizeObserver (debounced).
   * Non fa nulla mentre una gesture è in corso, mentre lo stato non è "full" (vedi doc originale),
   * o mentre è in corso l'attesa esplicita di una transizione nota annunciata da
   * `onProjectedContentToggle()` — quel percorso gestisce da sé il resize a fine transizione,
   * il debounce generico qui interverrebbe a metà transizione riproducendo il bug che
   * `onProjectedContentToggle` risolve (oc:8427).
   */
  private _applyContentResize(): void {
    if (this._gestureActive || this._awaitingProjectedTransition) {
      return;
    }
    if (this._currentStatus === 'full') {
      this._applyHeightForStatus('full', this._prefersReducedMotion());
    }
  }
```

Aggiungere il nuovo metodo pubblico, subito dopo `open()`:

```typescript
  /**
   * Riceve la notifica di apertura/chiusura di un item di `wm-config-detail` (o di qualunque
   * consumer che inoltri lo stesso evento — `wm-home-layer`/`wm-track-properties` in wm-core,
   * `wm-poi-properties` in questo repo), tutti montati come contenuto proiettato di questo
   * pannello. Sospende il resize "generico" guidato da `ResizeObserver` per la durata della
   * transizione CSS nota (0.3s, `grid-template-rows` in `config-detail.component.scss`,
   * submodule wm-core) e attende la sua fine reale (`transitionend`, filtrato sulla proprietà
   * corretta per non agganciarsi ad altre transizioni più brevi nello stesso sottoalbero) prima
   * di ridimensionare il pannello (solo in stato "full") ed eseguire lo scroll automatico (solo
   * in apertura) — mai in parallelo. Un fallback a timeout copre il caso, garantito dalla
   * specifica CSS e non raro, in cui un secondo toggle interrompe la transizione prima che
   * `transitionend` scatti. Un nuovo toggle ricevuto mentre una sequenza precedente è ancora in
   * attesa annulla quella precedente, senza eseguirne gli effetti (oc:8427).
   *
   * @param event Evento ricevuto dal consumer proiettato.
   */
  onProjectedContentToggle(event: ConfigDetailToggleEvent): Promise<void> {
    this._pendingProjectedToggleCleanup?.();
    this._awaitingProjectedTransition = true;

    const wrapper: HTMLElement | undefined = this.contentWrapperRef?.nativeElement;

    return new Promise<void>(resolve => {
      let settled = false;

      const onTransitionEnd = (ev: TransitionEvent): void => {
        if (ev.propertyName === 'grid-template-rows') {
          settle();
        }
      };

      const timeoutId = setTimeout(settle, PROJECTED_CONTENT_TOGGLE_TRANSITION_FALLBACK_MS);

      const cleanup = (): void => {
        wrapper?.removeEventListener('transitionend', onTransitionEnd as EventListener);
        clearTimeout(timeoutId);
      };

      const settle = async (): Promise<void> => {
        if (settled) return;
        settled = true;
        cleanup();
        this._pendingProjectedToggleCleanup = null;
        this._awaitingProjectedTransition = false;

        if (this._currentStatus === 'full') {
          await this._applyHeightForStatus('full', this._prefersReducedMotion());
        }
        if (event.opening && event.headerElement) {
          event.headerElement.scrollIntoView({block: 'start', behavior: 'smooth'});
        }
        resolve();
      };

      wrapper?.addEventListener('transitionend', onTransitionEnd as EventListener);

      this._pendingProjectedToggleCleanup = () => {
        if (settled) return;
        settled = true;
        cleanup();
        this._awaitingProjectedTransition = false;
        resolve();
      };
    });
  }
```

Aggiungere, in `ngOnDestroy()`, la pulizia della sequenza eventualmente in corso:

```typescript
  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._contentResizeSub?.unsubscribe();
    this._pendingProjectedToggleCleanup?.();
  }
```

- [ ] **Step 5: Eseguire i test e verificare che passino**

Run: `cd core && npx ng test --include='src/app/pages/map/map-details/**/*.spec.ts' --watch=false`

Expected: PASS — tutti i test esistenti (oc:8313) più i nuovi (oc:8427) verdi.

- [ ] **Step 6: Verificare che l'intero progetto compili**

Run: `cd core && npx ng build --configuration=camminiditalia 2>&1 | tail -50`

Expected: nessun errore (il Task 3, se non ancora eseguito, deve essere completato prima di questo step per una build pulita).

- [ ] **Step 7: Commit**

```bash
cd core
git add src/app/constants/map.ts src/app/pages/map/map-details/map-details.component.ts src/app/pages/map/map-details/map-details.component.spec.ts
git commit -m "feat(oc:8427): sequence config-detail transition, panel resize and scroll in full mode"
```

---

## Task 5: Verifica manuale end-to-end su device reale

**Files:** nessuno (solo verifica)

Prerequisito: Task 1-4 di questo piano, più i plan.md di `wm-types` e `wm-core` completamente eseguiti e i submodule aggiornati in questo repo.

- [ ] **Step 1: Build e avvio su simulatore/device iOS**

Run: `cd core && npx cap sync ios && npx cap open ios` (o il flusso equivalente già in uso nel repo per testare su simulatore/device reale)

- [ ] **Step 2: Scenario 1 — scroll accordion (bug 1)**

Aprire un cammino/POI con almeno due box `config_detail` di lunghezza molto diversa. Aprire il box lungo, scrollare fino in fondo, poi aprire il box corto: l'header del box appena aperto deve portarsi in cima al viewport con scroll fluido, senza area vuota residua.

- [ ] **Step 3: Scenario 2 — pannello in modalità full (bug 2)**

Con lo stesso contenuto, espandere il pannello a schermo intero (drag-handle o pulsante dedicato), poi aprire/chiudere un box: il movimento deve percepirsi come un'unica sequenza pulita (transizione contenuto → resize pannello → scroll), non come scatti sovrapposti.

- [ ] **Step 4: Scenario 3 — toggle rapido**

Aprire un box, poi toccare immediatamente un secondo box prima che l'animazione del primo sia conclusa: verificare che il pannello non si blocchi in uno stato intermedio e che lo scroll finale sia coerente con il secondo box (non il primo).

- [ ] **Step 5: Ripetere su Android (device reale, non solo emulatore)**

Stesso set di verifiche del Step 2-4, per la fragilità nota di `scrollIntoView({behavior:'smooth'})` e delle transizioni CSS su WebView non-Chromium.

- [ ] **Step 6: Segnalare eventuali scostamenti in `docs/features/8427-fix-scroll-animazione-doppia-wm-config-detail/notes.md`**

Se emergono comportamenti diversi da quanto atteso, annotarli in `notes.md` (Fase: notes del workflow `wm-plan`) prima di procedere ai commit finali.

---

## Self-Review

**Spec coverage:**
- "In stato full, il resize deve attendere la fine della transizione CSS... non più solo debounce" → Task 4, `onProjectedContentToggle`.
- "Un secondo toggle ricevuto mentre la sequenza precedente è in corso resetta la finestra di attesa" → Task 4, `_pendingProjectedToggleCleanup`, test dedicato.
- "Dopo il resize, eseguire lo scroll — mai in parallelo" → Task 4, sequenza `await` interna a `settle()`, verificata da `callOrder` nel test.
- "Per tutti gli altri resize non annunciati, comportamento invariato" → Task 4, guardia `_awaitingProjectedTransition` non attiva fuori dalla finestra di un toggle annunciato; nessuna modifica al `ResizeObserver`/debounce esistente.
- "Nessuna regressione sui 3 fix di oc:8313" → Task 4, suite esistente non modificata, solo estesa.
- "Verifica manuale su device reale" → Task 5.
- Pass-through `poi-properties` (emerso durante l'analisi del codice reale in Fase: write-plan) → Task 2.
- Wiring `map.page.html` verso i tre consumer proiettati → Task 3.

**Placeholder scan:** nessuno — ogni step ha codice completo.

**Type consistency:** `ConfigDetailToggleEvent{opening, headerElement}` usato identico a quanto definito nel plan.md di `wm-types` e consumato nei plan.md di `wm-core` — nomi dei campi e forma del tipo verificati coerenti tra i tre piani. `onProjectedContentToggle` è il nome usato in modo identico nel Task 3 (wiring template) e nel Task 4 (implementazione).
