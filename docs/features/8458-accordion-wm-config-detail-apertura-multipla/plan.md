> Ticket: oc:8458

# Accordion wm-config-detail: apertura multipla e rimozione scrollIntoView — webmapp-app Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rimuovere dal pannello mappa (`MapDetailsComponent`) l'handler dell'evento `configDetailSettled` (scroll automatico + relativo binding), che smette di essere dispacciato da `wm-config-detail` (wm-core) in questo stesso ciclo; aggiungere copertura Cypress esplicita per il nuovo comportamento multi-open.

**Architecture:** `MapDetailsComponent` proietta `wm-home-layer`/`wm-track-properties`/`wm-poi-properties` (wm-core/webmapp-app) e ascoltava `configDetailSettled` in bubbling con un solo binding su `wm-map-details`. Rimuovendo l'evento a monte (wm-core), l'handler locale diventa dead code da eliminare. Nessuna modifica ai mount point di `wm-config-detail`.

**Tech Stack:** Angular 20, Ionic 8, TypeScript strict, Jasmine/Karma, Cypress 14.

**Spec:** `docs/features/8458-accordion-wm-config-detail-apertura-multipla/overview.md` (questo repo).

**Piani correlati (stesso ticket, altri repo):** `core/src/app/shared/wm-core/docs/features/8458-.../plan.md` (rimuove `configDetailSettled` alla fonte — questo piano è indipendente per import/compilazione, ma va eseguito nello stesso ciclo perché altrimenti l'evento smette di arrivare mentre l'handler qui resta, dead code silenzioso), `core/src/app/shared/wm-types/docs/features/8458-.../plan.md` (rimuove il tipo `ConfigDetailToggleEvent`, va eseguito per ultimo tra i tre).

## Global Constraints

- Nessuna modifica ai mount point di `wm-config-detail` (`home-layer.component.html`/`track-properties.component.html` in wm-core, `poi-properties.component.html` in questo repo) — restano invariati.
- I test Cypress esistenti in `config-detail-boxes.cy.ts` che aprono un solo item alla volta restano validi e non vanno modificati.
- Il nuovo test Cypress deve seguire lo stesso stile/helper (`clearTestState`, `mockGetTrack`, `openLayer`/`openTrack`, scope `wm-map-details`) già in uso nel file.

---

### Task 1: `MapDetailsComponent` — rimozione del consumer di `configDetailSettled`

**Files:**
- Modify: `core/src/app/pages/map/map-details/map-details.component.ts`
- Modify: `core/src/app/pages/map/map.page.html`
- Modify (rimozione mirata): `core/src/app/pages/map/map-details/map-details.component.spec.ts`

**Interfaces:**
- Consumes: nessuna — dipende solo dal fatto che `wm-config-detail` (wm-core, piano correlato) smetta di dispacciare `configDetailSettled` nello stesso ciclo di rilascio, non da un import diretto.
- Produces: nessuna nuova interfaccia.

- [ ] **Step 1: Rimuovere il binding `(configDetailSettled)` da `map.page.html`**

Riga 8-12, sostituire:

```html
<wm-map-details
  #details
  (closeEVT)="close()"
  (configDetailSettled)="details.onConfigDetailSettled($event)"
>
```

con:

```html
<wm-map-details #details (closeEVT)="close()">
```

- [ ] **Step 2: Rimuovere `onConfigDetailSettled()` e `_isFullyInView()` da `map-details.component.ts`**

Rimuovere interamente il metodo (con il commento JSDoc sopra, righe circa 152-178):

```typescript
  onConfigDetailSettled(event: Event): void {
    const {opening, headerElement} = (event as CustomEvent<ConfigDetailToggleEvent>).detail;

    if (opening && headerElement && !this._isFullyInView(headerElement)) {
      headerElement.scrollIntoView({block: 'nearest', behavior: 'smooth'});
    }
  }
```

e rimuovere interamente `_isFullyInView()` (righe circa 337-349):

```typescript
  private _isFullyInView(el: HTMLElement): boolean {
    let parent: HTMLElement | null = el.parentElement;
    while (parent && parent !== document.body) {
      const style = getComputedStyle(parent);
      if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) {
        break;
      }
      parent = parent.parentElement;
    }
    const containerRect = (parent ?? document.documentElement).getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return elRect.top >= containerRect.top && elRect.bottom <= containerRect.bottom;
  }
```

Rimuovere l'import ora inutilizzato (riga 26):

```typescript
import {ConfigDetailToggleEvent} from '@wm-types/config';
```

- [ ] **Step 3: Rimuovere i blocchi di test dedicati in `map-details.component.spec.ts`**

Il file contiene, dopo il test `ngOnDestroy` (che termina alla riga 298), due blocchi `describe` interamente dedicati al comportamento rimosso: `describe('onConfigDetailSettled (oc:8427)', ...)` (righe 300-368) e `describe('_isFullyInView (oc:8427)', ...)` (righe 370-410) — coincidono con la fine del file (riga 411, chiusura del `describe` esterno). Rimuovere entrambi i blocchi per intero (righe 300-410), lasciando il file terminare subito dopo il test `ngOnDestroy` (riga 298) con la sola chiusura del `describe` esterno:

```typescript
    expect((component as any)._subscriptions.closed).toBeTrue();
  });
});
```

- [ ] **Step 4: Eseguire i test del pannello mappa**

Run: `cd core && npx ng test --watch=false --include='**/map-details/**/*.spec.ts'`
Expected: PASS — nessun test rotto, nessun riferimento residuo a `ConfigDetailToggleEvent`/`onConfigDetailSettled`/`_isFullyInView` in questo file (verificabile con `grep -n "ConfigDetailToggleEvent\|onConfigDetailSettled\|_isFullyInView" core/src/app/pages/map/map-details/map-details.component.ts core/src/app/pages/map/map-details/map-details.component.spec.ts` → nessun risultato).

- [ ] **Step 5: Commit**

```bash
cd /Users/peco/Documents/Apps/webmapp-app
git add core/src/app/pages/map/map-details/map-details.component.ts \
  core/src/app/pages/map/map-details/map-details.component.spec.ts \
  core/src/app/pages/map/map.page.html
git commit -m "feat(oc:8458): rimuovere lo scroll automatico su configDetailSettled dal pannello mappa"
```

---

### Task 2: Cypress — nuovo test di regressione per il multi-open

**Files:**
- Modify: `core/cypress/e2e/app_52/config-detail-boxes.cy.ts`

**Interfaces:**
- Consumes: comportamento multi-open di `wm-config-detail` implementato nel piano wm-core (Task 1 di quel piano) — questo task presuppone che sia già stato eseguito e il submodule aggiornato, altrimenti il test fallisce contro il comportamento vecchio (esclusivo).
- Produces: nessuna nuova interfaccia — solo copertura di test.

- [ ] **Step 1: Aggiungere il nuovo test subito dopo `'renders config_detail as a closed-by-default accordion on the EcTrack detail'` (dopo la riga 179)**

```typescript
  it('keeps multiple config_detail items open at the same time (oc:8458)', () => {
    clearTestState();
    mockGetTrack('86095', ec_track_properties_with_config_detail).as('getApiTrack');
    cy.visit('/');
    goHome(false);

    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);
    cy.wait('@getApiTrack');

    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .eq(0)
      .find('.wm-config-detail-header')
      .click();
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .eq(1)
      .find('.wm-config-detail-header')
      .click();

    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-content')
      .should('have.length', 2);
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .eq(0)
      .find('.wm-config-detail-content')
      .should('contain.html', configDetailGroups[0].items[0].content.en);
    cy.get('wm-map-details wm-track-properties wm-config-detail .wm-config-detail-item')
      .eq(1)
      .find('.wm-config-detail-content')
      .should('contain.html', configDetailGroups[0].items[1].content.en);
  });
```

- [ ] **Step 2: Eseguire il test Cypress**

Run: `cd core && npx cypress run --spec cypress/e2e/app_52/config-detail-boxes.cy.ts`
Expected: PASS (richiede che i piani wm-core sia già stati eseguiti e il submodule aggiornato — vedi Interfaces sopra; se eseguito prima, fallisce con solo 1 `.wm-config-detail-content` presente invece di 2, comportamento atteso della vecchia apertura esclusiva).

- [ ] **Step 3: Commit**

```bash
cd /Users/peco/Documents/Apps/webmapp-app
git add core/cypress/e2e/app_52/config-detail-boxes.cy.ts
git commit -m "test(oc:8458): aggiungere copertura Cypress per l'apertura multipla di wm-config-detail"
```

---

## Self-Review

**Spec coverage:** rimozione handler/binding `configDetailSettled` (Task 1, Step 1-2), riscrittura (rimozione mirata) di `map-details.component.spec.ts` (Task 1, Step 3), nuovo test Cypress multi-open (Task 2) — tutti i requisiti dell'overview webmapp-app sono coperti.

**Placeholder scan:** nessun TBD — ogni step ha codice completo o comando eseguibile.

**Type consistency:** il nuovo test Cypress (Task 2) usa `configDetailGroups`/`ec_track_properties_with_config_detail`, entrambi già definiti nello stesso file (righe 19-36 e 66) e già usati dal test esistente immediatamente precedente — nessun nuovo identificatore introdotto che richieda coordinamento con altri task.
