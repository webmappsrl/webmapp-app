# CI, preview e deploy

## Come funziona oggi

- **`test-unit.yml`** — tre job paralleli: l'app, `wm-core`, `map-core`. Su ogni PR e push a `develop`.
- **`test-e2e.yml`** — Cypress su ogni PR e push a `develop`, contro `http://localhost:8100`, Chrome, viewport 412×832. I secret `TEST_EMAIL`/`TEST_PASSWORD` stanno nei GitHub Actions secrets.
- **`preview.yml`** — preview Surge su `{id}.{shard}.pr-{N}.surge.sh`, con `--id`/`--shard` presi dal messaggio di commit (default `id=52`, `shard=maphub`).
- **`deploy_prod.yml`** — test → build → rsync → health check, su push a `main`.
- **`release_please.yml`** e l'arricchimento automatico del changelog completano il quadro.

## Perché così

- **I submodule si testano dalla loro directory** (oc:8023, `working-directory: core/src/app/shared/<nome>`) dopo aver installato le dipendenze dell'app: Node risolve i peer da `core/node_modules/`, evitando istanze duplicate di Angular che romperebbero il `TestBed`. È lo stesso pattern di `wm-webapp`.
- **`include` in `angular.json` e in `tsconfig.spec.json` è ristretto a `src/app/services`** (oc:8023), non il wildcard `src/**`: altrimenti Angular CLI raccoglie gli spec dei submodule, che importano alias non disponibili nel contesto dell'app.
- **Il fork guard della preview** (oc:8023): `pull_request_target` con `if: github.event.pull_request.head.repo.full_name == github.repository` blocca i deploy da fork ma lascia i secret ai branch interni.
- **27 spec boilerplate sono stati eliminati** (oc:8023): pagine e componenti con il solo `should create`, che crashavano con `NG0201` per `APP_TRANSLATION` e facevano crashare Chrome su `MapPage`. È rimasto solo `communication.service.spec.ts`, che ha cinque test veri.

## Trappola

**`npm run deploy-to-web` include già la build**: non aggiungere uno step di build separato nel workflow.
