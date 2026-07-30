> Ticket: oc:8313

# Notes — wm-map-details lascia spazio bianco in fondo al pannello di dettaglio

## Deviazioni dal piano

- **Task 7 (scope test CI in `angular.json`/`tsconfig.spec.json`) eseguito prima del Task 1**, non alla fine come da `plan.md`: senza questa modifica i test dei task precedenti non potevano nemmeno compilare (`tsconfig.spec.json` limita la discovery TypeScript ai path già inclusi — provare a girare `ng test --include=...` su un file fuori da quello scope fallisce con un errore di compilazione, non con "modulo non trovato"). Nessun impatto sul risultato finale: lo stato del working tree a fine implementazione è identico a quello previsto dal piano, verificato con una run completa della suite (32/32 verde) dopo l'esecuzione di tutti i task.

## Bug trovati e fix (review formale pre-commit)

Prima del commit, su richiesta del developer, è stata eseguita una review formale con 5 finder paralleli (correctness, side-effect/bug, deviazioni, cleanup, architettura) più verifica indipendente di ogni claim (incluso un test empirico in browser). Verdetto iniziale: **DA CORREGGERE**, 3 finding bloccanti confermati:

1. **Selettori CSS `:has(> wm-X)` del tema `geohub/75.css` rotti** — il nuovo `.wm-content-wrapper` introdotto per il `ResizeObserver` rende `wm-track-properties`/`wm-home-layer`/`wm-poi-properties`/`wm-image-detail` nipoti invece di figli diretti di `ion-card-content`, disabilitando silenziosamente 4 override di altezza per lo shard geohub. **Fix:** rimosso il combinatore di figlio diretto (`:has(wm-X)` invece di `:has(> wm-X)`) nei 4 selettori — immune alla profondità del DOM, nessun'altra modifica necessaria.

2. **La vista galleria immagini (`wm-image-detail`) non riempiva più il pannello** — `.gallery { height: calc(100% - 55px) }` (in `image-detail.component.scss`, preesistente) dipendeva da una catena di risoluzione percentuale fino a `ion-card-content` (height:100%, ancorata all'altezza host animata). Il nuovo wrapper (height:auto, per design, per evitare il loop di `ResizeObserver`) interrompe quella catena. Verificato empiricamente in browser: la galleria appariva come riquadro compatto centrato invece che a schermo pieno. **Fix in due parti:**
   - CSS: `.wm-content-wrapper:has(> wm-image-detail) { height: 100%; }` — ripristina la catena di risoluzione percentuale solo quando la galleria è il contenuto attivo.
   - JS: nuovo metodo `_isGalleryContentActive()` (`map-details.component.ts`) — quando la galleria è attiva, `_applyHeightForStatus()` bypassa completamente la misura del contenuto e usa direttamente il tetto massimo come target, evitando di reintrodurre il rischio di loop del `ResizeObserver` che l'altezza percentuale del wrapper (ora ripristinata per questo caso) altrimenti comporterebbe.
   - Riverificato empiricamente in browser dopo il fix: il pannello torna a riempire lo spazio disponibile in stato "full" con la galleria aperta.

3. **Il drag-handle da stato "background" reale cambiava comportamento** — `'background'` non è solo un artefatto del mount iniziale (come assunto nel commento originale), ma uno stato reale e frequente, dispatchato da `backOfMapDetails$`/`goToHome$` (wm-core, `user-activity.effects.ts`). Con la logica pixel-based originale, un drag da quello stato (altezza reale 0px) andava a `'full'`; la prima versona della logica ancorata allo stato logico lo mandava invece a `'open'` — cambio di comportamento non richiesto, in contrasto con l'"Out of scope" dichiarato nell'overview. **Fix:** rimossa la clausola speciale su `'background'` in `_setGesture().onStart` — solo `'full'` mappa a `'open'`, tutti gli altri stati (incluso `'background'` reale) mappano a `'full'`, fedele al comportamento originale per tutti gli stati realmente raggiungibili nell'app.

Tutti e 3 i fix coperti da nuovi unit test (`map-details.component.spec.ts`): dispatch da stato `'background'`, rilevamento `_isGalleryContentActive()`, bypass della misura contenuto quando la galleria è attiva. Suite completa dopo i fix: 35/35 verde.

### Finding non confermati durante la review

- Un finder aveva proposto come bloccante un "doppio scatto" visivo (snap veloce a 320px seguito da una crescita animata) per lo stato "full", causato dal ritardo di 250ms (`showMapDetailsContent$` in `map.page.ts`) prima che il contenuto proiettato monti nel DOM. Verificato che non si manifesta nel percorso d'uso normale: `'full'` è raggiungibile solo tramite gesture esplicita dell'utente, sempre dopo che il pannello è già stato in stato `'open'` con contenuto già montato e misurato — quindi la misura del contenuto al momento della transizione a `'full'` è già quella reale, non 0. Resta un edge case narrow (tap sul drag-handle nei ~250ms immediatamente successivi all'apertura, prima che il contenuto monti) — declassato a follow-up, non bloccante.
- Un altro finder aveva erroneamente confutato il rischio sulla galleria immagini, sostenendo che `wm-image-detail` fosse usato solo in una modale separata (`ModalImageComponent`) e mai dentro il contenuto proiettato di `wm-map-details`. Verificato (`map.page.html:58`) che è invece usato direttamente dentro lo stesso `<ng-container>` proiettato — il rischio era reale ed è stato confermato empiricamente (vedi punto 2 sopra).

## Decisioni

- **"Open" resta sempre a 320px, per decisione esplicita del developer** (Fase: reverse-interaction): floor e tetto massimo coincidono in questo stato. Il fix per "open" è quindi limitato alla rimozione del `padding-bottom: 15%` — la formula `computeTargetHeight()` è comunque applicata uniformemente a entrambi gli stati per coerenza del codice, anche se per "open" il risultato è matematicamente sempre 320px. La formulazione originaria del Requisito 1 in `overview.md` era self-contradictory su questo punto (parlava di "restringersi fino al contenuto reale") — corretta durante la review.
- **Resize droppato durante una gesture attiva non viene mai ripetuto a gesture conclusa** (edge case: il contenuto cambia altezza esattamente durante un drag, e non cambia più dopo) — accettato come rischio noto, non mitigato in questo ciclo. Severità bassa: nella pratica ogni transizione di stato (inclusa quella dichiarata dalla gesture stessa) rifà comunque una misura fresca.

## Follow-up

- Debito tecnico noto e non affrontato in questo ciclo (già dichiarato in `overview.md` → "Out of scope"): incoerenza `prefers-reduced-motion` tra resize automatico e transizioni manuali; tetto massimo non ricalcolato alla rotazione del device a pannello aperto.
- Cleanup minori identificati dalla review, non bloccanti, non applicati in questo ciclo: `_measureContentHeight`/`_measureHeaderHeight` quasi duplicati; union type `'open' | 'full'` ripetuta in 3 punti; naming `@ViewChild` incoerente (`dragHandleIcon` vs `contentWrapperRef`/`cardHeaderRef`); magic number `200` (margine superiore stato "full") non estratto in costante, a differenza del debounce; `ngOnDestroy` posizionato in mezzo ai metodi privati anziché seguire l'ordinamento pubblico/privato del file; 2 file non conformi a Prettier (`printWidth: 100`); `ngOnDestroy` non pulisce le due subscription preesistenti in `ngAfterViewInit` (non un leak oggi, dato che il componente vive quanto `MapPage`, ma diventa un'aspettativa implicita ora che il hook esiste).
