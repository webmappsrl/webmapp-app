# Il pannello di dettaglio sulla mappa

## Come funziona oggi

`wm-map-details` anima l'altezza dell'host con `AnimationController` e valori numerici espliciti, e la calcola sul contenuto reale: un `ResizeObserver` misura un wrapper interno **senza** `height:100%` né `overflow`, e il target è `min(max(contentHeight + headerHeight, 320), tetto dello stato)`.

Lo scroll automatico all'apertura di un box informativo **non esiste più**: `wm-config-detail` non dispaccia più `configDetailSettled`, e `onConfigDetailSettled()`/`_isFullyInView()` sono stati rimossi.

I box informativi (`config_detail`) sono montati anche in `poi-properties.component.html`.

## Perché così

- **Osservare `ion-card-content` avrebbe creato un loop** (oc:8313): ha `height:100%; overflow-y:auto`, quindi è vincolato all'altezza già imposta dall'animazione — misurarlo produrrebbe resize → animate → resize.
- **`headerHeight` va sommato a parte** (oc:8313): il `ResizeObserver` misura il contenuto, non l'host su cui si anima l'altezza.
- **Lo stato «open» resta fisso a 320px** (oc:8313), floor e tetto coincidenti: decisione esplicita in reverse-interaction. L'unico cambiamento visibile è la rimozione del `padding-bottom: 15%`, che aggravava lo spazio vuoto.
- **Le soglie di stato vanno ancorate allo stato logico, non ai pixel** (oc:8313): con «full» ora content-fit, confrontare l'altezza corrente contro `minInfoheight`/`maxInfoheight` è inaffidabile — un «full» con contenuto corto può risultare sotto le soglie pensate per distinguere «onlyTitle» da «open».
- **Il gesture è un toggle-al-tocco, non un drag proporzionale** (oc:8313): `_setGesture()` ha solo `onStart`/`onEnd`, nessun `onMove`. Il fix preserva questo meccanismo.
- **Debounce e guardia sulla gesture** (oc:8313): i resize automatici non vengono eseguiti mentre una gesture è in corso, e riprendono solo a gesture conclusa.
- **La rimozione del meccanismo di assestamento è integrale, non un isolamento** (oc:8427 → oc:8458): oc:8427 aveva introdotto `transitionend`, un debounce con fallback e un `CustomEvent('configDetailSettled')` per far assestare l'accordion prima dello scroll; oc:8458 ha cancellato tutto insieme, perché quell'unico scopo — lo scroll automatico — spariva nello stesso ciclo. Se servisse un hook «item aperto e visibile», per analytics o altro, va riscritto da zero: non c'è nulla da riattivare.
- **Nessun `fileReplacements`, nessuna eccezione per camminiditalia** (oc:8458): `wm-config-detail` non ha mai avuto personalizzazioni per-shard e non ne introduce, anche se il ticket è nato sul branch RDO.
- **Nessun flag `OPTIONS.*` di rollout** (oc:8458), a differenza del pattern usato per altre modifiche UX condivise: cambio di interazione minore, non abbastanza rischioso da meritare un kill switch.

## Trovato per strada

**`openPoi()` in `cypress/utils/test-utils.ts` non faceva `.scrollIntoView()`** prima di `.should('be.visible')** (oc:8458), causando fallimenti intermittenti su qualunque spec che aprisse un POI dai risultati Home. Non c'entrava con `wm-config-detail`: è emerso eseguendo davvero il nuovo test.

Il bug dello spazio bianco è stato invece **diagnosticato durante i test di oc:8305**, e non era causato da quel ticket.
