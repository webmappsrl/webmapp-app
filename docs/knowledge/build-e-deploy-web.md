# Build di produzione e deploy web

## Come funziona oggi

Ci sono **due deploy web separati**: `deploy-to-web-default.js` e `deploy-to-web-camminiditalia.js`, quest'ultimo con output in `www-camminiditalia/` per non sovrascrivere `www/`. Entrambi usano `--configuration=production` — il secondo combinato con `camminiditalia`.

Gli script includono già la build: `npm run deploy-to-web` chiama `ionic build` internamente, quindi in CI non serve uno step di build separato.

## Perché il deploy dedicato esiste

**`EnvironmentService.init()` (`wm-core`) decide lo shard a runtime leggendo `window.location.hostname`**: l'`environment.ts` statico conta solo per `localhost`. Quindi il deploy web su `mobile.webmapp.it` è **un solo bundle condiviso da tutti i clienti**, e buildarlo con `--configuration=camminiditalia` pubblicherebbe il template dedicato **a tutti**. Da qui il deploy separato, con la propria build e il proprio target rsync.

È il vincolo che rende la personalizzazione per-shard un problema diverso sul web rispetto alle build native.

## Perché `--prod` non funzionava

Falliva per due cause indipendenti, entrambe latenti perché nessun deploy CI aveva mai usato `--prod` (oc:8382):

- **17 errori TS/Angular**, concentrati in `PoiPage` — che referenziava un componente mappa `itinerary-webmapp-map` mai esistito nel repo, dead code confermato — e in `downloaded-tracks-box.component.ts`, con un tipo `IHIT` locale disallineato da `Hit` di `wm-types`.
- **Una collisione di dipendenze `domhandler`**: due copie incompatibili, 4.3.1 via `@capacitor/assets` → `node-html-parser` e 5.0.3 via `beasties`/`@angular/build`, che rompeva l'inlining del CSS critico in `index.html` **anche a zero errori TS**.

Il fix per la collisione è stato un `overrides` scoped in `core/package.json`, non disabilitare `inlineCritical`: nessuna perdita di ottimizzazione e nessuna dipendenza applicativa toccata, dato che `@capacitor/assets` non è mai invocato dal `gulpfile.js` di questo progetto.

Sul branch RDO è poi emerso un errore in più (`ion-segment`/`SegmentValue` in `favourites.page.html`), mai visto prima perché nessuna build production era mai stata tentata lì.

## Trappole e debito

- **`pages/poi/utils.ts` non era dead code** (oc:8382) pur vivendo in quella cartella: lo importava `map.page.ts`, che è viva. È stato spostato in `pages/map/utils.ts`. L'obbligo che ne discende — controllare gli import relativi e non solo il nome della cartella — sta in [.claude/rules/download-offline.md](../../.claude/rules/download-offline.md).
- **`SharedModule` importa `WmCoreModule` ma non lo ri-esporta** (oc:8382): un futuro consumer di `wm-image-gallery`, `wm-related-urls` o `wm-track-audio` fuori da `WmCoreModule` diretto incapperà nello stesso errore di build incontrato con `PoiPage`.
