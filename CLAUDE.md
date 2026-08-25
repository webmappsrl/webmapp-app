# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**webmapp-app** is a hybrid mobile/PWA mapping application for outdoor activities. Built with Angular 20, Ionic 8, Capacitor 7, and OpenLayers 7. Supports multiple deployment instances (e.g., `camminiditalia`).

## Commands

All commands run from the `core/` directory unless noted.

```bash
# Install dependencies
cd core && npm install
# or from root:
npm run setup

# Development server
npm start               # ng serve (http://localhost:4200)

# Build
npm run build           # ng build
ionic build             # Ionic build (outputs to www/)

# Testing
npm run test            # Karma unit tests (Jasmine)
npx cypress open        # Cypress E2E interactive
npx cypress run         # Cypress E2E headless (Chrome)

# Lint
npm run lint            # ng lint (Angular ESLint)
```

## Architecture

### Directory Structure

```
webmapp-app/
├── core/                      # Main Angular/Ionic application
│   └── src/app/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Routable page components
│       ├── services/          # Business logic
│       ├── store/             # NgRx state (actions, reducers, effects, selectors)
│       ├── types/             # TypeScript interfaces/types
│       └── shared/            # Git submodules (see below)
├── instances/                 # Per-instance configs (themes, assets)
└── docs/config/               # Configuration and i18n documentation
```

### Git Submodules

Three critical shared libraries live under `core/src/app/shared/`:

| Submodule | Path alias | Role |
|-----------|-----------|------|
| `wm-core` | `@wm-core/*` | Core UI components, modals, auth, services |
| `map-core` | `@map-core/*` | OpenLayers map integration |
| `wm-types` | `@wm-types/*` | Shared TypeScript type definitions |

Update submodules: `./update-submodules.sh`

### State Management

NgRx is used throughout. Pattern: `store/` contains actions, reducers, effects, and selectors. Components dispatch actions and select from store slices.

### Multi-instance Support

The app supports multiple branded deployments. Instance-specific config (themes, assets, app config) lives in `instances/<name>/`. The `environment.ts` controls which instance is active.

### Build Output

Web builds output to `core/www/`. Capacitor wraps this for iOS/Android. App ID: `it.webmapp.webmapp`.

## Code Conventions

### Naming (enforced by ESLint)

- Interfaces: `I` prefix + PascalCase (e.g., `ITrack`)
- Enums: `E` prefix + PascalCase (e.g., `ELayerType`)
- Enum members: `UPPER_CASE`
- Private class members: leading underscore (e.g., `_myService`)
- Angular component selector prefix: `webmapp-`

### TypeScript

Strict mode is enabled (`strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`). Target: ES2022, module: es2020.

### JSDoc

Required for all functions and methods (enforced by ESLint).

## Testing

- **Unit tests:** Karma + Jasmine, run from `core/`
- **E2E tests:** Cypress 14, configured in `core/cypress.config.ts`
- CI runs Cypress against `http://localhost:8100` using Chrome, viewport 412×832 (mobile)
- Test secrets (`TEST_EMAIL`, `TEST_PASSWORD`) are stored in GitHub Actions secrets

## CI/CD

- **Unit tests:** 3 parallel jobs (webmapp-app, wm-core, map-core) su ogni PR e push su `develop` (`test-unit.yml`)
- **E2E tests:** Cypress su ogni PR e push su `develop` (`test-e2e.yml`)
- **Surge preview:** deploy PR preview su `{id}.{shard}.pr-{N}.surge.sh` — `--id`/`--shard` dal commit message (`preview.yml`)
- **Deploy prod:** test → build → rsync → health check su push a `main` (`deploy_prod.yml`)
- **Code review:** AI review via OpenAI on every PR (`code-review.yml`)
- **Releases:** Automated via Release Please on push to `main`
- **Changelog:** Auto-enriched with commit descriptions on push to `main`/`develop`

## Release Please — Gestione problemi di versione

Il workflow usa `google-github-actions/release-please-action@v3` in **simple mode** (`release-type: node`). Lo stato è tracciato tramite tag git `v{version}` e GitHub Releases.

### Diagnosi quando release-please propone la versione sbagliata

```bash
# 1. Controlla le release GitHub (la "Latest" è il punto di partenza)
gh release list --repo webmappsrl/webmapp-app --limit 10

# 2. Controlla se ci sono PR aperte di release-please
gh pr list --repo webmappsrl/webmapp-app

# 3. Controlla i commit feat/fix dall'ultimo tag
git log v3.1.13..HEAD --oneline | grep -E "^[a-f0-9]+ (feat|fix)"
```

### Causa più comune

La PR di release-please viene mergiata manualmente e poi la versione viene rollbackata. Release-please considera la versione della PR mergiata come "ultima release" e calcola da lì.

### Fix: forzare una versione specifica

Aggiungere temporaneamente `release-as` nel workflow (`.github/workflows/release_please.yml`):

```yaml
- uses: google-github-actions/release-please-action@v3
  with:
    release-type: node
    package-name: webmapp-app
    release-as: 3.1.14   # ← aggiungere, poi rimuovere dopo il merge
    ...
```

Procedura:
1. Chiudere la PR sbagliata: `gh pr close <N> --repo webmappsrl/webmapp-app`
2. Cancellare il branch: `gh api repos/webmappsrl/webmapp-app/git/refs/heads/release-please--branches--main--components--webmapp-app -X DELETE`
3. Aggiungere `release-as: X.Y.Z` al workflow e pushare
4. Aspettare che release-please apra la PR corretta
5. Mergiarla
6. **Subito dopo il merge**: rimuovere `release-as` dal workflow e pushare

### Regola fondamentale

Non fare mai rollback manuale della versione dopo che una PR di release-please è stata mergiata. Se serve cambiare versione, usare `release-as` nel workflow.

## Technology Stack

Angular 20 · Ionic 8 · Capacitor 7 · NgRx 20 · OpenLayers 7 · @ngx-translate · Swiper 12 · PostHog · Cypress 14

## Personalizzazioni per-shard via fileReplacements

Quando una feature richiede una UI strutturalmente diversa (non solo CSS) per un singolo shard/cliente (es. camminiditalia), **non modificare il file condiviso usato da tutti gli shard**. Usare invece il pattern `fileReplacements` di Angular, già esistente in `core/angular.json` per `environment.prod.ts` e per lo shard `stelvio`.

### Come funziona

1. **`fileReplacements` accetta solo `.ts`/`.js`/`.json`, mai `.html` direttamente** — vincolo di schema di Angular, verificato empiricamente (errore `Schema validation failed ... must match pattern`). Per sostituire un template, si sostituisce il file `.ts` del componente (che referenzia il template via `templateUrl`), non l'`.html` da solo.
2. Creare un file gemello `<nome>.<shard>.ts` (stesso identico contenuto/logica del componente, `templateUrl` che punta a `<nome>.<shard>.html`) e il relativo `<nome>.<shard>.html`.
3. **Il file originale non va mai modificato, nemmeno per farlo estendere da una classe base condivisa.** La variante `.<shard>.ts` duplica per intero la logica del file originale (stato, costruttore, metodi) — la duplicazione è il costo accettato per garantire che il file condiviso da tutti gli shard resti visivamente e strutturalmente identico a prima, senza introdurre dipendenze nuove (classi base, file aggiuntivi) che tutti gli altri shard si troverebbero comunque nel bundle. **Non estrarre una classe base in un terzo file**: è stato provato due volte in sessioni diverse (su `home.component.ts` e su `profile.page.ts`) e in entrambi i casi la scelta è stata scartata esplicitamente dal developer dopo revisione — preferenza confermata, non provvisoria.
   - **Nota tecnica, utile solo se in futuro si tornasse a valutare l'estrazione**: la variante `.<shard>.ts` non può comunque importare la classe dal file originale (`import {X} from './x.component'`) per estenderla direttamente — `fileReplacements` reindirizza *qualsiasi* riferimento a quel path, quindi l'import diventerebbe circolare (punterebbe di nuovo a se stesso, errore TS2506 verificato empiricamente). Un'eventuale base condivisa richiederebbe comunque un terzo file mai soggetto a `fileReplacements` — ma la duplicazione resta l'opzione preferita per questo repo.
4. Aggiungere una configuration in `core/angular.json` (sia su `architect.build.configurations` che su `architect.serve.configurations`):
   ```json
   "camminiditalia": {
     "fileReplacements": [
       {"replace": "src/app/pages/profile/profile.page.ts", "with": "src/app/pages/profile/profile.page.camminiditalia.ts"}
     ]
   }
   ```
5. Più `fileReplacements` per shard diversi convivono senza conflitto se toccano file diversi; più configuration si possono anche combinare con la virgola (`--configuration=production,camminiditalia`) se toccano file diversi tra loro.

### Criterio di scelta: a quale componente applicare il replace (foglia vs genitore)

Quando il componente da personalizzare vive in un albero con più antenati candidati (es. un componente foglia dentro un componente contenitore dentro una pagina), **il numero di entry in `angular.json` non è il criterio decisionale**: costa 2 righe di JSON per entry, è greppabile, non ha un costo di manutenzione reale nemmeno con 10-20 entry accumulate. Il costo reale di ogni replace è **quanta logica non correlata alla personalizzazione finisce duplicata** nella variante — quella logica deve essere mantenuta manualmente sincronizzata con l'originale per tutta la vita del progetto, e più è grande il componente sostituito più cresce la superficie a rischio di disallineamento silenzioso.

Regola pratica (confermata su oc:8391):

1. **Mappa tutti i punti di montaggio** del componente target nell'albero, prima di scegliere il livello.
2. **Se il target è montato in più punti "fratelli"** (nessun antenato comune se non il target stesso o la radice dell'app) **e la personalizzazione deve valere su tutti**: l'unico punto di sostituzione che li coprirà tutti è il componente target stesso (o il più basso antenato comune, se esiste) — salire più in alto in questo caso non riduce le entry, le moltiplica (una per ciascun punto di montaggio da coprire separatamente, dato che i genitori sono diversi e non condividono codice).
3. **Se il target è montato in un solo punto** (quindi esiste una scelta reale tra foglia e genitore), preferisci di default la **foglia**: il genitore quasi sempre porta con sé responsabilità estranee alla personalizzazione (routing, stato, altri figli non toccati) che finiscono comunque duplicate e sincronizzate a mano. Sali di livello solo se: (a) la personalizzazione richiede di cambiare anche il template/logica del genitore stesso, non solo di un suo figlio, oppure (b) più personalizzazioni coordinate su più figli fratelli per lo stesso shard sarebbero più incoerenti gestite come replace indipendenti che come un unico genitore duplicato.
4. **Segnale d'allarme**: se la motivazione per salire di livello è "così ho meno righe in `angular.json`" o "faccio prima", è quasi sempre la scelta sbagliata — si scambia un costo piccolo e visibile (poche righe di config) con un costo invisibile e crescente (superficie di codice duplicato).

### Selezione automatica della configuration

- **Dev locale**: `core/scripts/serve.js` (invocato da `npm start`) legge `shardName` da `src/environments/environment.ts` e sceglie automaticamente `--configuration` se esiste una configuration con match esatto o "shardName inizia per \<configuration\>" (copre `camminiditaliadev` → `camminiditalia`). Nessun flag da ricordare.
- **Build native (app store)**: `gulpfile.js` → `runIonicBuild()` fa lo stesso match, leggendo lo `shardName` scritto da `update()` nell'`environment.ts` dell'istanza copiata (`instances/<nome>/`).
- **Deploy web**: vedi vincolo sotto — non è automatico, richiede uno script/target di deploy dedicato.

### Vincolo critico: il deploy web è condiviso multi-tenant

`EnvironmentService.init()` (wm-core) decide lo shard **a runtime leggendo `window.location.hostname`** — l'`environment.ts` statico conta solo per `localhost`. Questo significa che **il deploy web (`mobile.webmapp.it`) è un solo bundle condiviso da tutti i clienti**: buildarlo con `--configuration=camminiditalia` pubblicherebbe il template dedicato a **tutti**, non solo a chi ha l'hostname di camminiditalia.

Soluzione adottata: **deploy web dedicato e separato** per camminiditalia, con la propria build e il proprio target rsync (`core/scripts/deploy-to-web-camminiditalia.js`, output in `www-camminiditalia/` per non sovrascrivere `www/` del deploy generico). Vedi `## Feature disponibili` → riga "Deploy web dedicato camminiditalia".

### Debito tecnico noto, scoperto testando questo pattern

**`--configuration=production` non è applicabile oggi in nessuna build della pipeline** (native o web) — verificato empiricamente che la build fallisce con 19 errori di compilazione preesistenti (AOT/template type checking più stretto, mai eseguito finora perché `angular.json` ha `"defaultConfiguration": ""` sul target `build` e nessuno script della pipeline passa mai `--configuration=production`/`--prod`). Errori concentrati in `poi.page.html`, `favourites.page.html`, `downloaded-tracks-box.component.html` — non correlati a questo pattern, ma bloccanti se si prova ad abilitare `production`. Da affrontare in un ticket dedicato prima di poter accendere le ottimizzazioni di produzione (minify, AOT, `environment.prod.ts`) sia sul deploy condiviso che su quello dedicato.

## Feature disponibili

| Feature | Ticket | Moduli toccati | Note |
|---|---|---|---|
| Validazione posthog.json prima della build | oc:8105 | `gulpfile.js` | Valida esistenza, JSON valido e chiavi POSTHOG_KEY/POSTHOG_HOST non vuote; copia il file nell'istanza dopo create() |
| GitHub Actions CI/CD (unit + E2E + preview + deploy) | oc:8023 | `.github/workflows/`, `core/karma.conf.js`, `core/tsconfig.spec.json`, `core/angular.json` | test-unit.yml (3 job paralleli), test-e2e.yml, preview.yml (Surge), deploy_prod.yml; rimosso pr_test.yml |
| Download immagini profilo my_paths/my_downloads nel gulp | oc:7480 | `gulpfile.js`, `core/src/assets/images/profile/` | Scarica da URL S3 in config.json (APP.myPaths/APP.myDownloads), converte in WebP reale via sharp (transitiva di cordova-res), warn+resolve su errore; rimossi file legacy cammini-* |
| Gestione permessi Android nel manifest | oc:7294 | `gulpfile.js` | READ_MEDIA_IMAGES sempre rimosso; READ/WRITE_EXTERNAL_STORAGE aggiunti solo se MAP.record_track_show===true (letto da dir/config.json); addPermissionsIfNotPresent() sostituita da manageAndroidPermissions(hasUgc) |
| Documentazione downloadOverlay e hitMapUrl per shard carg | oc:8190 | `core/src/app/pages/map/map.page.html`, `core/src/app/pages/map/download-panel/download-panel.component.ts` | Documenta il meccanismo di download overlay hitmap e il campo hitMapUrl, oggi attivi solo per carg |
| Validazione dimensioni icon/notification_icon/splash prima di cordova-res | oc:8246 | `gulpfile.js` | Valida dimensioni (platform-specific) prima di ogni cordova-res; sotto soglia chiede conferma interattiva (mai blocco automatico), flag `--skip-resource-validation` come escape hatch |
| Bump target SDK Android a 36 | oc:8277 | `gulpfile.js` | Aggiorna compileSdkVersion/targetSdkVersion da 35 a 36 (requisito Google Play dal 31/08/2026); Capacitor resta invariato a 7.4.5, nessun fix difensivo per i nuovi behavior Android 16 |
| Fix build --prod per deploy (webmapp-app + wm-webapp) | oc:8382 | `core/src/app/pages/poi/` (rimosso), `core/src/app/pages/map/utils.ts`, `core/src/app/components/box/downloaded-tracks-box/`, `core/package.json` | Rimossa pagina POI morta (API mappa pre-map-core mai aggiornata), allineato tipo IHIT→Hit, fix collisione domhandler via npm overrides, script deploy-to-web* ora usano `--configuration production` |
| Eliminare log in produzione | oc:8369 | `core/src/main.ts`, `core/src/app/components/settings/settings.component.ts`, `core/src/app/pages/home/intro/intro.component.ts`, `core/src/app/pages/map/map.page.ts`, `core/src/app/services/share.service.ts`, `core/src/app/services/store.service.ts` | Triage manuale di tutti i `console.*`: rumore cancellato, log diagnostici utili commentati con marker `// DEBUG:`, `console.error`/`console.warn` sempre lasciati intatti (anche in produzione); stesso ciclo ha toccato anche i submodule wm-core e map-core |
| Salva cammino nei preferiti | oc:8176 | `core/src/app/pages/favourites/*`, `core/tsconfig.spec.json`, `core/angular.json`, `core/src/assets/i18n/*` | Tab "Layers"/"Sentieri" in `FavouritesPage` (ordine invertito su richiesta post-hoc), riusa `wm-layer-box`/`LayerFavoriteService` da wm-core. Dettagli in `docs/features/8176-salva-cammino-nei-preferiti/notes.md` |
| Condivisione percorso registrato sui social (stile Strava) | oc:8183 | `core/src/app/services/share.service.ts`, `core/src/app/pages/map/map.page.ts`/`.html`, `core/src/app/components/modal-success/modal-success.component.ts`/`.html`/`.scss`, `core/src/app/components/shared/modal-save/modal-save.component.ts` | Due punti di ingresso: pannello proprietà traccia (wm-core, `ugc-track-properties`) e schermata di successo post-registrazione (`ModalSuccessComponent`, chip circolare sulla card). `ShareService.shareTrackToStories()` manda solo `{uuid}` al backend (statistiche/mappa/compositing lato server, wm-package), scarica l'immagine e chiama `Share.share()` generico — nessun plugin nativo custom. Entrambi i pulsanti restano disabilitati finché la traccia non risulta sincronizzata col backend (evita 404 su tracce appena registrate). Dettagli completi in `docs/features/8183-condivisione-percorso-registrato-sui-social/notes.md` |
| Fix layout badge "mi piace"/leggibilità titolo (wm-layer-box) + redesign home-layer camminiditalia | oc:8305 | `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.scss`, `core/src/theme/camminiditalia/1.css`, `core/src/theme/stelvio/global_env.scss` | Fix del componente condiviso in wm-core (vedi CLAUDE.md di quel repo). Qui: rimossa l'altezza hardcoded ora ridondante in favourites (nessun numero da sincronizzare con wm-core), redesign CSS-only del dettaglio layer per camminiditalia (foto pulita + fascia bianca con logo/divisore/titolo, divisore visibile solo se c'è il logo via `:has()`), fix di compatibilità a stelvio (non generato da questo ticket ma necessario per non rompere una personalizzazione preesistente). Dettagli completi in `docs/features/8305-layout-badge-mi-piace-leggibilita-nome-layer/notes.md` |
| Box informativi configurabili su Layer/EcTrack/EcPoi (`wm-config-detail`) | oc:8181 | `core/src/app/components/poi-properties/poi-properties.component.html`, `core/cypress/e2e/app_52/config-detail-boxes.cy.ts`; componente in wm-core; tipi in `wm-types/src/config.ts` (`ConfigDetailBox*`) | Cypress 5 test (Layer popolato/assente, EcTrack accordion, EcPoi, fallback lingua). Spec scoped a `wm-map-details` per `testIsolation: false`. Tipi condivisi senza prefisso `I` in `@wm-types/config`. Dettagli in `docs/features/8181-schermata-cammino-con-blocchi-informativi-configurabili/notes.md` |
| Sostituire CSS custom home-layer con componente custom (camminiditalia) | oc:8391 | `core/angular.json`, `core/src/theme/camminiditalia/1.css`, `core/src/theme/camminiditaliadev/1.css`; componente in wm-core (`home-layer-base.component.ts`, `home-layer.component.camminiditalia.ts`/`.scss`) | Sostituisce il redesign CSS-only di oc:8305 (selettori globali `!important` su `1.css`, caricati a runtime via `MetaComponent`) con `fileReplacements` Angular su una variante `WmHomeLayerComponent` dedicata (stesso layout grid foto/logo/titolo). Blocco `wm-home-layer` rimosso da entrambi i file `1.css`. Verificato con build reale `ng build --configuration=camminiditalia`. Dettagli in `docs/features/8391-sostituire-css-custom-home-layer-con-componente-custom/notes.md` |

## Decisioni architetturali

### Eliminare log in produzione (oc:8369)
- **Criterio di classificazione a 2 assi (posizione + metodo), non solo per nome del metodo**: qualsiasi `console.*` (incluso `console.log`) dentro un blocco `catch`/percorso di gestione errore resta intatto; fuori da un catch, `console.error`/`console.warn` restano sempre visibili anche in produzione, mentre i `console.log` senza contesto (dump di variabili, separatori, trace IDE tipo `'------- ~ Component ~ metodo ~ var'`) vengono cancellati e quelli con contesto/valore diagnostico vengono commentati con marker `// DEBUG:` (ricercabile con `grep -rn "// DEBUG:"`)
- **`wm-core/utils/console-override.ts` è codice morto, deliberatamente non attivato**: fornirebbe un gate runtime completo (`window.wmDebug`) per tutti i metodi console, ma il developer ha segnalato problemi passati con questo meccanismo durante l'analisi di errori in produzione — da rivedere in un ticket futuro con un sistema di logging attivabile a piacere, non in questo ciclo
- **`core/src/main.ts:9-15` (override esistente che silenzia solo `console.log` in produzione) non toccato**: resta come rete di sicurezza addizionale, indipendente dal triage manuale
- **Nessuna regola ESLint `no-console` introdotta**: nessun guardrail automatico contro la reintroduzione futura di `console.log` — rischio accettato consapevolmente, non risolto in questo ciclo
- **Debito noto**: in `share.service.ts` la variabile `shareRet` resta dichiarata ma non più letta dopo la rimozione del log che la stampava — possibile warning ESLint `no-unused-vars`, non affrontato

### Fix build --prod per deploy (oc:8382)
- `ionic build --configuration production` falliva per due cause indipendenti, entrambe latenti perché nessun deploy CI aveva mai usato `--prod` prima d'ora: (1) 17 errori TS/Angular concentrati in `PoiPage` (componente mappa `itinerary-webmapp-map` mai esistito nel repo, dead code confermato — nessuna pagina/deep-link vi punta) e in `downloaded-tracks-box.component.ts` (tipo `IHIT` locale disallineato da `Hit` di wm-types); (2) collisione di dipendenze `domhandler` (due copie incompatibili, 4.3.1 via `@capacitor/assets`→`node-html-parser` inutilizzato dal gulpfile, e 5.0.3 via `beasties`/`@angular/build`) che rompeva l'inlining del CSS critico in `index.html` anche a zero errori TS
- Fix scelto per la collisione `domhandler`: `overrides` scoped in `core/package.json` (`"@capacitor/assets": {"node-html-parser": "^9.0.1"}`) invece di disabilitare `inlineCritical` — nessuna perdita di ottimizzazione, nessuna dipendenza applicativa toccata (`@capacitor/assets` non è mai invocato da `gulpfile.js` in questo progetto)
- `core/src/app/pages/poi/utils.ts` (funzioni Swiper `beforeInit`/`setTranslate`/`setTransition`) non era dead code nonostante vivesse nella cartella `poi/`: era importato da `map.page.ts` (pagina viva). Spostato in `core/src/app/pages/map/utils.ts` — se in futuro si tocca `pages/poi/`, verificare sempre gli import relativi (`'../poi/...'`), non solo le stringhe `pages/poi`/nome del modulo
- Debito tecnico noto, non affrontato: `SharedModule` (`core/src/app/components/shared/shared.module.ts`) importa `WmCoreModule` ma non lo ri-esporta — un futuro consumer di `wm-image-gallery`/`wm-related-urls`/`wm-track-audio` fuori da `WmCoreModule` diretto incapperà nello stesso errore di build incontrato con `PoiPage`

### Bump target SDK Android a 36 (oc:8277)
- Bump volutamente limitato al solo numero SDK: `compileSdkVersion`/`targetSdkVersion` 35→36 in `gulpfile.js:986-987` (`_updateAndroidFiles()`), senza upgrade di Capacitor (resta v7.4.5) né fix difensivi per i nuovi behavior enforced da Android 16/API 36 (edge-to-edge, back gesture, foreground service location) — rischio accettato esplicitamente per rispettare la deadline Play Store del 31/08/2026; il percorso "corretto" (Capacitor 8) è rimandato a un ciclo separato
- `gulp build-android` NON compila il progetto (solo prepara config/risorse/`variables.gradle`) — per verificare che il bump SDK compili davvero servono `build-android-apk(-debug)` / `build-android-bundle`, che invocano `./gradlew assemble`/`bundle`
- Rischi noti non mitigati in questo ciclo, da monitorare in uso reale: manifest manca `android:enableOnBackInvokedCallback`; versioni AndroidX disallineate tra istanze (`camminiditalia` 1.15.0 vs `ville`/`ville_old_manifest_sdk` 1.12.0); compatibilità `cordova-android 10.1.1` con API 36 non verificata; requisito Play separato sull'allineamento a 16KB delle librerie native (dal 01/11/2025) non verificato

### Fix layout badge "mi piace"/leggibilità titolo + redesign home-layer camminiditalia (oc:8305)
- **Redesign `home-layer` (apertura layer/cammino) realizzato interamente in CSS**, isolato per shard (`theme/camminiditalia/1.css`, caricato dinamicamente solo per quello shard via `MetaComponent` in wm-core) — nessuna modifica al componente condiviso `home-layer.component.*`. Tecnica: CSS Grid con `grid-template-areas` sulle classi globali esistenti (`ViewEncapsulation.None`), divisore (`::before`) condizionato con il selettore `:has()` alla presenza del logo nel DOM, senza bisogno di introdurre una classe condizionale lato componente.
- **`favourites-layers.component.scss` non hardcoda più un'altezza**: rimossa (non aggiornata) perché `.wm-box` (wm-core) ha ora un'altezza fissa propria — elimina alla radice il rischio di disallineamento cross-repo che una semplice sincronizzazione manuale del numero avrebbe lasciato aperto.
- **`theme/stelvio/global_env.scss` modificato pur essendo "out of scope" per il fix principale**: la migrazione a CSS Grid in wm-core (vedi CLAUDE.md di quel repo) rendeva silenziosamente inerte una personalizzazione preesistente di quello shard (`top:20%` su un elemento non più `position:absolute`) — corretto con l'approvazione esplicita del developer, perché le personalizzazioni per-shard devono restare funzionanti anche quando cambia la tecnica di base del componente condiviso.
- **Il ticket originale descriveva erroneamente i preferiti-tracce come "non implementati"**: il tab Favourites (tracce) era già in produzione (`FavouritesPage`, `map-track-card`, endpoint `EcTrackController`) — il lavoro reale è stata l'estensione a un secondo tab "Layers", non la costruzione da zero
- **`ion-segment` invece di `ion-tabs` annidati** per il cambio Layers/Sentieri dentro `FavouritesPage` — evita di generare voci di navigazione/history per un semplice cambio di vista in-page
- **Ordine e naming tab decisi post-hoc dal developer dopo verifica visiva**: "Layers" (stessa parola in tutte le 7 lingue, scelta deliberata) prima di "Sentieri" (ex "Cammini"/"Tracce"), diverso da quanto originariamente pianificato
- **`UrlHandlerService.setLayer()` (wm-core) usa `changeURL()` non `updateURL()`**: `updateURL()` naviga solo se i query param cambiano — se lo stesso layer era già in URL da una navigazione precedente (es. aperto dalla Home) il click dal tab Preferiti non avrebbe navigato affatto verso `/map`. Bug trovato e corretto in review formale prima del merge
- **`tsconfig.spec.json`/`angular.json` estesi con `src/app/pages/favourites`** (oltre al preesistente `src/app/services`, oc:8023) per includere i nuovi test in CI — scoping minimale, non riapre la discovery a `src/**`

### Condivisione percorso registrato sui social (oc:8183)
- **`ShareService.shareTrackToStories(track)` è l'unico punto di orchestrazione**: entrambi i punti di ingresso (pannello proprietà traccia in wm-core, schermata di successo post-registrazione) lo chiamano direttamente — nessuna duplicazione della logica di rete/download/`Share.share()`
- **Traduzione dei messaggi grezzi nativi di `@capacitor/share`**: verificati nel sorgente installato del plugin (iOS `SharePlugin.swift`, Android `SharePlugin.java`, identici) — `NATIVE_SHARE_ERROR_TRANSLATIONS` in `share.service.ts` mappa stringhe come `'Share canceled'` a messaggi italiani, invece di mostrare testo inglese/tecnico all'utente
- **Gating sulla sincronizzazione, aggiunto dopo un giro di test reale**: entrambi i pulsanti di condivisione restano disabilitati finché la traccia (per `uuid`) non ha un `properties.id` assegnato dal backend (`ugcTracksFeatures`, wm-core). Prima di questa modifica il dispatch di `syncUgcTracks()`/`syncUgcPois()` avveniva solo **dopo** la chiusura di `ModalSuccessComponent` (`modal-save.component.ts`, dentro il `.subscribe()` finale) — quindi la sincronizzazione non partiva nemmeno finché l'utente restava su quella schermata. Anticipato a un `tap()` subito dopo il salvataggio locale, così il gating ha davvero la possibilità di risolversi mentre l'utente è ancora sulla schermata con il pulsante
- **Due trattamenti visivi diversi per lo stesso stato "non sincronizzato", a seconda del contesto**: nel pannello proprietà traccia (`fill="clear"`, nessuna card sovrapposta) si usa il `[disabled]` nativo di Ionic in sicurezza. Nel chip di `ModalSuccessComponent` (sovrapposto all'angolo di una card bianca su sfondo scuro) il `[disabled]` nativo NON si può usare: l'opacità che Ionic applica ai bottoni disabilitati fa trasparire il bordo bianco della card sottostante — lì si usa invece uno swap di colore di sfondo piatto (`--background: var(--wm-color-medium)`, nessuna opacità) via una classe CSS custom. Stesso principio (bottone "grigio classico", non uno spinner) applicato con la tecnica giusta per ciascun contesto
- **Nessuno spinner per lo stato "in attesa di sincronizzazione"**: farebbe pensare a un'operazione già in corso. Lo spinner resta riservato al solo stato reale di generazione dell'immagine di condivisione (`GENERATING`)
- **Alert esplicativo se il tap arriva comunque mentre non sincronizzato** (guardia sincrona lato TS, difesa in profondità oltre al `[disabled]`): "Il percorso è ancora in fase di sincronizzazione, riprova tra qualche secondo." — evita di far vedere all'utente un 404 grezzo dal backend
- **Nessuna feedback di successo dedicato**: la chiusura del native share sheet è già un segnale sufficiente; solo l'errore ha un trattamento esplicito (alert nativo, stesso pattern di `deleteTrack()` in wm-core)

### Validazione dimensioni icon/notification_icon/splash prima di cordova-res (oc:8246)
- **Soglie platform-specific, non universali**: verificate nel sorgente reale di `cordova-res` (`core/node_modules/cordova-res/dist/resources.js`, `getRasterResourceSchema`), non nel solo README (che riporta 2732×2732 come raccomandazione "universale" per un source che copra tutte le piattaforme, fuorviante se letto come requisito Android). Requisiti reali: Android icon/notification_icon ≥512×512 (usiamo 1024×1024 come margine), Android splash ≥1920×1920, iOS icon ≥1024×1024, iOS splash ≥2732×2732. `validateRasterResource` in quel file non impone aspect ratio 1:1, solo dimensioni minime
- **Icon.png, notification_icon.png e splash.png vanno generati con invocazioni `cordova-res` separate** (`--type icon` / `--type splash`), mai in un'unica chiamata combinata: verificato empiricamente che `cordova-res` fa fallire l'**intera invocazione** (exit code 1, nessun file generato) se anche una sola risorsa richiesta non supera la sua validazione interna — con una chiamata combinata, una risorsa invalida impedirebbe la generazione anche delle altre, valide
- **Comportamento identico per le tre risorse**: nessuna blocca mai la build in automatico. Sotto soglia → warning + prompt interattivo (`readline` nativo) se continuare comunque senza quella risorsa; risposta "sì" → quella risorsa non viene generata, le altre procedono se valide; risposta "no" o stdin non-TTY → build interrotta. Flag `--skip-resource-validation` bypassa la validazione per tutte e tre
- **La validazione va in `updateResources(instanceName, platform)`, non in `update()`**: `update()` è platform-agnostic (non riceve mai `'android'`/`'ios'`), mentre le soglie sono platform-specific; `updateResources()` riceve già `platform` ed è il punto immediatamente precedente alla chiamata `cordova-res`
- **Bug preesistenti corretti in questo ciclo** (non originariamente in scope, scoperti toccando lo stesso codice): task `build-android` ignorava silenziosamente gli errori di `buildAndroid()` (ora allineato a `build-ios` con `abort(err)`); `done()` non definito dentro il `.catch()` della catena Gradle in `buildAndroid()` (sostituito con `reject(err)`); `warning(...)` mai definita in `updateResources()` (corretta in `warn(...)`)
- **Debito tecnico noto, non implementato**: dependency tra `notification_icon.png` e `icon.png` per lo shard carg (dove la notification icon non è utilizzata) — annotato in `docs/features/8246-validazione-dimensioni-splash-icon-cordova-res/notes.md`, non risolto in questo ciclo

### Documentazione downloadOverlay e hitMapUrl per shard carg (oc:8190)
- **Flusso di download overlay**: `wm-download` (wrapper in `map.page.html:205-214`) → `wm-download-panel` (`download-panel.component.ts`) → funzione `downloadOverlay()` definita in `map-core/src/utils/localForage.ts:251` e importata da `@map-core/utils`, invocata dentro `start()` (`download-panel.component.ts:142-151`)
- **`overlayXYZ` hardcoded per carg**: `[overlayXYZ]="'https://carg.geosciences-ir.it/storage/cargmap/'"` in `map.page.html:209` sovrascrive il default `https://api.webmapp.it/tiles` definito in `download-panel.component.ts:49`
- **Invariante `overlayXYZ` ↔ `hit-map.directive.ts`**: il valore di `overlayXYZ` deve restare allineato alla base URL del tile layer CARG in `map-core/src/directives/hit-map.directive.ts:134` (`https://carg.geosciences-ir.it/storage/cargmap/{z}/{x}/{y}.png` → base `https://carg.geosciences-ir.it/storage/cargmap/`). Se si modifica l'uno, aggiornare anche l'altro: `downloadOverlay()` in `localForage.ts:282` costruisce `${overlayXYZ}/${tile}.png` e deve scaricare gli stessi tile visualizzati dal layer OL sulla mappa
- **Stessa origine tile, meccanismi distinti**: visualizzazione (`hit-map.directive.ts:134`, template `{z}/{x}/{y}.png`) e download offline (`overlayXYZ` → `downloadOverlay()`) sono percorsi di codice separati ma devono puntare alla stessa origine tile
- **`IMAP.hitMapUrl` è generico, non wm-types**: il campo vive in `wm-core/projects/wm-core/src/types/config.ts:254` (non in wm-types come si potrebbe assumere). È letto dal `config.json` di qualsiasi backend/shard tramite il selector `confMAPHitMapUrl` e dispatchato in `app.component.ts`, ma oggi è valorizzato solo dal backend carg — nessun altro shard lo usa
- **Due `downloadOverlay` omonimi, non confonderli**: il metodo `downloadOverlay()` in `map.page.ts:336-338` è uno dei tre trigger di `showDownload$` (insieme a `openTrackDownload()` e `downloadTiles()`, generici per tutti gli shard), ma è uno stub inerte (solo `console.log` + apertura del pannello); il download vero avviene nella funzione omonima vista sopra (bullet "Flusso di download overlay"), gated su `overlayUrls`/`overlayGeometry` non nulli — condizione di fatto vera solo per carg
- **Effetto collaterale di `hitMapUrl` sulla home**: oltre al download, controlla anche la visibilità della searchbar (`wm-core/.../home/home.component.html:12`, condizione `hitMapUrl==null`)
- **Debito tecnico noto — interfacce `IMAP` divergenti**: esistono due interfacce `IMAP` tra submoduli invece di un'unica fonte di verità in wm-types — `wm-core/projects/wm-core/src/types/config.ts` (con `hitMapUrl`) e `map-core/src/types/model.ts:160` (senza `hitMapUrl`)
- **Debito tecnico noto — hardcoding non generalizzato**: `overlayXYZ` resta specifico di carg, non è configurabile per altri shard; non risolto in questo ticket, eventuale generalizzazione va trattata in un ticket dedicato

### GitHub Actions CI/CD (oc:8023)
- **Submodule tests in CI**: wm-core e map-core vengono testati dalla loro directory (`working-directory: core/src/app/shared/wm-core`) dopo aver installato le dep dell'app principale — stesso pattern di `wm-webapp`. Node risolve i peer da `core/node_modules/` evitando istanze duplicate di Angular che rompono TestBed
- **`include` in `angular.json` test options**: limita la scoperta dei spec file a `src/app/services` — evita che Angular CLI raccolga i file spec dei submoduli (wm-core/map-core) che importano alias non disponibili nel contesto dell'app principale
- **`tsconfig.spec.json` con `include` narrowed**: usa `src/app/services/**/*.spec.ts` invece del wildcard `src/**/*.spec.ts` per lo stesso motivo
- **Boilerplate spec files eliminati**: 27 file `*.spec.ts` di pagine/componenti con soli test `should create` rimossi — non avevano valore, crash con `NG0201` per `APP_TRANSLATION` e crash Chrome su MapPage. Conservato solo `communication.service.spec.ts` (5 test reali)
- **Surge preview fork guard**: `pull_request_target` con `if: github.event.pull_request.head.repo.full_name == github.repository` — blocca deploy da fork ma permette accesso ai secret per i branch interni
- **`--id`/`--shard` dal commit message**: dominio Surge `{id}.{shard}.pr-{N}.surge.sh`, default `id=52, shard=maphub`
- **`deploy-to-web` include il build**: lo script `npm run deploy-to-web` chiama già `ionic build` internamente — non serve uno step build separato nel workflow

### Gestione permessi Android (oc:7294)
- `manageAndroidPermissions(hasUgc)` sostituisce integralmente `addPermissionsIfNotPresent()` — le due non devono coesistere o si contraddicono (una rimuove, l'altra ri-aggiunge)
- La chiave UGC è `MAP.record_track_show` (non `APP.record_track_show`) — letta da `dir/config.json` su disco in `_updateAndroidFiles()`, che viene chiamata solo dopo che `build()` ha completato il download del config
- Default conservativo: se config.json non leggibile → `hasUgc = false` → nessun permesso di storage (meglio meno permessi che troppi lato Play Store)

### Download immagini profilo (oc:7480)
- `sharp` è una transitiva di `cordova-res` e `@capacitor/assets` — già in `node_modules`, non va aggiunto a `package.json`. Se questi tool venissero rimossi, aggiungere `sharp` come devDependency esplicita
- I file default `my-path.webp` e `downloads.webp` sono WebP reali (VP8) — salvare PNG/JPG con estensione `.webp` causerebbe failure su iOS (WKWebView riceve Content-Type: image/webp ma bytes PNG); la conversione via sharp è obbligatoria
- URL S3 usato direttamente da `configJson.APP.myPaths` — non la route API (`/{app}/resources/my_paths.png`) per evitare hop aggiuntivo
- **Chiave config.json in camelCase**: il backend espone `APP.myPaths`/`APP.myDownloads` (sia gulp che `wm-ugc-box` in wm-core e l'interfaccia `APP` in wm-types le leggono in camelCase); la route API e i nomi file restano snake_case (`/resources/my_paths.png`, `my-path.webp`)

### Validazione posthog.json (oc:8105)
- `validatePosthogConfig()` usa `throw new Error()` invece di `process.exit(1)`: il throw dentro un Promise executor viene catturato automaticamente da Node come rejection, permettendo il teardown di Gulp
- `fs.copyFileSync` in `build()` è wrappato in try/catch con `reject()` per evitare che eccezioni sincrone dentro `.then()` diventino unhandled Promise rejection con la Promise esterna bloccata in pending
- `instances/posthog.json` è gitignored — in CI va creato esplicitamente via secrets prima di invocare gulp
