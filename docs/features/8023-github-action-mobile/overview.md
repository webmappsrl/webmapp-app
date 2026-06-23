> Ticket: oc:8023

# GitHub Action Mobile

## Cosa cambia

Il repo `webmapp-app` ottiene una pipeline CI/CD completa:
- I test esistenti (unit + E2E) vengono verificati e portati a verde prima di configurare la CI
- Test automatici (unit app + unit submoduli + E2E Cypress) su ogni PR e push a `develop`, con job separati e rilanciabili individualmente
- Preview Surge su ogni PR con dominio dinamico `{id}.{shard}.pr-{numero}.surge.sh` estratto dal commit message tramite `--id`/`--shard`; teardown automatico alla chiusura della PR
- Deploy automatico a produzione su push a `main` via `npm run deploy-to-web` (rsync SSH), condizionato al passaggio di tutti i test

## Perché

Attualmente la CI esegue solo test E2E (Cypress) su ogni PR tramite `pr_test.yml`, ma mancano:
- Verifica che i test esistenti siano effettivamente in verde (prerequisito per una CI utile)
- Test unit (Karma) in CI
- Preview visiva della feature per la fase di review
- Deploy automatizzato (oggi è manuale via script npm locale)

Pattern di riferimento: `feature/oc-8022-github-action-webmapp` nel repo `wm-webapp`.

## Requisiti

### Fase A — Verifica e fix test esistenti
- [ ] Eseguire i test unit Karma di `webmapp-app` in locale e documentare i fallimenti
- [ ] Eseguire i test unit di `wm-core` e `map-core` in locale e documentare i fallimenti
- [ ] Eseguire i test E2E Cypress in locale e documentare i fallimenti
- [ ] Correggere i test che falliscono (o skipparli esplicitamente con motivazione se il fix è out of scope)
- [ ] La suite completa è verde prima di procedere alla Fase B

### Fase B — Setup CI/CD
- [ ] `test-unit.yml`: 3 job paralleli (`test-app`, `test-wm-core`, `test-map-core`) con `cache: 'npm'`, trigger `pull_request` + `push develop` + `workflow_call`
- [ ] `test-e2e.yml`: 1 job Cypress con appId injection (`sed` + verifica post-sed), `cypress.env.json` da secrets, `posthog.json` fallback; trigger `pull_request` + `push develop` + `workflow_call`
- [ ] Tutti i job sono indipendenti e rilanciabili separatamente da GitHub Actions UI
- [ ] `preview.yml`: trigger `pull_request_target` + `push develop`; job `preview` con guard `if: github.event.pull_request.head.repo.full_name == github.repository` (blocca PR da fork)
- [ ] `preview.yml`: dominio `{id}.{shard}.pr-{numero}.surge.sh` con `--id`/`--shard` da commit message; default `id=52`, `shard=maphub`
- [ ] `preview.yml`: job `teardown` rimuove il dominio Surge alla chiusura della PR
- [ ] `preview.yml`: link al preview aggiunto nel job summary di GitHub Actions
- [ ] `deploy_prod.yml`: trigger `push main` + `workflow_dispatch`; chiama `test-unit.yml` e `test-e2e.yml` in parallelo via `workflow_call`, deploy solo se entrambi passano
- [ ] `deploy_prod.yml`: configura alias SSH `server` da secrets e lancia `npm run deploy-to-web` da `core/`
- [ ] `deploy_prod.yml`: health check post-deploy su `https://1.camminiditalia.mobile.webmapp.it/` con retry
- [ ] `pr_test.yml` esistente: rimosso (sostituito da `test-unit.yml` + `test-e2e.yml`)

## Rischi

- **Test in stato ignoto**: non si conosce quanti test siano attualmente in rosso. La Fase A potrebbe richiedere più tempo del previsto se i fallimenti sono numerosi o complessi.
- **SSH per rsync**: `deploy-to-web` usa l'alias `server` di `~/.ssh/config`. In CI va ricreato via secrets. Rsync richiede autenticazione con chiave SSH (non password) — il secret deve essere una chiave privata (`SSH_KEY`), non una password come in `wm-webapp`. **Mitigazione**: step di verifica post-deploy con `curl -f` su `https://1.camminiditalia.mobile.webmapp.it/`.
- **`pull_request_target` sicurezza**: il trigger ha accesso ai secrets anche per PR da fork. **Mitigazione**: guard `if: github.event.pull_request.head.repo.full_name == github.repository` — le PR da fork non triggerano il deploy Surge.
- **`sed` fragile**: la sostituzione dell'`appId` in `environment.ts` può silenziosamente non avvenire. **Mitigazione**: step `grep -q 'appId: 52'` post-sed che fa fallire il job esplicitamente.
- **Rollback deploy**: rsync non mantiene versioni precedenti. In caso di deploy rotto, il recovery è manuale (nuovo push su `main` o intervento SSH diretto). Accettato come tech debt — `workflow_dispatch` permette di rilanciare un deploy manuale su un commit precedente.
- **Secrets mancanti**: `SURGE_EMAIL`, `SURGE_TOKEN`, `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_KEY` non esistono ancora nelle GitHub Actions secrets — vanno aggiunti manualmente prima che i workflow funzionino.

## Out of scope

- Configurazione dei secrets GitHub Actions (va fatta manualmente dal team)
- Riscrittura di test con logica di business errata (solo fix tecnici/di configurazione)
- Deploy per istanze diverse da `mobile.webmapp.it`
- Pipeline per iOS/Android (App Store / Play Store)

## Moduli toccati

Tutti i file nel repo principale `webmapp-app`:

| File | Azione |
|------|--------|
| `.github/workflows/test-unit.yml` | Creato |
| `.github/workflows/test-e2e.yml` | Creato |
| `.github/workflows/preview.yml` | Creato |
| `.github/workflows/deploy_prod.yml` | Creato |
| `.github/workflows/pr_test.yml` | Rimosso |
| `core/src/**/*.spec.ts` | Eventuali fix test unit app |
| `core/src/app/shared/wm-core/**/*.spec.ts` | Eventuali fix test unit wm-core |
| `core/src/app/shared/map-core/**/*.spec.ts` | Eventuali fix test unit map-core |
| `core/cypress/e2e/**/*.cy.ts` | Eventuali fix test E2E |
