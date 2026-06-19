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

- **PR testing:** Cypress E2E on every PR (`pr_test.yml`)
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

## Decisioni architetturali

### Validazione posthog.json (oc:8105)
- `validatePosthogConfig()` usa `throw new Error()` invece di `process.exit(1)`: il throw dentro un Promise executor viene catturato automaticamente da Node come rejection, permettendo il teardown di Gulp
- `fs.copyFileSync` in `build()` è wrappato in try/catch con `reject()` per evitare che eccezioni sincrone dentro `.then()` diventino unhandled Promise rejection con la Promise esterna bloccata in pending
- `instances/posthog.json` è gitignored — in CI va creato esplicitamente via secrets prima di invocare gulp
