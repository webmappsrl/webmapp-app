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

## Technology Stack

Angular 20 · Ionic 8 · Capacitor 7 · NgRx 20 · OpenLayers 7 · @ngx-translate · Swiper 12 · PostHog · Cypress 14
