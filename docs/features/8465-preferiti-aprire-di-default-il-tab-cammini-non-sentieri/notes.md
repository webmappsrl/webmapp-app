> Ticket: oc:8465

# Notes — Preferiti: aprire di default il tab Cammini (layer), non Sentieri

## Deviazioni dal piano

L'implementazione iniziale (Task 1 del piano approvato) è stata scritta esattamente come pianificato: gate su `isConfLoaded` + `filter`/`take(1)`/`switchMap` verso `showLayersSegment$`. La review formale (`wm-skills:wm-review-ticket`, 5 finder paralleli) ha trovato 3 bug di correttezza reali in quel design, non emersi né in Fase: challenge né nei test pianificati:

1. **Stale-cache double emission**: `getConf()` emette due volte (`handleApiCache`: cache, poi fetch fresca) e `isConfLoaded` è un latch che diventa `true` alla prima emissione (spesso la cache) e non torna più `false`. Il `take(1)` sul gate catturava quindi il valore di `showLayersSegment$` nell'istante della cache stale, non della config fresca — riproducendo lo stesso bug del ticket per una sessione, al primo avvio dopo che un backend abilita il flag.
2. **Override della scelta manuale**: se l'utente toccava "Sentieri" prima che la config finisse di caricare, la subscription pendente scriveva comunque `selectedSegment` non appena risolveva, sovrascrivendo la scelta.
3. **Vicolo cieco su flag true→false**: se `showFavorites` passava da `true` a `false` dopo che il default era già stato risolto a `'layers'`, lo switch spariva (`*ngIf`) senza modo di tornare a "Sentieri" — bug preesistente nel componente, reso raggiungibile con zero interazione dal nuovo default.

**Redesign applicato** (`core/src/app/pages/favourites/favourites.page.ts`): eliminato il gate `isConfLoaded` (rivelatosi ridondante — `showLayersSegment$` è già `false` finché la config reale non arriva, per costruzione del reducer wm-core, `OPTIONS` iniziale senza `showFavorites`). Sostituito con una sottoscrizione continua a `showLayersSegment$` (non più `take(1)`), guardata da un flag `_userSelectedSegmentManually` (settato in `onSegmentChange()`) che disabilita il sync automatico una volta che l'utente ha scelto un tab. Aggiunto `OnDestroy`/`Subject`/`takeUntil` per il teardown esplicito della subscription (pattern già in uso nel repo, es. `track-recorder.component.ts`, `modal-success.component.ts`), assente nella prima versione.

Il test unitario è stato riscritto di conseguenza: da 5 a 7 casi, con `BehaviorSubject` al posto di `of()` per poter simulare emissioni multiple nel tempo (doppia emissione cache+fresh, cambio flag dopo l'interazione utente). Il doppio mock per-ordine-di-chiamata (`isConfLoaded` + `confOPTIONSShowFavorites`) non serve più: un solo selettore viene letto da `store.select()`.

## Bug trovati

Vedi sopra (Deviazioni dal piano) — i 3 bug sono stati trovati dalla review formale, non durante l'implementazione o l'esecuzione dei test pianificati, che passavano tutti (5/5) anche con l'implementazione poi rivelatasi difettosa. Nessuno dei 3 era coperto dai test originali (tutti scritti con `of()`, che completa a singola emissione — non poteva esercitare transizioni multiple nel tempo).

## Decisioni

- **Il residuo "cambio del flag durante l'uso della tab tracks già aperta" resta un rischio accettato, non eliminato**: se l'utente sta scorrendo la lista tracce (mai su "layers") e il flag passa da `false` a `true` a metà sessione (es. riconnessione con `HomePage.online$` → nuovo `loadConf()`), il sync continuo lo sposterebbe comunque su "Cammini" perdendo la posizione di scroll — perché il guard `_userSelectedSegmentManually` si attiva solo su un tap esplicito sullo switch, non sul semplice uso del contenuto. Scenario giudicato a probabilità molto bassa (richiede un cambio di configurazione del flag a sessione già avviata, non solo al primo caricamento) e a basso impatto (nessuna perdita di dati, solo cambio di vista) — non mitigato in questo ciclo per non introdurre un concetto aggiuntivo ("utente ha interagito col contenuto", non solo "ha scelto un tab").
- **`doRefresh()` continua a essere chiamato indipendentemente dal segmento risolto** (spreco di rete quando il default finale è `'layers'`): comportamento preesistente, esplicitamente fuori scope già in `overview.md`, confermato tale anche dopo la review (segnalato come cleanup da più finder, non affrontato).
- **Verifica e2e (`favourites.cy.ts`)**: eseguita realmente (non solo letta staticamente) sia sul codice con il fix sia, per isolamento, sul codice pre-fix (via `git stash`) — fallisce identicamente in entrambi i casi (4/4 test rossi), quindi il fallimento non è una regressione di questo ticket. La review formale ha poi identificato la causa più precisa: lo shard servito in locale (camminiditalia, dedotto dagli screenshot Cypress) non corrisponde all'`appId`/conf (`52.json`, shard `geohub`) che gli spec `app_52` intercettano — mismatch di configurazione ambientale, non del codice applicativo. Non corretto in questo ciclo (fuori scope, riguarda l'ambiente di test locale, non il fix).
- **`core/src/environments/environment.ts` risulta modificato nel working tree ma non è farina di questo ticket**: era già `M` all'inizio della sessione (lavoro non correlato del developer). Non toccato, non incluso nei commit di questo ticket.

## Follow-up

- Il pattern "attendi che la config sia pronta prima di leggere un `confOPTIONS*`" è ora duplicato in almeno 3-4 punti del repo (`app.component.ts` ×2, `wm-core.module.ts`) con piccole varianti — un helper/operatore condiviso in wm-core (es. `whenConfReady()`) eviterebbe la ripetizione, ma non è stato estratto in questo ciclo (cambio trasversale, fuori scope per un bug fix mirato).
- Nessun requisito dell'overview è stato riclassificato in corso d'opera: la review ha corretto la *qualità dell'implementazione* di un requisito già chiaro ("default corretto, guardato su showFavorites"), non ha scoperto un requisito nuovo o mal interpretato.
