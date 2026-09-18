# Il pannello di dettaglio sulla mappa

## Come funziona oggi

`wm-map-details` anima l'altezza dell'host con `AnimationController` e valori numerici espliciti, e la calcola sul contenuto reale: un `ResizeObserver` misura un wrapper interno **senza** `height:100%` né `overflow`, e il target è `min(max(contentHeight + headerHeight, 320), tetto dello stato)`.

Lo scroll automatico all'apertura di un box informativo **non esiste più**: `wm-config-detail` non dispaccia più `configDetailSettled`, e `onConfigDetailSettled()`/`_isFullyInView()` sono stati rimossi.

I box informativi (`config_detail`) sono montati anche nel dettaglio di un POI, che da oc:8406
**non vive più in questo repo**: `wm-poi-properties` sta in wm-core, e `map.page.html` lo monta
senza possedere più nulla del suo contenuto. Il pannello conserva soltanto il proprio header per
i rami UGC e traccia, e il pulsante di chiusura. Cosa rende il componente condiviso e dove finisce
la responsabilità di chi lo monta sta in `wm-core/docs/knowledge/dettaglio-poi.md`.

**`config_detail` non è verificabile su ogni shard**: il campo esiste solo sullo shard dev di
Cammini d'Italia, dove due blocchi sono popolati sul POI «Santa Barbara». Su geohub e sulle app
FIE la lista è vuota e l'accordion non compare — non è un difetto del codice, e un QA che si
aspetta di vederlo altrove non trova nulla.

## Perché così

- **Osservare `ion-card-content` avrebbe creato un loop** (oc:8313): ha `height:100%; overflow-y:auto`, quindi è vincolato all'altezza già imposta dall'animazione — misurarlo produrrebbe resize → animate → resize.
- **`headerHeight` va sommato a parte** (oc:8313): il `ResizeObserver` misura il contenuto, non l'host su cui si anima l'altezza.
- **Lo stato «open» resta fisso a 320px** (oc:8313), floor e tetto coincidenti: decisione esplicita in reverse-interaction. L'unico cambiamento visibile è la rimozione del `padding-bottom: 15%`, che aggravava lo spazio vuoto.
- **Le soglie di stato vanno ancorate allo stato logico, non ai pixel** (oc:8313): con «full» ora content-fit, confrontare l'altezza corrente contro `minInfoheight`/`maxInfoheight` è inaffidabile — un «full» con contenuto corto può risultare sotto le soglie pensate per distinguere «onlyTitle» da «open».
- **Il gesture è un toggle-al-tocco, non un drag proporzionale** (oc:8313): `_setGesture()` ha solo `onStart`/`onEnd`, nessun `onMove`. Il fix preserva questo meccanismo.
- **Debounce e guardia sulla gesture** (oc:8313): i resize automatici non vengono eseguiti mentre una gesture è in corso, e riprendono solo a gesture conclusa.
- **La rimozione del meccanismo di assestamento è integrale, non un isolamento** (oc:8427 → oc:8458): oc:8427 aveva introdotto `transitionend`, un debounce con fallback e un `CustomEvent('configDetailSettled')` per far assestare l'accordion prima dello scroll; oc:8458 ha cancellato tutto insieme, perché quell'unico scopo — lo scroll automatico — spariva nello stesso ciclo. Se servisse un hook «item aperto e visibile», per analytics o altro, va riscritto da zero: non c'è nulla da riattivare.
- **Nessun `fileReplacements`, nessuna eccezione per camminiditalia** (oc:8458): `wm-config-detail` non ha mai avuto personalizzazioni per-shard e non ne introduce, anche se il ticket è nato sul branch RDO.
- **Il dettaglio del POI è uscito da questo repo** (oc:8406): era un componente locale che
  assemblava i pezzi di wm-core, mentre `wm-webapp` ne aveva una seconda copia scritta a mano. La
  conseguenza misurabile è che `wm-config-detail` (oc:8181) era stato collegato qui e non sulla
  webapp. Promuovendolo in libreria il pannello ha smesso di possedere anche titolo e località,
  che prima duplicava nel proprio header.
- **Il criterio del confine non è «sta in alto», è «si comporta allo stesso modo nei due
  prodotti»** (oc:8406): titolo e località sì, pulsante di chiusura no — lì la semantica differisce
  davvero, perché nel popup della webapp azzera anche `ec_related_poi`.
- **Nessun flag `OPTIONS.*` di rollout** (oc:8458), a differenza del pattern usato per altre modifiche UX condivise: cambio di interazione minore, non abbastanza rischioso da meritare un kill switch.

## Trovato per strada

**`openPoi()` in `cypress/utils/test-utils.ts` non faceva `.scrollIntoView()`** prima di `.should('be.visible')** (oc:8458), causando fallimenti intermittenti su qualunque spec che aprisse un POI dai risultati Home. Non c'entrava con `wm-config-detail`: è emerso eseguendo davvero il nuovo test.

Il bug dello spazio bianco è stato invece **diagnosticato durante i test di oc:8305**, e non era causato da quel ticket.

## Come ci siamo arrivati

- **Titolo e località nell'header del pannello** (oc:8406, superato): stavano in
  `map.page.html`, duplicati nel chrome del popup della webapp con rese divergenti — variabili di
  tema qui, `20px` e `700` fissi là. Il difetto di quella forma è che una modifica su un lato non
  segnala nulla sull'altro: la località era sparita dalla webapp senza che build o test se ne
  accorgessero. Ora li rende `wm-poi-properties`.
- **Categoria sopra il nome** (oc:8406, superata): al suo posto c'è il comune, da
  `taxonomyWheres`. La categoria resta visibile nel corpo come chip. Deciso in call il 04/09/2026,
  non nel ticket.
- **`properties?.taxonom?.poi_types`** (oc:8406, corretto): il template leggeva `taxonom` senza la
  `y`, unica occorrenza nel repo. Il ramo plurale non ha quindi mai fatto match e la label
  arrivava sempre dal fallback su `poi_type` singolare, che il backend marca deprecato. Con
  `[key: string]: any` su `WmProperties` nemmeno `strictTemplates` lo intercettava.
