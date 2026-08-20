> Ticket: oc:8382

# Fix build --prod per deploy e deploy-to-web (webmapp-app + wm-webapp)

## Cosa cambia

Oggi il deploy di produzione di `webmapp-app` (`npm run deploy-to-web`, invocato da `deploy_prod.yml`) esegue `ionic build` **senza** `--prod`: build non ottimizzata (AOT disattivato, nessuna minificazione/tree-shaking), spedita così com'è in produzione. Lanciare `ionic build --configuration production` oggi fallisce con 17 errori TypeScript/Angular concentrati in due file:

- `src/app/pages/poi/poi.page.html` + `poi.page.ts` (14 errori): la pagina referenzia un componente mappa `itinerary-webmapp-map` che non esiste più da nessuna parte nel repo (API pre-map-core, mai aggiornata), una property `relatedPoi$` rimossa in un refactor precedente, e tre componenti wm-core (`wm-image-gallery`, `wm-related-urls`, `wm-track-audio`) non risolvibili per una catena di export mancante (`SharedModule` importa `WmCoreModule` ma non lo ri-esporta).
- `src/app/components/box/downloaded-tracks-box/downloaded-tracks-box.component.ts` (1 errore): tipizza i dati con un'interfaccia `IHIT` locale ormai disallineata da `Hit` (`@wm-types/elastic`), che nel frattempo ha aggiunto i campi `properties`/`taxonomyIcons`.

Verificato che la route `/poi` non è mai navigata da nessun'altra pagina dell'app e non esiste alcuna configurazione di deep link/universal link che vi punti dall'esterno: è codice orfano, sicuro da rimuovere.

Il fix quindi:
1. Rimuove interamente `PoiPage`, `poi.module.ts`, la relativa route in `app-routing.module.ts` e i file associati (dead code, non "ripristinato" ad una nuova API).
2. Allinea `downloaded-tracks-box.component.ts` a usare `Hit` da `@wm-types/elastic` al posto di `IHIT` locale. **Non è un fix di solo tipo**: `Hit.id` è `number | string` mentre `IHIT.id` era `number`, quindi il metodo `open(id: number): void` (chiamato dal template con `property.id`) smette di compilare col nuovo tipo — va aggiornato in coppia con il cambio di tipo (es. allargando la firma a `number | string`, o normalizzando l'id prima della chiamata se a runtime è sempre numerico).
3. Aggiorna gli script `deploy-to-web*` in `core/package.json` per usare `ionic build --configuration production` (equivalente a `--prod`).

In `wm-webapp` (repo separato, non submodule) la build `--prod` è già verificata pulita (0 errori, solo warning non bloccanti su bundle budget e Sass `@import` deprecato). L'unico allineamento necessario è lo script `surge-camminiditalia`, che oggi è l'unico a non usare `--prod` mentre tutti gli altri script deploy/surge già lo fanno.

## Perché

Il deploy di produzione di `webmapp-app` sta spedendo agli utenti finali una build di sviluppo (non ottimizzata, non minificata) invece di una build di produzione — un problema di igiene del build/performance scoperto ispezionando gli script di deploy, non legato a una segnalazione specifica di un cliente. Va risolto passando a `--prod`, il che richiede prima di sanare gli errori di compilazione che oggi la build ottimizzata (AOT + strictTemplates) espone e che la build di sviluppo (JIT, meno rigorosa) nasconde.

## Requisiti

- [ ] `ionic build --configuration production` completa senza errori in `webmapp-app/core`
- [ ] `PoiPage`, `poi.module.ts`, i relativi file HTML/TS/SCSS e la route `poi` in `app-routing.module.ts` sono rimossi interamente
- [ ] `downloaded-tracks-box.component.ts` usa `Hit` da `@wm-types/elastic` al posto di `IHIT` locale (interfaccia `IHIT` locale rimossa se non più usata altrove)
- [ ] `open(id: number)` in `downloaded-tracks-box.component.ts` aggiornato per accettare `number | string` (conseguenza diretta del cambio di tipo `id` da `IHIT` a `Hit`) — la build deve compilare senza errori su questo punto
- [ ] Gli script `deploy-to-web`, `deploy-to-web-verbose`, `deploy-to-web-assets`, `deploy-cai-to-web` in `core/package.json` usano `ionic build --configuration production` (o `--prod`)
- [ ] Nessuna regressione visibile nell'app dopo la build di produzione: verifica manuale (o Surge preview) delle pagine principali, in particolare quelle toccate indirettamente (home, box downloaded-tracks)
- [ ] In `wm-webapp`: script `surge-camminiditalia` allineato a `--prod`
- [ ] In `wm-webapp`: validazione via Surge preview sullo shard camminiditalia dopo l'allineamento (primo test `--prod` per questo shard)

## Rischi

- **AOT abilitato per la prima volta nel path di deploy reale**: passare da build JIT (dev) a build AOT (`--prod`) in produzione può rivelare differenze di comportamento runtime mai osservate finora (es. altri componenti con `CUSTOM_ELEMENTS_SCHEMA` mancante, silenziosamente tollerati in JIT). Mitigazione: validare su Surge preview / build locale `--prod` servita staticamente prima del merge, non solo verificare che la compilazione passi.
- **`IHIT`→`Hit` non è un fix di solo tipo**: `Hit.id` è `number | string` (vs `IHIT.id: number`), quindi richiede di aggiornare anche `open(id: number)` in coincidenza col cambio tipo — vedi Requisiti. I track scaricati offline (`getEcTracks()`) potrebbero inoltre non popolare realmente `properties`/`taxonomyIcons` a runtime: il consumer (`wm-search-box`) accede a questi campi solo con optional chaining, quindi l'assenza dei dati degrada senza errori (nessuna taxonomia mostrata), non causa crash. Nota minore: `Hit.taxonomyActivities: any` è più permissivo di `IHIT.taxonomyActivities: string[]` — piccolo arretramento di type-safety su quel campo, accettato perché la fonte di verità dei tipi deve restare `wm-types`.
- **Rimozione route `/poi`**: rischio di rompere un deep link esterno. Mitigazione: verificato nel codice che non esiste alcuna configurazione di universal link/App Links che punti a `/poi/:id`, né riferimenti da altre pagine dell'app.
- **Debito tecnico noto, non affrontato in questo ciclo**: `SharedModule` importa `WmCoreModule` senza ri-esportarlo — un consumer futuro che tenti di usare `wm-image-gallery`/`wm-related-urls`/`wm-track-audio` fuori da `WmCoreModule` diretto incapperà nello stesso errore silente. Non corretto qui perché il problema sparisce con la rimozione della pagina morta che lo esponeva.

## Out of scope

- Nessuna modifica a `SharedModule` (export mancante di `WmCoreModule`) — vedi debito tecnico sopra.
- Nessuna revisione della shape dati di `getEcTracks()`/track offline per popolare realmente `properties`/`taxonomyIcons`.
- Nessuna modifica ai budget bundle in `angular.json` (i warning attuali non bloccano la build, restano entro la soglia di errore).
- Nessuna modifica alle pipeline CI oltre a quanto necessario per far passare `npm run deploy-to-web` con `--prod` (i workflow che già usano Node 22 e chiamano gli script esistenti restano invariati).

## Moduli toccati

- `core/src/app/pages/poi/` — rimosso interamente (repo: webmapp-app)
- `core/src/app/app-routing.module.ts` — rimozione route `poi` (repo: webmapp-app)
- `core/src/app/pages/map/utils.ts` — nuovo file: funzioni Swiper (`beforeInit`/`setTranslate`/`setTransition`) spostate qui da `pages/poi/utils.ts` perché consumate da `map.page.ts`, non da `PoiPage` (deviazione scoperta in esecuzione, vedi `notes.md`)
- `core/src/app/pages/map/map.page.ts` — import aggiornato al nuovo path `./utils`
- `core/src/app/components/box/downloaded-tracks-box/downloaded-tracks-box.component.ts` — fix tipo `IHIT`→`Hit`
- `core/src/app/types/elastic.d.ts` — rimosso (interfaccia `IHIT`/`IELASTIC` locale non più usata)
- `core/package.json` — script `deploy-to-web*` con `--configuration production`; campo `overrides` aggiunto per risolvere una collisione di dipendenze (`domhandler`) che impediva alla build `--prod` di completare (deviazione scoperta in esecuzione, vedi `notes.md`)
- `package.json` — script `surge-camminiditalia` con `--prod` (repo: wm-webapp)
