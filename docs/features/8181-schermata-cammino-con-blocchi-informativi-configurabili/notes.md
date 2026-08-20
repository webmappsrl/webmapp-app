> Ticket: oc:8181

# Notes — Schermata cammino con blocchi informativi configurabili (webmapp-app)

## Deviazioni dal piano

- **Layer id 55 → 504** nel test Cypress (Task 3): il piano lasciava esplicitamente questo id come placeholder da verificare in esecuzione. Corretto e verificato in modo indipendente durante la review incrociando due file di test preesistenti (`map-overlay-feature-collection.cy.ts`, `E2E_FC_LAYER_ID = 504`; `not-accessible-track.cy.ts`) che confermano 504 per lo stesso layer `data.layers.ecTrack` ("Tracks test e2e").
- **Task 1 (bump submodule wm-core)**: i commit su wm-core esistono sul branch feature; in questa sessione si bumpano anche i pin di `wm-core` e `wm-types` dopo lo spostamento dei tipi `ConfigDetail*` in `@wm-types/config`.
- **Tipi `config_detail` in wm-types**: `ConfigDetailBox` / `ConfigDetailInfoBox` / `ConfigDetailInfoBoxItem` (senza prefisso `I`) vivono in `wm-types/src/config.ts`; wm-core e i consumer importano da `@wm-types/config`.
- **Task 4 (verifica manuale interazione oc:8313) — parziale**: analisi statica del codice conferma allineamento temporale (`grid-template-rows 0.3s` + `MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS=120` → ~420ms). Automazione browser MCP non ha potuto completare il check visivo interattivo (limitazioni tool + home senza layer boxes in sessione headless). **Verifica visiva finale resta al developer** prima del merge.
- **Il componente condiviso `wm-config-detail` (wm-core) è cambiato dopo il riepilogo del review-gate**, in seguito a QA manuale del developer sull'app in esecuzione: apertura esclusiva (un item alla volta), spazio verticale maggiore tra gruppi diversi, chevron/bordo colore `--wm-color-primary` invece di warning/arancione, embed iframe reso responsive. Nessuno di questi cambiamenti tocca il contratto `[groups]`/selettore consumato da `poi-properties.component.html` in questo repo — il wiring Task 2 di questo piano resta invariato. Dettaglio completo in `docs/features/8181-.../notes.md` del repo wm-core.

## Bug trovati

- **[RISOLTO] Test EcPoi avrebbe fallito in timeout**: `ec_poi_with_config_detail.properties` non aveva `taxonomyIdentifiers` — il layer EcPoi filtra le feature per taxonomy (`isArrayContained` in wm-core), quindi il POI mockato non sarebbe mai apparso nella lista e `openPoi(...)` sarebbe andato in timeout. Trovato solo nel final whole-branch review (nessuna esecuzione reale del test era stata fatta prima). Fix: aggiunto `taxonomyIdentifiers: ['poi-test-e2e', 'end2end-pois', 'poi_type_poi']`, stesso valore già usato per lo stesso layer in `ec-poi-details.cy.ts`.
- **[RISOLTO] Nome test fuorviante**: un test si chiamava "...shows nothing when the field is absent" ma il corpo copriva solo il caso popolato (il caso assente era nel test successivo). Rinominato.
- **[RISOLTO] Test sul caso "assente" privo di ancoraggio positivo**: l'unica asserzione era `should('not.exist')` — se la navigazione fosse silenziosamente fallita, il test sarebbe passato comunque senza aver verificato nulla. Aggiunta un'asserzione positiva (`wm-map-details .wm-box-title` contiene il titolo del layer) prima di quella negativa, stesso pattern di `map-overlay-feature-collection.cy.ts`. **Correzione**: il fix era stato applicato solo al test "renders config_detail on the Layer detail" (caso popolato), non al test "renders nothing when config_detail is absent on a Layer" (caso assente) che restava senza ancoraggio — trovato da `wm-skills:wm-review-ticket` in un passaggio successivo e corretto su entrambi i test.
- **[RISOLTO in `wm-skills:wm-review-ticket`] Nessun caso di test esercitava il fallback lingua a cascata** — requisito esplicito dell'overview, gap non registrato come accettato. Aggiunto un nuovo `it()` con un item che ha solo `it` (nessun `en`): dato che la lingua corrente nei test Cypress è `en` (lingua del browser), la sua assenza forza il fallback verso `defaultLang` (`it`), esercitando davvero la cascata invece di limitarsi a leggere `en`.
- **[RISOLTO in `wm-skills:wm-review-ticket`, componente wm-core] Due bug bloccanti nel componente condiviso `wm-config-detail`**, trovati durante la review e corretti nel repo wm-core (non in questo repo, ma impattano ciò che questo test verifica): `*ngFor` senza `trackBy` (l'intera lista veniva ricreata ad ogni click, vanificando focus/animazione/cache degli embed) e `aspect-ratio:16/9` forzato sugli iframe (distorceva embed non 16:9, es. una mappa 4:3 — proprio come nel dato di QA manuale usato in questa sessione). Dettaglio completo in `docs/features/8181-.../notes.md` del repo wm-core.

## Decisioni

- **`ILAYER.id` è tipizzato `string` ma il payload reale di `MAP.layers[].id` in `config.json` è un numero JSON puro** (verificato in `conf-camminiditalia-1.json`) — debito tecnico pre-esistente sul tipo, non introdotto da questa feature. Il confronto nel test usa `String(layer.id) === '504'` per essere type-safe senza cambiare comportamento a runtime.
- **`core/src/environments/environment.ts` non toccato**: la modifica locale preesistente (`shardName`, non mia) resta fuori da questa feature per esplicita indicazione del developer alla creazione del branch.

## Seconda passata `wm-skills:wm-review-ticket` (ri-verifica dopo i fix della prima passata)

Eseguita su richiesta esplicita del developer per verificare lo stato corrente dopo i fix della prima review. 5 finder paralleli.

- **[RISOLTO, bloccante] `ec_poi_with_config_detail.properties.taxonomyIdentifiers` incompleto**: il fix applicato nella prima passata (`['poi-test-e2e', 'end2end-pois', 'poi_type_poi']`) era documentato sopra come "stesso valore già usato in `ec-poi-details.cy.ts`" — verificato falso ri-leggendo direttamente quel file: mancavano `where_marche`, `where_ascoli-piceno`, `where_044023`. Il filtro taxonomy del layer (`isArrayContained`) richiede TUTTI gli identificatori derivati dal layer, non un sottoinsieme — con l'elenco incompleto il test EcPoi sarebbe comunque andato in timeout. Corretto copiando l'elenco completo e reale da `ec-poi-details.cy.ts`.
- **[RISOLTO, cleanup] Naming ambiguo `pageSize`/`current`** in `config-detail.component.ts` (wm-core): rinominati entrambi a `visibleCount` — nessuno dei due nomi corrispondeva davvero al valore dopo un click su "Mostra altro" (`PAGE_SIZE * N`, non `PAGE_SIZE`). Trovato indipendentemente da due finder diversi (convergenza).
- **[RISOLTO, cleanup] Magic string `'504'` senza costante nominata** in `config-detail-boxes.cy.ts`: estratta in `E2E_TRACKS_TEST_LAYER_ID`, con commento di cross-reference a `E2E_FC_LAYER_ID` (`map-overlay-feature-collection.cy.ts`) e `not-accessible-track.cy.ts`.
- **[CONFERMATO RISOLTO, nessun residuo] I due bloccanti della prima passata** (`*ngFor` senza `trackBy`, `aspect-ratio:16/9` forzato) sono stati verificati di nuovo da due finder indipendenti leggendo il codice a HEAD: entrambi correttamente fixati, nessuna regressione.
- **Verdetto**: APPROVATO CON RISERVE — nessun bloccante residuo dopo il fix `taxonomyIdentifiers`; i cleanup trovati sono stati applicati subito. Riserva aperta, per scelta esplicita del developer: `_resolve()` duplica la logica di fallback a cascata di `WmTransPipe` invece di riusarla — non toccato perché richiederebbe modificare il pipe condiviso a livello di app, fuori dal blast radius di questo ticket senza conferma esplicita.
- Verificato con `ng build --configuration=ci` (exit 0) dopo ogni fix di questa passata, non solo alla fine.

## Terza passata `wm-skills:wm-review-ticket` + completamento verifiche (sessione Cursor)

Eseguita sul working tree corrente (nessuna PR). Include esecuzione reale Cypress e fix applicati prima del verdetto finale.

### Fix CSS post-QA (sessione Claude PID 29915, confermato in questa sessione)

- **Margine sul wrapper `.wm-config-detail`**, non sul tag host `wm-config-detail`: il wrapper è gated da `*ngIf="visibleEntries.length"` — nessuno spazio fantasma quando `config_detail` assente/vuoto anche se l'host resta nel DOM nei 3 consumer.
- **`> *:last-child { margin-bottom: 0 }`** al posto di `.wm-config-detail-item:last-of-type`: evita gap zero tra ultimo item e pulsante "Mostra altro"/"Mostra meno".

### Cypress — esecuzione reale e fix spec

Comando (Node 22, `shardName: 'geohub'` + `appId: 52` temporanei in locale — **non committati**):
```bash
cd core && npx cypress run --spec "cypress/e2e/app_52/config-detail-boxes.cy.ts"
```
**Esito: 5/5 passing** (~60s).

Fix applicati alla spec durante questa sessione:
- **Scope `wm-map-details`** su tutti i test Layer (e poi anche EcTrack/EcPoi/fallback): con `testIsolation: false` Home e Map montano entrambi `wm-home-layer`/`wm-config-detail` per lo stesso layer nel store — selettori globali contavano 4 item invece di 2.
- **`interceptConfWithoutLayerConfigDetail()`** + test "assente" spostato **prima** del test Layer popolato: sovrascrive intercept conf persistenti tra test nella stessa `describe`.
- **`goHome(false)`** dopo ogni `cy.visit('/')`: stabilizza la navigazione verso i `wm-layer-box` (flakiness `.wm-drag-btn` visibility:hidden).

### Verifica manuale oc:8313 (Task 4)

- **Analisi codice positiva**: accordion `0.3s` + debounce ResizeObserver `120ms` = ~420ms di assestamento atteso, coerente col piano.
- **Check visivo interattivo non completato** in automazione (browser MCP limitato). Developer: aprire Layer/EcTrack/EcPoi con `config_detail`, verificare che il pannello `map-details` si ridimensioni senza scatti/spazi bianchi aprendo/chiudendo item rapidamente.

### Terza review — finding e verdetto

- **[RISOLTO, bloccante] Selettori Cypress non scoped + leak intercept conf**: fix sopra, 5/5 verdi.
- **[RISOLTO, cleanup] Ordine test + `goHome(false)`**: riduce flakiness drag handle.
- **[CONFERMATO, riserva accettata] `_resolve()` duplica `WmTransPipe`**: non toccato (stessa riserva delle passate precedenti).
- **[CONFERMATO, cleanup] Nessun caso "assente" EcTrack/EcPoi**, nessun expand Layer in Cypress — gap accettato.
- **[CONFERMATO, pre-esistente] CI `shardName` vs intercept geohub hardcoded** in `test-utils.ts`: rischio infra su `develop` (`shardName: 'carg'`), non introdotto da oc:8181.
- **Verdetto**: **APPROVATO CON RISERVE** — codice e test E2E review-ready nel working tree; riserve: QA visivo oc:8313 dal developer, commit/pin wm-core, riserva `_resolve()`.

## Follow-up (non risolto in questo ciclo, segnalato esplicitamente)

- **~~Il test Cypress non è mai stato eseguito realmente~~** → **eseguito in questa sessione, 5/5 passing** (vedi sezione sopra). In CI resta da verificare il mismatch `shardName`/intercept geohub.
- **Rischio CI pre-esistente, non introdotto da questa feature**: lo script di CI (`test-e2e.yml`) aggiorna solo `appId` in `environment.ts`, non `shardName` — se il valore committato di `shardName` non è `geohub`, l'intera suite E2E (inclusa questa nuova spec) risolverebbe contro lo shard sbagliato e gli intercept non troverebbero mai le richieste da mockare. Da verificare/risolvere in un ticket dedicato, non in questo.
- **Nessun caso "assente" dedicato per EcTrack/EcPoi** nel test (solo per Layer) — accettato come gap minore, il requisito "nessun rendering quando assente" è comunque verificato almeno su una risorsa.
- **Titoli (`.wm-config-detail-title`) non asserititi nel test**, solo il contenuto — accettato come gap minore.
- **Interazione con `map-details.component.ts` (oc:8313)**: l'animazione CSS dell'accordion (`grid-template-rows`, 300ms) interagisce con il `ResizeObserver`+debounce 120ms di quel componente — il pannello dovrebbe assestare la propria altezza ~420ms dopo il click di apertura/chiusura di un item. Da verificare esplicitamente durante il Task 4 (verifica manuale), non solo genericamente "senza scatti".
