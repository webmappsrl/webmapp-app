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

## Feature disponibili

| Feature | Ticket | Moduli toccati | Note |
|---|---|---|---|
| Validazione posthog.json prima della build | oc:8105 | `gulpfile.js` | Valida esistenza, JSON valido e chiavi POSTHOG_KEY/POSTHOG_HOST non vuote; copia il file nell'istanza dopo create() |
| GitHub Actions CI/CD (unit + E2E + preview + deploy) | oc:8023 | `.github/workflows/`, `core/karma.conf.js`, `core/tsconfig.spec.json`, `core/angular.json` | test-unit.yml (3 job paralleli), test-e2e.yml, preview.yml (Surge), deploy_prod.yml; rimosso pr_test.yml |
| Download immagini profilo my_paths/my_downloads nel gulp | oc:7480 | `gulpfile.js`, `core/src/assets/images/profile/` | Scarica da URL S3 in config.json (APP.myPaths/APP.myDownloads), converte in WebP reale via sharp (transitiva di cordova-res), warn+resolve su errore; rimossi file legacy cammini-* |
| Gestione permessi Android nel manifest | oc:7294 | `gulpfile.js` | READ_MEDIA_IMAGES sempre rimosso; READ/WRITE_EXTERNAL_STORAGE aggiunti solo se MAP.record_track_show===true (letto da dir/config.json); addPermissionsIfNotPresent() sostituita da manageAndroidPermissions(hasUgc) |
| Documentazione downloadOverlay e hitMapUrl per shard carg | oc:8190 | `core/src/app/pages/map/map.page.html`, `core/src/app/pages/map/download-panel/download-panel.component.ts` | Documenta il meccanismo di download overlay hitmap e il campo hitMapUrl, oggi attivi solo per carg |

## Decisioni architetturali

### Documentazione downloadOverlay e hitMapUrl per shard carg (oc:8190)
- **Flusso di download overlay**: `wm-download` (wrapper in `map.page.html:205-214`) → `wm-download-panel` (`download-panel.component.ts`) → funzione `downloadOverlay()` definita in `map-core/src/utils/localForage.ts:251` e importata da `@map-core/utils`, invocata dentro `start()` (`download-panel.component.ts:142-151`)
- **`overlayXYZ` hardcoded per carg**: `[overlayXYZ]="'https://tiles.webmapp.it/carg'"` in `map.page.html:209` sovrascrive il default `https://api.webmapp.it/tiles` definito in `download-panel.component.ts:49`
- **Secondo hardcoding carg, meccanismo diverso**: il tile layer del basemap geologico in `map-core/src/directives/hit-map.directive.ts:106` (`https://carg.geosciences-ir.it/storage/cargmap/{z}/{x}/{y}.png`) non è collegato al download overlay — è il layer visualizzato sulla mappa
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
