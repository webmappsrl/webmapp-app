> Ticket: oc:8391

# Sostituire CSS custom home-layer con componente custom (camminiditalia) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **⚠️ No commit/branch automatici**: i comandi `git commit`/`git push`/`git checkout -b` in questo piano sono istruzioni testuali per lo sviluppatore, non azioni da eseguire autonomamente. Ogni commit richiede conferma esplicita separata.
>
> **⚠️ Vincolo di sequenza cross-repo, non negoziabile**: i Task 1-4 (submodule `wm-core`) vanno implementati, committati e **mergiati in wm-core, con il submodule bumpato in webmapp-app**, prima di iniziare il Task 5 (repo principale). Il file `home-layer.component.camminiditalia.ts` non esiste oggi in nessun commit di wm-core — se il Task 5 viene eseguito prima, qualunque build/serve/deploy con `--configuration=camminiditalia` fallisce a build-time.

**Goal:** Sostituire il CSS custom camminiditalia (`!important` su `1.css`, caricato a runtime) del componente `wm-home-layer` con una variante Angular dedicata, instradata via `fileReplacements`.

**Architettura:** Estrarre la logica TS condivisa di `WmHomeLayerComponent` in una classe Base (`WmHomeLayerBaseComponent`, plain class); il componente default e una nuova variante `.camminiditalia` (stesso nome classe, stesso selettore, template gemello, scss proprio con le regole grid) estendono entrambi la Base; `fileReplacements` in `angular.json` instrada la variante solo per lo shard camminiditalia.

**Tech Stack:** Angular 20 (standalone: false, NgModule), NgRx 20, Karma/Jasmine.

**Spec:**
- `/Users/peco/Documents/Apps/webmapp-app/core/src/app/shared/wm-core/docs/features/8391-sostituire-css-custom-home-layer-con-componente-custom/overview.md`
- `/Users/peco/Documents/Apps/webmapp-app/docs/features/8391-sostituire-css-custom-home-layer-con-componente-custom/overview.md`

## Global Constraints

- `fileReplacements` Angular accetta solo `.ts`/`.js`/`.json`, mai `.html` direttamente.
- La variante `.camminiditalia.ts` deve esportare **esattamente** la classe `WmHomeLayerComponent` (stesso nome del default) con lo stesso selettore `wm-home-layer` e la stessa firma di costruttore ereditata dalla Base — `fileReplacements` sostituisce il file a livello di path, `wm-core.module.ts` non cambia.
- `encapsulation: ViewEncapsulation.None` è obbligatorio su entrambe le `@Component` (default e variante) — le regole di stile colpiscono nodi interni del componente figlio `wm-img`.
- Nessuna modifica a `wm-core.module.ts`.
- Nessun aggiornamento di CI, nessun test Cypress/E2E, nessuna modifica a `deploy-to-web-camminiditalia.js` — debiti noti accettati, fuori scope.
- Commit convention: `feat(oc:8391): ...` / `refactor(oc:8391): ...`.

---

## Task 1 [wm-core]: Estrarre `WmHomeLayerBaseComponent`

**Files:**
- Create: `core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer-base.component.ts`
- Modify: `core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.ts`
- Test: `core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.spec.ts` (esistente, NON modificato — usato come test di non-regressione)

**Interfaces:**
- Consumes: nessuna (primo task)
- Produces: `WmHomeLayerBaseComponent` — costruttore `(store: Store, langSvc: LangService, cdr: ChangeDetectorRef, layerFavoriteSvc: LayerFavoriteService)`, proprietà `layer$`, `showFavoriteHeart$`, `isTogglingFavorite`, metodi `isFavorite$(layer: ILAYER)`, `onFavoriteClick(event: Event, layer: ILAYER): Promise<void>`, `ngOnDestroy(): void`. Usata dal Task 2.

- [ ] **Step 1: Verifica baseline — esegui lo spec esistente prima del refactor**

Run: `cd core/src/app/shared/wm-core && npm run test:single`
Expected: PASS (3 test verdi in `home-layer.component.spec.ts`) — questa è la baseline di non-regressione per il refactor.

- [ ] **Step 2: Crea `home-layer-base.component.ts` con tutta la logica spostata dal default**

```typescript
import {ChangeDetectorRef, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {LangService} from '@wm-core/localization/lang.service';
import {ecLayer} from '@wm-core/store/user-activity/user-activity.selector';
import {confOPTIONSShowFavorites} from '@wm-core/store/conf/conf.selector';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {ILAYER} from '@wm-core/types/config';
import {LayerFavoriteService} from '@wm-core/services/layer-favorite.service';
import {combineLatest, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Logica condivisa tra il componente `wm-home-layer` di default e la sua
 * variante per-shard (`.camminiditalia`, oc:8391) — plain class, nessun
 * decorator `@Component`: ciascuna sottoclasse dichiara il proprio
 * `templateUrl`/`styleUrls`/`selector`.
 */
export abstract class WmHomeLayerBaseComponent implements OnDestroy {
  layer$ = this._store.select(ecLayer);
  showFavoriteHeart$ = combineLatest([
    this._store.select(isLogged),
    this._store.select(confOPTIONSShowFavorites),
  ]).pipe(map(([logged, enabled]) => logged && enabled));

  isTogglingFavorite = false;

  private _langChangeSub: Subscription;

  constructor(
    protected _store: Store,
    protected _langSvc: LangService,
    protected _cdr: ChangeDetectorRef,
    protected _layerFavoriteSvc: LayerFavoriteService,
  ) {
    this._langChangeSub = this._langSvc.onLangChange.subscribe(() => {
      this._cdr.markForCheck();
    });
  }

  /**
   * Osservabile reattivo che indica se il layer passato è tra i preferiti dell'utente.
   *
   * @param layer Layer di cui verificare lo stato di preferito.
   * @returns Observable che emette `true` se il layer è tra i preferiti.
   */
  isFavorite$(layer: ILAYER) {
    return this._layerFavoriteSvc.isFavorite$(layer.id);
  }

  /**
   * Gestisce il tap sul cuoricino preferiti: blocca la propagazione dell'evento ed
   * effettua il toggle dei preferiti per il layer corrente (guardia anti-doppio-tap,
   * toast di errore, evento PostHog `layerFavorited` — centralizzati in
   * `LayerFavoriteService.toggleWithFeedback()`).
   *
   * @param event Evento click originato dal tap sul cuoricino.
   * @param layer Layer corrente su cui alternare lo stato di preferito.
   */
  async onFavoriteClick(event: Event, layer: ILAYER): Promise<void> {
    event.stopPropagation();
    if (!layer?.id || this._layerFavoriteSvc.isPending(layer.id)) {
      return;
    }

    this.isTogglingFavorite = true;
    this._cdr.markForCheck();
    await this._layerFavoriteSvc.toggleWithFeedback(layer);
    this.isTogglingFavorite = false;
    this._cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this._langChangeSub?.unsubscribe();
  }
}
```

- [ ] **Step 3: Riduci `home-layer.component.ts` a estendere la Base**

Sostituisci l'intero contenuto di `home-layer.component.ts` con:

```typescript
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {WmHomeLayerBaseComponent} from './home-layer-base.component';

@Component({
  standalone: false,
  selector: 'wm-home-layer',
  templateUrl: './home-layer.component.html',
  styleUrls: ['./home-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WmHomeLayerComponent extends WmHomeLayerBaseComponent {}
```

Nessuna modifica a `home-layer.component.html`/`.scss` in questo task — restano quelli attuali.

- [ ] **Step 4: Verifica che lo spec esistente resti verde (nessuna modifica al file di test)**

Run: `cd core/src/app/shared/wm-core && npm run test:single`
Expected: PASS (stessi 3 test di Step 1, ancora verdi — la firma del costruttore `new WmHomeLayerComponent(store, langSvc, cdr, favoriteSvc)` usata dallo spec continua a funzionare perché ereditata dalla Base senza essere ridichiarata)

- [ ] **Step 5: Commit**

```bash
git add core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer-base.component.ts core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.ts
git commit -m "refactor(oc:8391): estrai WmHomeLayerBaseComponent da WmHomeLayerComponent"
```

---

## Task 2 [wm-core]: Creare la variante camminiditalia (ts + html)

**Files:**
- Create: `core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.ts`
- Create: `core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.html`

**Interfaces:**
- Consumes: `WmHomeLayerBaseComponent` (Task 1, stesso costruttore)
- Produces: classe `WmHomeLayerComponent` (stesso nome del default) esportata da `home-layer.component.camminiditalia.ts`, selettore `wm-home-layer`. Usata dal Task 3 (styleUrls) e dal Task 4 (spec) e dal Task 5 (fileReplacements).

- [ ] **Step 1: Crea il template gemello, duplicato 1:1 dal default**

`home-layer.component.camminiditalia.html`:

```html
<ng-container *ngIf="layer$|async as layer">
  <wm-img *ngIf="layer?.feature_image as img" [src]="img">
    <div class="wm-box-title" *ngIf="layer?.title as title">{{title | wmtrans}}</div>
    <wm-img
      *ngIf="layer?.logo_image | hasLogo"
      class="wm-home-layer-logo-overlay"
      [src]="layer.logo_image"
    ></wm-img>
    <i
      *ngIf="showFavoriteHeart$|async"
      class="wm-home-layer-favorite"
      [class.wm-home-layer-favorite--disabled]="isTogglingFavorite"
      [attr.aria-label]="(isFavorite$(layer)|async) ? ('Rimuovi dai preferiti'|wmtrans) : ('Aggiungi ai preferiti'|wmtrans)"
      [ngClass]="{
        'icon-fill-heart': isFavorite$(layer)|async,
        'icon-outline-heart': !(isFavorite$(layer)|async)
      }"
      (click)="onFavoriteClick($event, layer)"
    ></i>
  </wm-img>

  <wm-tab-description
    *ngIf="layer?.description as description"
    [description]="description"
  ></wm-tab-description>

  <wm-config-detail [groups]="layer?.config_detail"></wm-config-detail>
</ng-container>
```

- [ ] **Step 2: Crea `home-layer.component.camminiditalia.ts`**

```typescript
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {WmHomeLayerBaseComponent} from './home-layer-base.component';

@Component({
  standalone: false,
  selector: 'wm-home-layer',
  templateUrl: './home-layer.component.camminiditalia.html',
  styleUrls: ['./home-layer.component.camminiditalia.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WmHomeLayerComponent extends WmHomeLayerBaseComponent {}
```

Nota: `styleUrls` punta a `home-layer.component.camminiditalia.scss`, creato nel Task 3 — questo file non esiste ancora al termine di questo task, quindi la compilazione del progetto wm-core fallirebbe se lanciata isolatamente adesso. Il Task 3 va eseguito immediatamente di seguito, prima di qualunque build/test che compili questo file.

- [ ] **Step 3: Commit (insieme al Task 3, vedi step di commit unico a fine Task 3)**

Nessun commit isolato qui — il file `.ts` referenzia uno `.scss` non ancora esistente, quindi non è uno stato compilabile. Procedi direttamente al Task 3.

---

## Task 3 [wm-core]: Creare lo scss scoped della variante camminiditalia

**Files:**
- Create: `core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.scss`

**Interfaces:**
- Consumes: nessuna interfaccia di codice — questo task porta a valle le regole visive già in `core/src/theme/camminiditalia/1.css` (righe 15-75) e la struttura del default `home-layer.component.scss`, fondendole in un unico file scoped (nessun `!important`, nessun selettore globale iniettato a runtime).
- Produces: file referenziato da `styleUrls` in Task 2.

- [ ] **Step 1: Crea `home-layer.component.camminiditalia.scss`**

```scss
@import '../../theme/mixins.scss';

wm-home-layer {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  align-content: stretch;
  overflow-y: auto;
  height: fit-content;
  position: relative;

  wm-img,
  .wm-description {
    margin: 10px;
  }

  .wm-description {
    max-height: 200px;
    overflow: auto;
  }

  .wm-home-layer-favorite {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    @include overlay-chip-background;
    z-index: 3;
    cursor: pointer;
    font-size: 22px;
    color: var(--wm-color-favorite, #d7263d);

    &--disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}

// Apertura layer camminiditalia (oc:8305, portato da CSS a componente in
// oc:8391): foto pulita in alto + fascia bianca sotto con logo + divisore +
// titolo, invece dell'overlay-su-foto di default. Regole scoped a questo
// componente (encapsulation None, come il default) — nessun !important
// necessario, non c'è più conflitto con un secondo foglio di stile globale.
wm-home-layer > wm-img {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'photo photo'
    'logo title';
}

wm-home-layer > wm-img > .wm-img-image {
  grid-area: photo;
  height: 160px;
  border-radius: 15px 15px 0 0;
}

// Il cuoricino (.wm-home-layer-favorite, sopra) resta position:absolute di
// default — non partecipa al grid, resta overlay sulla foto in alto a destra,
// come richiesto dal cliente.

wm-home-layer > wm-img > wm-img.wm-home-layer-logo-overlay {
  grid-area: logo;
  position: static;
  align-self: center;
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  margin: 12px;
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
  box-shadow: none;
  z-index: 2;
}

wm-home-layer > wm-img > .wm-box-title {
  grid-area: title;
  font-size: 26px;
  font-family: var(--wm-font-family-content, inherit);
  font-style: normal;
  font-weight: 700;
  color: #1a1a1a;
  background: #fff;
  position: relative;
  bottom: auto;
  align-self: center;
  padding: 16px 16px 16px 12px;
  line-height: 31px;
  letter-spacing: 0em;
  text-align: left;
  white-space: normal;
  text-shadow: none;
}

// Divisore solo se il layer ha un logo (wm-home-layer-logo-overlay presente
// nel DOM, *ngIf="hasLogo" nel componente) — senza logo non ha senso una
// linea "separatrice" accanto al titolo senza nulla da separare.
wm-home-layer > wm-img:has(> wm-img.wm-home-layer-logo-overlay) > .wm-box-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 30px;
  bottom: 30px;
  width: 2px;
  // Valore hardcoded invece di var(--wm-color-primary) di proposito: questa
  // variante è specifica di camminiditalia (nessun altro shard la usa),
  // quindi l'indirezione tramite la variabile del tema non aggiunge nessuna
  // flessibilità reale qui — stessa scelta già presente nel CSS di origine.
  background-color: #ef7821;
}
```

- [ ] **Step 2: Verifica che il progetto wm-core compili con entrambi i file (default + variante) presenti**

Run: `cd core/src/app/shared/wm-core && npx tsc --noEmit -p tsconfig.json` (o, se non esiste un `tsconfig.json` dedicato compilabile isolatamente, `npm run build` del progetto wm-core)
Expected: nessun errore di compilazione — entrambi i file `home-layer.component.ts` e `home-layer.component.camminiditalia.ts` esportano `WmHomeLayerComponent` da path diversi, nessun conflitto perché nessuno dei due importa l'altro.

- [ ] **Step 3: Commit (Task 2 + Task 3 insieme, primo stato compilabile della variante)**

```bash
git add core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.ts core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.html core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.scss
git commit -m "feat(oc:8391): variante camminiditalia di WmHomeLayerComponent (grid layout)"
```

---

## Task 4 [wm-core]: Nuovo spec per la variante camminiditalia

**Files:**
- Create: `core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.spec.ts`

**Interfaces:**
- Consumes: `WmHomeLayerComponent` da `./home-layer.component.camminiditalia` (Task 2), `LayerFavoriteService` da `../../services/layer-favorite.service`

- [ ] **Step 1: Scrivi lo spec, stesso pattern di istanziazione diretta dello spec esistente**

```typescript
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {LangService} from '@wm-core/localization/lang.service';
import {ILAYER} from '@wm-core/types/config';

import {WmHomeLayerComponent} from './home-layer.component.camminiditalia';
import {LayerFavoriteService} from '../../services/layer-favorite.service';

/**
 * Verifica che la variante camminiditalia (oc:8391), pur avendo un proprio
 * template/scss, erediti dalla Base lo stesso comportamento di
 * toggle/toast/evento PostHog già coperto per il default in
 * `home-layer.component.spec.ts` (oc:8176).
 */
describe('WmHomeLayerComponent (camminiditalia) — preferiti (oc:8391)', () => {
  const fakeLayer: ILAYER = {id: '7', title: 'Cammino dettaglio'} as any;

  let component: WmHomeLayerComponent;
  let favoriteSvcSpy: jasmine.SpyObj<LayerFavoriteService>;

  function createComponent(): WmHomeLayerComponent {
    const storeSpy = jasmine.createSpyObj<Store>('Store', ['select']);
    storeSpy.select.and.returnValue(of(fakeLayer));
    const langSvcSpy = jasmine.createSpyObj<LangService>('LangService', ['instant']);
    (langSvcSpy as any).onLangChange = of();
    favoriteSvcSpy = jasmine.createSpyObj<LayerFavoriteService>('LayerFavoriteService', [
      'isFavorite$',
      'toggleWithFeedback',
      'isPending',
    ]);
    favoriteSvcSpy.isFavorite$.and.returnValue(of(false));
    favoriteSvcSpy.toggleWithFeedback.and.resolveTo();

    return new WmHomeLayerComponent(storeSpy, langSvcSpy, {markForCheck: () => {}} as any, favoriteSvcSpy);
  }

  beforeEach(() => {
    component = createComponent();
  });

  it('chiama toggleWithFeedback con il layer corrente e stopPropagation sul tap', async () => {
    const event = jasmine.createSpyObj('Event', ['stopPropagation']);

    await component.onFavoriteClick(event, fakeLayer);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(favoriteSvcSpy.toggleWithFeedback).toHaveBeenCalledWith(fakeLayer);
  });

  it('non richiama toggleWithFeedback se una richiesta per lo stesso layer è già in corso', async () => {
    favoriteSvcSpy.isPending.and.returnValue(true);
    const event = jasmine.createSpyObj('Event', ['stopPropagation']);

    await component.onFavoriteClick(event, fakeLayer);

    expect(favoriteSvcSpy.toggleWithFeedback).not.toHaveBeenCalled();
  });

  it('imposta e resetta isTogglingFavorite intorno a toggleWithFeedback', async () => {
    let resolveToggle: () => void;
    favoriteSvcSpy.toggleWithFeedback.and.returnValue(
      new Promise<void>(resolve => (resolveToggle = resolve)),
    );
    const event = jasmine.createSpyObj('Event', ['stopPropagation']);

    const clickPromise = component.onFavoriteClick(event, fakeLayer);
    expect(component.isTogglingFavorite).toBeTrue();

    resolveToggle();
    await clickPromise;
    expect(component.isTogglingFavorite).toBeFalse();
  });
});
```

- [ ] **Step 2: Esegui entrambi gli spec (default + variante) e verifica che siano verdi**

Run: `cd core/src/app/shared/wm-core && npm run test:single`
Expected: PASS — 3 test in `home-layer.component.spec.ts` + 3 test in `home-layer.component.camminiditalia.spec.ts`, tutti verdi.

- [ ] **Step 3: Commit**

```bash
git add core/src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.spec.ts
git commit -m "test(oc:8391): spec per la variante camminiditalia di WmHomeLayerComponent"
```

**⚠️ Checkpoint di sequenza**: a questo punto la parte wm-core è completa. Prima di procedere al Task 5, la PR wm-core va aperta, revisionata e mergiata, e il submodule `wm-core` in webmapp-app va bumpato al commit che include questi 4 task. Il Task 5 non può iniziare prima che questo sia vero.

---

## Task 5 [webmapp-app]: Aggiungere `fileReplacements` in `angular.json`

**Precondizione (bloccante):** submodule `wm-core` in questo repo bumpato a un commit che include `home-layer.component.camminiditalia.ts` (Task 1-4). Verifica con:

```bash
git -C core/src/app/shared/wm-core show HEAD:projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.ts
```

Se il comando fallisce ("path does not exist"), **non procedere** — il submodule non è ancora bumpato.

**Files:**
- Modify: `core/angular.json:97-104`

**Interfaces:**
- Consumes: `WmHomeLayerComponent` esportata da `src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.ts` (Task 2, wm-core)

- [ ] **Step 1: Aggiungi la entry alla configuration `camminiditalia` esistente in `architect.build.configurations`**

In `core/angular.json`, il blocco attuale (righe 97-104) è:

```json
            "camminiditalia": {
              "fileReplacements": [
                {
                  "replace": "src/app/pages/profile/profile.page.ts",
                  "with": "src/app/pages/profile/profile.page.camminiditalia.ts"
                }
              ]
            },
```

Sostituiscilo con:

```json
            "camminiditalia": {
              "fileReplacements": [
                {
                  "replace": "src/app/pages/profile/profile.page.ts",
                  "with": "src/app/pages/profile/profile.page.camminiditalia.ts"
                },
                {
                  "replace": "src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.ts",
                  "with": "src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.ts"
                }
              ]
            },
```

Nota: `architect.serve.configurations.camminiditalia` (riga 123-125) non va toccato — è già `{"buildTarget": "app:build:camminiditalia"}`, quindi eredita automaticamente i `fileReplacements` della configuration di build omonima, senza bisogno di una entry duplicata.

- [ ] **Step 2: Verifica che il build con la nuova configuration compili**

Run: `cd core && npx ng build --configuration=camminiditalia`
Expected: build completata senza errori. Se fallisce con un errore relativo al path del file sostitutivo, la precondizione del submodule non era realmente soddisfatta — fermarsi e verificare il bump.

- [ ] **Step 3: Commit**

```bash
git add core/angular.json
git commit -m "feat(oc:8391): instrada la variante camminiditalia di wm-home-layer via fileReplacements"
```

---

## Task 6 [webmapp-app]: Rimuovere il blocco CSS `wm-home-layer` da `1.css`

**Files:**
- Modify: `core/src/theme/camminiditalia/1.css:15-75`
- Modify: `core/src/theme/camminiditaliadev/1.css:15-75` (file oggi identico byte-per-byte al precedente)

**Interfaces:** nessuna — solo rimozione di CSS ormai sostituito dal componente.

- [ ] **Step 1: Rimuovi da entrambi i file il blocco dal commento `oc:8305` alla regola del divisore, incluso**

In entrambi `core/src/theme/camminiditalia/1.css` e `core/src/theme/camminiditaliadev/1.css`, rimuovi le righe 15-75 (dal commento `/* oc:8305 — apertura layer... */` fino alla chiusura `}` della regola `::before` del divisore), lasciando intatte:
- righe 1-13 (`wm-home > .root`, `.wm-home-header-container`)
- righe 77-79 (`wm-map-details wm-status-filter { display: none; }`), che restano adiacenti dopo la rimozione

Il contenuto finale di ciascun file deve essere:

```css
wm-home > .root {
  overflow-x: hidden;
}

wm-home .wm-home-header-container {
  padding-top: 0px !important;
  width: 103%;
  transform: translate(-6px, -5px);
}

wm-home .wm-home-header-container > wm-inner-component-html {
  padding: 0px !important;
}

wm-map-details wm-status-filter {
  display: none;
}
```

- [ ] **Step 2: Verifica visiva manuale su camminiditalia (tab Home + pannello Mappa)**

Run: `cd core && npx ng serve --configuration=camminiditalia` (o `npm start`, che seleziona la configuration automaticamente in base allo shard rilevato)

Apri l'app, seleziona un layer con logo e uno senza logo, verifica in entrambi i punti di montaggio (tab Home, pannello Mappa dopo aver aperto un cammino):
- foto pulita in alto, fascia bianca sotto con logo + titolo (con logo)
- stesso layout ma senza logo/divisore (senza logo)
- cuoricino preferiti overlay in alto a destra sulla foto, non nella fascia bianca

Expected: nessuna differenza percepibile rispetto al comportamento pre-refactor (verificabile confrontando con uno screenshot precedente o con la memoria visiva del comportamento attuale in produzione).

- [ ] **Step 3: Commit**

```bash
git add core/src/theme/camminiditalia/1.css core/src/theme/camminiditaliadev/1.css
git commit -m "fix(oc:8391): rimuovi il CSS custom wm-home-layer, sostituito dal componente camminiditalia"
```

---

## Self-Review (svolta durante la scrittura del piano)

**Copertura requisiti**: tutti i requisiti di entrambi gli overview sono coperti — Base extraction (Task 1), variante ts+html (Task 2), scss scoped con i 3 comportamenti puntuali/ViewEncapsulation.None (Task 3), spec variante (Task 4), fileReplacements (Task 5), rimozione CSS (Task 6). Nessuna modifica a `wm-core.module.ts` (coerente col design). Vincolo di sequenza cross-repo tradotto in precondizione bloccante esplicita nel Task 5, non solo annotato.

**Placeholder**: nessuno — ogni step ha codice reale, letto dai file esistenti del repo (home-layer.component.ts, .scss, .html, 1.css, angular.json) prima di scrivere il piano.

**Coerenza dei tipi**: `WmHomeLayerBaseComponent` (Task 1) espone lo stesso costruttore `(store, langSvc, cdr, layerFavoriteSvc)` consumato identicamente da Task 2 (default, implicito via extends) e dallo spec di Task 4; nessuna discrepanza di nomi tra i task.
