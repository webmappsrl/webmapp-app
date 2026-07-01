> Ticket: oc:8190

# Piano — Documentare funzionamento downloadOverlay e hitMapUrl per shard carg

Repo coinvolto: solo il repo principale (`webmapp-app`, cartella `core/`). Nessun submodule viene modificato — `wm-core`, `map-core` e `wm-types` sono solo letti come riferimento per la documentazione.

## Task 1 — Aggiungere sezione "Feature disponibili" in CLAUDE.md

File: `CLAUDE.md` (root repo)

Aggiungere una riga alla tabella esistente in `## Feature disponibili`:

| Feature | Ticket | Moduli toccati | Note |
|---|---|---|---|
| Documentazione downloadOverlay e hitMapUrl per shard carg | oc:8190 | `core/src/app/pages/map/map.page.html`, `core/src/app/pages/map/download-panel/download-panel.component.ts` | Documenta il meccanismo di download overlay hitmap e il campo hitMapUrl, oggi attivi solo per carg |

Non toccare le righe esistenti.

Commit: `feat(oc:8190): add carg downloadOverlay/hitMapUrl entry to CLAUDE.md feature table`

## Task 2 — Aggiungere blocco "Decisioni architetturali" in CLAUDE.md

File: `CLAUDE.md` (root repo)

Aggiungere in cima alla sezione `## Decisioni architetturali` (le decisioni più recenti vanno in cima) un nuovo blocco `### Documentazione downloadOverlay e hitMapUrl per shard carg (oc:8190)` che copra, in prosa italiana coerente con lo stile dei blocchi esistenti, tutti i punti della sezione "Requisiti" di `overview.md`:

1. Flusso: `wm-download` (wrapper) → `wm-download-panel` (`download-panel.component.ts`) → funzione `downloadOverlay()` da `@map-core/utils`, invocata in `start()` (`download-panel.component.ts:139-148`)
2. Hardcoding `[overlayXYZ]="'https://tiles.webmapp.it/carg'"` in `map.page.html:209` — sovrascrive il default `https://api.webmapp.it/tiles` di `download-panel.component.ts:49`
3. Secondo hardcoding distinto: tile layer basemap geologico in `map-core/src/directives/hit-map.directive.ts:106` (`https://carg.geosciences-ir.it/storage/cargmap/{z}/{x}/{y}.png`) — meccanismo diverso (basemap vs download), non collegato al primo
4. Campo `IMAP.hitMapUrl` — path corretto: `wm-core/projects/wm-core/src/types/config.ts:254` (**non** wm-types); generico nel tipo, letto da `confMAPHitMapUrl` (wm-core) e dispatchato in `app.component.ts`, ma oggi valorizzato solo dal backend carg
5. Distinzione tra i due `downloadOverlay` omonimi: il metodo in `map.page.ts:336-338` è uno stub inerte (`console.log` + apertura pannello); la funzione reale eseguita è quella in `download-panel.component.ts:139-148`, gated su `overlayUrls`/`overlayGeometry` non nulli — condizione vera solo per carg
6. Effetto collaterale di `hitMapUrl`: controlla anche la visibilità della searchbar home (`wm-core/.../home/home.component.html:12`)
7. Nota debito tecnico: la doc descrive lo stato attuale senza validarlo come buona pratica; segnalare la duplicazione delle interfacce `IMAP` tra `wm-core/projects/wm-core/src/types/config.ts` (con `hitMapUrl`) e `map-core/src/types/model.ts:160` (senza `hitMapUrl`) come inconsistenza architetturale nota, non risolta in questo ticket

Commit: `feat(oc:8190): document carg downloadOverlay/hitMapUrl mechanism in CLAUDE.md`

## Task 3 — Aggiungere commento esplicativo in download-panel.component.ts

File: `core/src/app/pages/map/download-panel/download-panel.component.ts`

Alla riga 139 (`if (this.overlayUrls != null || this.overlayGeometry != null) {`), aggiungere un commento sopra la riga che spiega che questo branch esegue di fatto solo per lo shard carg, e perché: `overlayUrls`/`overlayGeometry` sono valorizzati solo quando il backend espone `hitMapUrl` (oggi solo carg lo fa).

Nessuna modifica di logica — solo il commento. Verificare con `git diff` che il file non abbia altre modifiche accidentali.

Commit: `feat(oc:8190): add explanatory comment on carg-only overlay download branch`

## Task 4 — Verifica finale

- `git diff --stat` deve mostrare solo `CLAUDE.md` e `download-panel.component.ts`
- Rileggere la sezione CLAUDE.md aggiunta per verificare che ogni riferimento a file/riga citato nel testo corrisponda ancora al codice reale (i path sono stati verificati durante la fase di challenge di questo ticket, ma vanno ricontrollati al momento della scrittura finale nel caso il codice sia cambiato nel frattempo)
- Nessun test da eseguire: modifica di sola documentazione + un commento, nessun comportamento applicativo cambia

## Note per l'esecuzione

- Ogni commit userà lo scope `oc:8190` come da convenzione
- Nessun commit va eseguito automaticamente: sono istruzioni testuali per il developer, eseguite solo dopo il gate di revisione (`execution: review-gate`) e approvazione esplicita
