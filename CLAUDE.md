# webmapp-app — CLAUDE.md

## Cos'è questo repo

L'**app**: applicazione ibrida mobile e PWA per attività outdoor, uno dei due prodotti Webmapp.
L'altro è la **webapp**, `wm-webapp`, che è un repo diverso: entrambi montano gli stessi tre
submodule condivisi — `wm-core`, `map-core`, `wm-types` — ma sotto percorsi diversi (qui
`core/src/app/shared/`, nella webapp `src/app/shared/`).

Supporta più istanze brandizzate: la config specifica di ciascuna — temi, asset, `config.json` —
vive in `instances/<nome>/`, e `environment.ts` decide quale è attiva. Le build web escono in
`core/www/`, Capacitor le impacchetta per iOS e Android. App ID: `it.webmapp.webmapp`.

Stack: Angular 20, Ionic 8, Capacitor 7, NgRx 20, OpenLayers 7, Swiper 12, PostHog, Cypress 14.

Qui vive la **customizzazione di questo prodotto**: pagine, temi, script di build e deploy, gulp.
Il dominio condiviso — componenti, store, mappa, tipi — vive nei submodule, che hanno ciascuno il
proprio `CLAUDE.md`, la conoscenza in `docs/knowledge/` e le trappole in `.claude/rules/`.

## Regole del repo

- **Non modificare un file condiviso per personalizzare un singolo shard.** Se basta lo stile, un
  tema in `core/src/theme/<shard>/`; se la UI è strutturalmente diversa, `fileReplacements` — con i
  vincoli che stanno fra le trappole, non sono ovvi.
- **Non buildare il deploy web generico con `--configuration=<shard>`.** `EnvironmentService.init()`
  sceglie lo shard a runtime dall'hostname, quindi il bundle su `mobile.webmapp.it` è **uno solo,
  condiviso da tutti i clienti**: quella build pubblicherebbe il template di un cliente a tutti gli
  altri. Si usano gli script di deploy dedicati.
- **Se cambi l'`overlayXYZ` dei tile, aggiorna anche `hit-map.directive.ts` in `map-core`**, e
  viceversa: visualizzazione e download offline sono percorsi separati che devono puntare alla
  stessa origine, e niente in CI se ne accorge.
- **`core/scripts/lib/run.js` e `core/scripts/serve.js` sono copie identiche degli omonimi in
  `wm-webapp`.** Non esiste un'astrazione condivisa fra i due prodotti: chi tocca uno dei due
  controlla l'altro, perché nessuno strumento segnala il drift. La stessa regola sta nel
  `CLAUDE.md` della webapp.
- **Ciò che riguarda un submodule si documenta nel submodule**, non qui: questo file dice come
  usiamo il dominio condiviso, come funziona lo dicono i loro.
- **Mai un rollback manuale della versione** dopo che una PR di release-please è stata mergiata: si
  usa `release-as`. Vedi [docs/howto/release-please.md](docs/howto/release-please.md).

## Comandi

Tutti dalla directory `core/`, salvo dove indicato.

| Cosa | Comando |
|---|---|
| Installare | `npm run setup` dalla root, oppure `cd core && npm install` |
| Avviare in locale | `npm start` — `scripts/serve.js` sceglie la configuration dallo `shardName` |
| Build | `npm run build` (`ng build`), oppure `ionic build` (output in `www/`) |
| Deploy web generico | `npm run deploy-to-web` — include già la build |
| Deploy web camminiditalia | `npm run deploy-to-web-camminiditalia` — output in `www-camminiditalia/` |
| Build native | `gulp build-android-apk` / `build-android-bundle` / `build-ios` — **`gulp build-android` non compila**, prepara soltanto |
| Test unitari | `npm run test` (Karma + Jasmine) |
| Test E2E | `npx cypress open` (interattivo) o `npx cypress run` (headless) |
| Lint | `npm run lint` |

## Convenzioni

- **Naming, applicato da ESLint**: interfacce con prefisso `I` (`ITrack`), enum con `E`
  (`ELayerType`), membri di enum in `UPPER_CASE`, membri privati con underscore iniziale, selettori
  dei componenti con prefisso `webmapp-`. JSDoc obbligatorio su funzioni e metodi. **Non vale per
  `wm-types`**, che dichiara la convenzione opposta — i suoi tipi non hanno il prefisso `I` — e non
  va allineato a questa.
- **TypeScript in strict mode** (`strictTemplates`, `strictInjectionParameters`,
  `strictInputAccessModifiers`), target ES2022.
- **Gli ID dei ticket hanno la forma `oc:<numero>`** e vengono da Orchestrator. Ogni documento sotto
  `docs/features/` inizia con `> Ticket: oc:<ID>`, lo slug della cartella è
  `<ID>-<titolo-in-kebab-case>`, e lo scope dei commit porta il ticket: `feat(oc:<ID>): …`.
- **`docs/` ha quattro destinazioni**: `features/` è il cantiere di un lavoro (immutabile),
  `knowledge/` la conoscenza per argomento, `howto/` le procedure, `config/` la documentazione di
  configurazione e i18n. Le trappole non stanno in nessuna: stanno in `.claude/rules/`.
- **Documentazione, commenti e messaggi di commit in italiano**, i termini tecnici in inglese.

## Architettura

`core/src/app/` contiene `components/`, `pages/`, `services/`, `store/` (NgRx: actions, reducer,
effects, selettori) e `types/`. I tre submodule stanno sotto `core/src/app/shared/`, con gli alias
`@wm-core/*`, `@map-core/*`, `@wm-types/*`. Si aggiornano con `./update-submodules.sh`.

## Conoscenza

| Argomento | Cosa copre | Ticket | Pagina |
|---|---|---|---|
| Build di produzione e deploy web | Perché esistono due deploy, il vincolo multi-tenant, perché `--prod` non funzionava | oc:8382 | [docs/knowledge/build-e-deploy-web.md](docs/knowledge/build-e-deploy-web.md) |
| CI, preview e deploy | I workflow, i submodule testati dalla loro directory, il fork guard | oc:8023 | [docs/knowledge/ci-e-pipeline.md](docs/knowledge/ci-e-pipeline.md) |
| Condivisione sui social | `ShareService` come unico punto di orchestrazione, il gating sulla sincronizzazione | oc:8183 | [docs/knowledge/condivisione-social.md](docs/knowledge/condivisione-social.md) |
| Deep link | Listener nativo `appUrlOpen`, navigazione Home→Map, apertura del pannello al mount | oc:8470, oc:7980 | [docs/knowledge/deep-link.md](docs/knowledge/deep-link.md) |
| Download offline e `hitMapUrl` | Il flusso per lo shard carg, l'invariante con `map-core` | oc:8190 | [docs/knowledge/download-offline-carg.md](docs/knowledge/download-offline-carg.md) |
| Gulp, risorse native e permessi | Validazione delle dimensioni, permessi Android, immagini di profilo, posthog | oc:8246, oc:7294, oc:7480, oc:8105, oc:8277 | [docs/knowledge/gulp-e-build-native.md](docs/knowledge/gulp-e-build-native.md) |
| Log in produzione | Il criterio di triage a due assi, cosa resta e perché | oc:8369 | [docs/knowledge/log-in-produzione.md](docs/knowledge/log-in-produzione.md) |
| Pannello di dettaglio sulla mappa | Altezza dinamica col `ResizeObserver`, scroll automatico rimosso, box informativi; dettaglio POI in wm-core | oc:8313, oc:8458, oc:8427, oc:8181, oc:8406 | [docs/knowledge/pannello-dettaglio-mappa.md](docs/knowledge/pannello-dettaglio-mappa.md) |
| Preferiti | I due tab, il default reattivo e il guard sulla scelta manuale | oc:8176, oc:8465 | [docs/knowledge/preferiti.md](docs/knowledge/preferiti.md) |
| Registrazione di una traccia | I badge partenza/arrivo, la «flex sandwich», cosa è stato provato e ritirato | oc:8284 | [docs/knowledge/registrazione-traccia.md](docs/knowledge/registrazione-traccia.md) |
| Temi e varianti di shard | CSS o `fileReplacements`, la searchbar camminiditalia, gli override che si rompono | oc:8305, oc:8391, oc:8414 | [docs/knowledge/temi-e-varianti-di-shard.md](docs/knowledge/temi-e-varianti-di-shard.md) |

## Trappole

Stanno in `.claude/rules/`, un file per soggetto, con il frontmatter `paths:` che le carica quando
si toccano i file corrispondenti: `file-replacements` (i tre vincoli del pattern, più il deploy web
multi-tenant), `gulp-e-risorse` (`build-android` che non compila, `cordova-res` da invocare per
tipo, la chiave dei permessi UGC), `download-offline` (l'invariante con `map-core`, i due
`downloadOverlay` omonimi, gli import di `pages/poi/`) e `template-wm-map` (l'ordine degli attributi su `<wm-map>`).
