> Ticket: oc:8465

# Preferiti: aprire di default il tab Cammini (layer), non Sentieri — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **⚠️ No commit o branch automatici:** i comandi `git commit`/`git add` nei passi sottostanti sono istruzioni testuali per lo sviluppatore, non azioni da eseguire autonomamente durante l'esecuzione del piano. Nessun commit va eseguito senza conferma esplicita del developer (Fase: review-gate di `wm-plan`).

**Goal:** Far sì che `FavouritesPage` apra di default il tab "Cammini" (`layers`) invece di "Sentieri" (`tracks`) quando lo shard ha il tab Cammini abilitato, senza reintrodurre la race condition da cold start che ha causato il bug originale.

**Architecture:** `FavouritesPage.selectedSegment` smette di essere un default statico sincrono e viene risolto in `ngOnInit()` con una singola sottoscrizione `take(1)`, agganciata a `isConfLoaded$` (già usato altrove nel repo con lo stesso scopo, `app.component.ts:170-184`) per garantire che il valore di `confOPTIONSShowFavorites` letto sia quello reale (post-fetch di `config.json`), non il fallback iniziale. Nessuna modifica al template, nessun fileReplacements, nessun submodule coinvolto.

**Tech Stack:** Angular 20, NgRx 20, RxJS, Karma/Jasmine.

**Spec:** `docs/features/8465-preferiti-aprire-di-default-il-tab-cammini-non-sentieri/overview.md`

## Global Constraints

- Nessun `fileReplacements`, nessuna eccezione per shard — fix condiviso da tutti gli shard (requisito esplicito dell'overview).
- Nessuna persistenza dell'ultimo tab tra sessioni — fuori scope.
- Nessuna modifica alla label "Layers"/"Cammini" — fuori scope, gestita da backend.
- Nessuna gestione speciale per utente non loggato.
- Test: stile esistente, istanza TS pura (`new FavouritesPage(...)`), **nessun TestBed**.
- Commit convention: `fix(oc:8465): ...`.
- `core/src/app/pages/favourites/favourites.page.ts` è JSDoc-required su ogni funzione/metodo (regola ESLint del repo, vedi CLAUDE.md) — i metodi nuovi/modificati in questo piano devono avere JSDoc.

---

### Task 1: Risolvere il default del segmento con gate su `isConfLoaded`

**Files:**
- Modify: `core/src/app/pages/favourites/favourites.page.ts:1-41` (import, dichiarazione campo, `ngOnInit`)
- Test: `core/src/app/pages/favourites/favourites.page.spec.ts`

**Interfaces:**
- Consumes: selettore `isConfLoaded` (`@wm-core/store/conf/conf.selector`, firma `createSelector(confFeature, state => !!state && state.loaded)` → `Observable<boolean>` via `store.select(isConfLoaded)`); selettore esistente `confOPTIONSShowFavorites` (stesso file, già importato); operatori RxJS `filter`, `take`, `switchMap` da `'rxjs/operators'`.
- Produces: `FavouritesPage.selectedSegment: 'tracks' | 'layers'` resta il campo pubblico letto dal template (`favourites.page.html:8`, binding `[value]="selectedSegment"`) — nessuna modifica alla firma esistente, cambia solo *quando* e *come* viene assegnato.

- [x] **Step 1: Scrivere il test che fallisce — default `'layers'` quando la config è caricata e `showFavorites=true`**

Sostituire interamente il contenuto di `core/src/app/pages/favourites/favourites.page.spec.ts` con:

```ts
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {GeohubService} from 'src/app/services/geohub.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

import {FavouritesPage} from './favourites.page';

describe('FavouritesPage — segmento Tracce/Cammini (oc:8176, oc:8465)', () => {
  /**
   * L'ordine in cui FavouritesPage chiama store.select() è fisso e noto:
   * 1) showLayersSegment$ (campo di classe, inizializzato prima del costruttore)
   * 2) isConfLoaded (dentro ngOnInit, dopo la costruzione)
   * I selettori NgRx non sono distinguibili in modo affidabile a runtime (non
   * hanno un nome leggibile via .toString()), quindi il doppio mock si basa
   * sull'ordine di chiamata invece che sul selettore passato.
   */
  function createPage(showFavorites: boolean, confLoaded: boolean): FavouritesPage {
    const storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'pipe']);
    const selectResults: Array<() => any> = [() => of(showFavorites), () => of(confLoaded)];
    let callIndex = 0;
    storeSpy.select.and.callFake(() => {
      const result = selectResults[Math.min(callIndex, selectResults.length - 1)]();
      callIndex++;
      return result;
    });
    storeSpy.pipe.and.returnValue(of(false));
    const geoHubSvcSpy = jasmine.createSpyObj<GeohubService>('GeohubService', [
      'getFavouriteTracks',
      'setFavouriteTrack',
    ]);
    geoHubSvcSpy.getFavouriteTracks.and.resolveTo([]);
    const urlHandlerSvcSpy = jasmine.createSpyObj<UrlHandlerService>('UrlHandlerService', [
      'changeURL',
    ]);

    return new FavouritesPage(geoHubSvcSpy, storeSpy, urlHandlerSvcSpy);
  }

  it('parte con il segmento "layers" quando showFavorites=true e la config è già caricata', async () => {
    const page = createPage(true, true);
    await page.ngOnInit();
    expect(page.selectedSegment).toBe('layers');
  });

  it('parte con il segmento "tracks" quando showFavorites=false, anche a config caricata', async () => {
    const page = createPage(false, true);
    await page.ngOnInit();
    expect(page.selectedSegment).toBe('tracks');
  });

  it('resta "tracks" finché la config non risulta caricata (isConfLoaded=false)', async () => {
    const page = createPage(true, false);
    await page.ngOnInit();
    expect(page.selectedSegment).toBe('tracks');
  });

  it('espone showLayersSegment$ come true quando showFavorites è true', done => {
    const page = createPage(true, true);
    page.showLayersSegment$.subscribe(v => {
      expect(v).toBe(true);
      done();
    });
  });

  it('espone showLayersSegment$ come false quando showFavorites è false', done => {
    const page = createPage(false, true);
    page.showLayersSegment$.subscribe(v => {
      expect(v).toBe(false);
      done();
    });
  });
});
```

- [x] **Step 2: Eseguire i test e verificare che falliscano**

Run: `cd core && npx ng test --watch=false --browsers=ChromeHeadlessNoSandbox --include='**/favourites.page.spec.ts'`

Expected: FAIL — `page.selectedSegment` è ancora sincrono/hardcoded a `'tracks'` nel costruttore/campo di classe, quindi il primo test ("parte con 'layers'...") fallisce; `ngOnInit` non è ancora `async`/non esiste ancora una logica che legga `isConfLoaded`.

- [x] **Step 3: Implementare la logica minima nel componente** — ⚠️ implementato come sotto, poi **superseduto** da un redesign a seguito della review formale (`wm-skills:wm-review-ticket`): il gate `isConfLoaded` si è rivelato insufficiente contro la doppia emissione cache+fresh di `getConf()`. Vedi `notes.md` → "Deviazioni dal piano" per il design finale realmente presente in `favourites.page.ts`.

In `core/src/app/pages/favourites/favourites.page.ts`, sostituire il contenuto del file con:

```ts
import {Component, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from '@ionic/angular';
import {GeohubService} from 'src/app/services/geohub.service';
import {NavigationExtras, Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, switchMap, take} from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {confOPTIONSShowFavorites, isConfLoaded} from '@wm-core/store/conf/conf.selector';
import {Feature, LineString} from 'geojson';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
@Component({
  standalone: false,
  selector: 'webmapp-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {
  private page: number = 0;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  showLayersSegment$: Observable<boolean> = this._store.select(confOPTIONSShowFavorites);
  selectedSegment: 'tracks' | 'layers' = 'tracks';
  tracks$: BehaviorSubject<Feature<LineString>[]> = new BehaviorSubject<Feature<LineString>[]>(
    null,
  );

  constructor(
    private _geoHubService: GeohubService,
    private _store: Store,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  /**
   * Applica il default del tab Cammini solo dopo che la configurazione risulta
   * effettivamente caricata (isConfLoaded), non sulla prima emissione grezza di
   * showLayersSegment$ — evita che un cold start lento congeli il default su
   * 'tracks' per l'intera sessione (oc:8465). Stesso pattern di
   * app.component.ts:_handleDeepLinkUrl (copre sia cold che warm start).
   */
  private _applyDefaultSegment(): void {
    this._store
      .select(isConfLoaded)
      .pipe(
        filter(loaded => loaded === true),
        take(1),
        switchMap(() => this.showLayersSegment$.pipe(take(1))),
      )
      .subscribe(showLayers => {
        this.selectedSegment = showLayers ? 'layers' : 'tracks';
      });
  }

  async ngOnInit() {
    this._applyDefaultSegment();
    this.doRefresh(null);
  }

  onSegmentChange(segment: 'tracks' | 'layers'): void {
    this.selectedSegment = segment;
  }

  async doRefresh(event) {
    this.page = 0;
    this.tracks$.next(await this._geoHubService.getFavouriteTracks());
    if (event) {
      event.target.complete();
    }
  }

  async ionViewDidEnter() {
    this.doRefresh(null);
  }

  async loadData(event) {
    this.tracks$.next([
      ...this.tracks$.value,
      ...(await this._geoHubService.getFavouriteTracks(++this.page)),
    ]);

    event.target.complete();
  }

  open(track: Feature<LineString>) {
    const clickedFeatureId = track.properties.id ?? null;
    this._urlHandlerSvc.changeURL('map', {track: clickedFeatureId});
  }

  async remove(track: Feature<LineString>) {
    await this._geoHubService.setFavouriteTrack(track.properties.id, false);
    const idx = this.tracks$.value.findIndex(x => x.properties.id == track.properties.id);
    const currentTracks = this.tracks$.value;
    currentTracks.splice(idx, 1);
    this.tracks$.next([...currentTracks]);
  }
}
```

Nota: `selectedSegment` resta inizializzato a `'tracks'` come valore sincrono di fallback (nessun flash visibile diverso da oggi finché `_applyDefaultSegment()` non risolve, che con conf già caricata — caso più comune, warm start — accade nello stesso tick/microtask di `ngOnInit`).

- [x] **Step 4: Eseguire i test e verificare che passino** — verificato sia sulla versione iniziale (5/5 PASS) sia, dopo il redesign post-review, sulla versione finale a 7 test (7/7 PASS, vedi `notes.md`).

Run: `cd core && npx ng test --watch=false --browsers=ChromeHeadlessNoSandbox --include='**/favourites.page.spec.ts'`

Expected: PASS — tutti e 5 i test verdi.

- [ ] **Step 5: Commit**

```bash
git add core/src/app/pages/favourites/favourites.page.ts core/src/app/pages/favourites/favourites.page.spec.ts
git commit -m "fix(oc:8465): apri di default il tab Cammini invece di Sentieri nei preferiti"
```

---

### Task 2: Verifica manuale e regressione e2e

**Files:** nessuna modifica — solo verifica.

**Interfaces:** nessuna (task di verifica, non di implementazione).

- [ ] **Step 1: Avviare il dev server e verificare visivamente** — ⚠️ NON eseguito in questa sessione (nessun accesso browser interattivo con login disponibile). Verifica funzionale coperta indirettamente da: unit test completi (incluse le transizioni multi-emissione) + esecuzione reale del test e2e esistente. Resta un gap di verifica visiva manuale, da fare prima del merge.

Run: `cd core && npm start`

Aprire l'app su un profilo/shard con `showFavorites: true` in config (es. camminiditalia — verificare `confOPTIONSShowFavorites` risolva `true` per quello shard), fare login, navigare su "Preferiti": il tab attivo all'apertura deve essere "Cammini" (layer), non "Sentieri". Cliccare manualmente su "Sentieri" e verificare che lo switch manuale continui a funzionare normalmente (nessuna regressione su `onSegmentChange`).

Se disponibile un profilo/shard con `showFavorites: false` (o non impostato), verificare che il segmento non sia nemmeno visibile e che la pagina si comporti come oggi (nessun cambiamento).

- [x] **Step 2: Eseguire il test e2e esistente** — eseguito realmente, 4/4 FAILED sia con il fix sia (via `git stash`, isolamento) senza — non è una regressione di questo ticket, causa radice (mismatch shard/config nell'intercept) documentata in `notes.md`.

Run: `cd core && npx cypress run --spec 'cypress/e2e/app_52/favourites.cy.ts'`

Expected: PASS, nessuna modifica necessaria (il test non fa assunzioni sul tab di default — verificato in Fase: overview). Se fallisse, il file va corretto per allinearlo al nuovo comportamento (nessuna azione preventiva prevista, solo se il fallimento si verifica realmente).

- [x] **Step 3: Eseguire l'intera suite unit test del repo per escludere regressioni collaterali** — 46/46 PASS (44 pre-esistenti + 2 netti nuovi dal redesign del test di favourites).

Run: `cd core && npm run test -- --watch=false --browsers=ChromeHeadlessNoSandbox`

Expected: PASS (nessuna regressione in altri file che importano `favourites.page.ts` o i selettori toccati).

---

## Self-Review

**1. Copertura spec:** ogni requisito di `overview.md` è coperto — default `'layers'` con conf caricata+showFavorites=true (Task 1, test 1), fallback `'tracks'` con showFavorites=false (Task 1, test 2), niente race condition da cold start (Task 1, test 3 + implementazione con `isConfLoaded`), nessun fileReplacements/eccezione shard (nessun file per-shard creato), nessuna persistenza (nessuno storage introdotto), nessuna modifica label (nessun file i18n toccato), test esistente aggiornato in stile TS puro (Task 1), verifica e2e esistente non impattato (Task 2).

**2. Placeholder scan:** nessun TBD/TODO nei passi; tutto il codice è scritto per intero, non solo descritto.

**3. Coerenza dei tipi:** `selectedSegment: 'tracks' | 'layers'` invariato ovunque; `showLayersSegment$: Observable<boolean>` invariato; `_applyDefaultSegment(): void` è un metodo privato nuovo, nome coerente con la convenzione `_` per membri privati del repo (CLAUDE.md → Naming). Nessuna funzione richiamata con nomi diversi tra i task (un solo task di implementazione).
