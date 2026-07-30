> Ticket: oc:8313

# wm-map-details lascia spazio bianco in fondo al pannello di dettaglio

## Cosa cambia

`wm-map-details` (`core/src/app/pages/map/map-details/map-details.component.ts`) oggi anima l'altezza dell'host a valori fissi in px indipendenti dal contenuto reale proiettato via `<ng-content>`: 320px in stato "open", quasi-fullscreen (`calc((height-200)px - safe-area-inset-top)`) in stato "full". Quando il contenuto (foto, testo, POI properties) è più corto del valore imposto, resta uno spazio bianco vuoto in fondo al pannello, aggravato dal `padding-bottom: 15%` su `ion-card` (`map-details.component.scss` riga 53).

Il fix introduce una misurazione dinamica dell'altezza del contenuto reale e calcola l'altezza target del pannello di conseguenza:

- **Elemento osservato:** il `ResizeObserver` osserva un wrapper interno **senza** `height: 100%`/`overflow` forzati, che assume l'altezza naturale del contenuto proiettato via `<ng-content>` — **non** `ion-card-content` (che oggi ha `height: 100%; overflow-y: auto`, vincolato all'altezza già imposta dall'animazione: osservarlo direttamente creerebbe un loop resize→animate→resize). Il contenitore scrollabile esterno resta `height: 100%; overflow-y: auto` come oggi.
- **Formula del target:** `min(max(contentHeight + headerHeight, 320), tettoMassimoStato)`, dove `contentHeight` è il valore misurato dal `ResizeObserver` sul wrapper e `headerHeight` è l'altezza reale di `ion-card-header` (drag handle + eventuale `[header]` proiettato, letta via `offsetHeight`) — necessaria perché il `ResizeObserver` misura solo il contenuto, non l'host intero su cui viene animata l'altezza.
- **Stato "open":** floor e tetto massimo coincidono (320px) — per decisione esplicita presa in Fase: reverse-interaction, il pannello resta sempre a 320px in questo stato (comportamento identico a oggi), sia con contenuto più corto (nessun ulteriore restringimento oltre il minimo) sia più lungo (scroll interno). L'unico cambiamento visibile per "open" è la rimozione del `padding-bottom: 15%`.
- **Stato "full":** stesso principio — il pannello non forza più un'altezza quasi-fullscreen quando il contenuto è più corto, restringendosi al contenuto reale entro il tetto massimo attuale (`height - 200px - safe-area-inset-top`).
- Il `ResizeObserver` resta attivo per tutta la durata dell'apertura del pannello (non solo alla transizione di stato), così che variazioni di altezza del contenuto a pannello già aperto (immagini caricate in ritardo, navigazione tra POI collegati via `wm-related-pois-navigator`) ridimensionino il pannello di conseguenza.
- **Guardia gesture + debounce:** le chiamate di resize automatico generate dal `ResizeObserver` sono debounced (~100-150ms) e non vengono eseguite mentre una gesture di trascinamento è in corso — riprendono solo a gesture conclusa. Questo evita sia il conflitto percepito tra due sorgenti di cambio-altezza contemporanee, sia la race condition tecnica descritta sotto (vedi "Rischi").
- **Soglie di stato ancorate allo stato logico, non all'altezza in pixel:** `toggle()` e `_setGesture()` oggi decidono lo stato successivo confrontando `_getCurrentHeight()` (pixel) contro `minInfoheight`/`maxInfoheight`. Con "full" ora content-fit, questi confronti diventano inaffidabili (un "full" con contenuto corto può risultare vicino o sotto le soglie pensate per distinguere "onlyTitle" da "open"/"full"). La logica va ancorata allo stato corrente tracciato esplicitamente (`mapDetailsStatus` dello store / proprietà del componente) invece di essere re-inferita dall'altezza pixel corrente.
- **Terminologia:** il meccanismo esistente (`_setGesture()`, righe 152-174) non è un trascinamento continuo proporzionale al dito — ha solo `onStart`/`onEnd`, nessun `onMove` — è un **toggle-al-tocco**: decide lo stato in base all'altezza corrente nel momento in cui parte il gesture. Il fix preserva questo meccanismo, non introduce un drag proporzionale.
- L'animazione continua a usare `AnimationController` con valori numerici espliciti (`.fromTo('height', from, to)`) calcolati dinamicamente — non si passa a `height: auto`/CSS-only — per preservare intatto questo meccanismo di toggle.
- Rimosso il `padding-bottom: 15%` su `ion-card` (`map-details.component.scss` riga 53), che oggi aggrava lo spazio vuoto residuo.

## Perché

Diagnosticato durante i test di oc:8305 (redesign home-layer camminiditalia) — non causato da quel ticket. Il bug è visibile ogni volta che si apre un cammino/POI con contenuto sintetico (poche righe di descrizione, nessuna galleria immagini lunga): il pannello mostra una fascia bianca vuota che comunica un'interfaccia "rotta" o incompleta all'utente finale.

## Requisiti

- [ ] In stato "open", il pannello resta sempre a 320px (floor == tetto massimo, per decisione esplicita — vedi "Cosa cambia"); l'unico cambiamento è la rimozione del `padding-bottom: 15%` che aggravava lo spazio vuoto residuo oltre i 320px
- [ ] In stato "open", con contenuto più alto di 320px il pannello resta fermo a 320px con scroll interno (comportamento invariato)
- [ ] In stato "full", stesso principio: nessuno spazio bianco forzato quando il contenuto è più corto del tetto massimo attuale
- [ ] Rimosso `padding-bottom: 15%` da `ion-card`
- [ ] Il `ResizeObserver` osserva un elemento interno non vincolato all'altezza del pannello (non `ion-card-content`), per evitare un loop di resize
- [ ] Il calcolo del target include esplicitamente `headerHeight` (`offsetHeight` di `ion-card-header`), non solo l'altezza del contenuto misurata
- [ ] Il ridimensionamento resta "vivo" per tutta la durata dell'apertura del pannello via `ResizeObserver` — non solo al cambio di stato open/full
- [ ] Le chiamate di resize automatico sono debounced (~100-150ms) e sospese mentre una gesture è in corso, riprendendo solo a gesture conclusa
- [ ] Le soglie di `toggle()`/`_setGesture()` per decidere lo stato successivo sono ancorate allo stato logico corrente (store/proprietà componente), non re-inferite da `_getCurrentHeight()` in pixel
- [ ] `[UX]` Se `prefers-reduced-motion` è attivo, il ridimensionamento automatico del contenuto avviene senza transizione animata (snap immediato) invece della normale animazione di ~250ms (`DETAILS_ANIMATION_DURATION`) — le transizioni di stato manuali (tap open/full/onlyTitle) restano invariate, vedi "Out of scope"
- [ ] `[UX]` Il resize automatico usa la stessa durata/easing dell'animazione esistente quando la transizione è animata (coerenza visiva, nessun salto brusco)
- [ ] Test unitari (Karma/Jasmine) per la funzione pura di calcolo dell'altezza target (dato `contentHeight`, `headerHeight`, stato e tetto massimo → altezza attesa) e per la logica delle soglie di stato con altezze content-fit simulate

## Rischi

- **Loop di `ResizeObserver`:** se l'elemento osservato fosse vincolato all'altezza già imposta dal pannello (es. `ion-card-content` con `height: 100%`), ogni resize triggerebbe un nuovo resize in un ciclo (`ResizeObserver loop limit exceeded`), visibile come un pannello che vibra/flickera in altezza. Mitigazione: osservare un wrapper interno non vincolato, distinto dal contenitore scrollabile esterno (vedi "Cosa cambia").
- **Race condition tra resize automatico e gesture manuale:** `setAnimations()` fa `this._animationSwipe?.destroy()` e ricrea/riproduce l'animazione in modo asincrono. Chiamate ravvicinate (resize automatico + gesture) rischiano di distruggersi a vicenda o di lasciare `_animationSwipe` in uno stato inatteso mentre `endAnimation()` (invocato dal gesture) tenta ancora di usarlo. Mitigazione: debounce + guardia esplicita su gesture attiva (vedi "Cosa cambia").
- **Collisione di soglie di stato:** con "full" content-fit, un contenuto corto può produrre un'altezza vicina alle soglie usate da `toggle()`/`_setGesture()` per distinguere "onlyTitle" da "open"/"full", rischiando transizioni di stato indesiderate su tap. Mitigazione: soglie ancorate allo stato logico, non all'altezza pixel (vedi "Cosa cambia").
- **`[UX]` Animare `height` (non `transform`) è un pattern esistente non ideale per le performance (repaint) — non introdotto da questo fix, ma il `ResizeObserver` potrebbe far scattare resize più frequenti su contenuti con propri cambiamenti interni (es. gallery immagini), amplificando il rischio di jank percepito su device di fascia bassa. Non affrontato in questo ciclo (debito tecnico preesistente).
- **Timing della misurazione iniziale:** al primo render il contenuto proiettato (`wm-poi-properties`, `wm-image-detail`) potrebbe non avere ancora l'altezza finale (immagini non ancora caricate) — il `ResizeObserver` mitiga il rischio rispetto a una misurazione one-shot, ma la primissima animazione di apertura potrebbe partire da un valore sottostimato e correggersi poco dopo.
- **Assenza di test automatici end-to-end per la nuova logica** (oltre agli unit test sulla funzione pura di calcolo): timing, soglie e race condition sono la classe di bug più difficile da individuare con verifica manuale superficiale — mitigato parzialmente dagli unit test richiesti sopra, ma il comportamento `ResizeObserver` reale resta verificato solo manualmente.

## Out of scope

- Nessuna modifica al comportamento degli stati "background" e "onlyTitle" (non coinvolti dal bug)
- Nessuna modifica al meccanismo di toggle-al-tocco in sé, solo ai valori target su cui opera
- Nessuna generalizzazione del pattern ad altri bottom-sheet dell'app — fix scoped a `wm-map-details`
- Nessuna introduzione di nuovi testi traducibili (fix di layout/CSS puro)
- **Incoerenza nota su `prefers-reduced-motion`:** applicato solo al resize automatico, non alle transizioni di stato manuali (tap su open/full/onlyTitle, che restano sempre animate a 250ms) — incoerenza preesistente all'accessibilità del componente, non risolta in questo ciclo
- **Rotazione del device a pannello aperto:** se l'utente ruota lo schermo mentre il pannello è in stato "full" con altezza content-fit già calcolata, il tetto massimo resta calcolato sulla vecchia orientazione finché non avviene un nuovo cambio di stato esplicito — non gestito in questo ciclo (debito tecnico noto, app principalmente verticale)

## Moduli toccati

- `core/src/app/pages/map/map-details/map-details.component.ts` — logica di misurazione (`ResizeObserver` su wrapper dedicato), calcolo altezza dinamica (`contentHeight + headerHeight`, min/max), debounce + guardia gesture, soglie di stato ancorate allo stato logico
- `core/src/app/pages/map/map-details/map-details.component.scss` — rimozione `padding-bottom: 15%` su `ion-card`
- `core/src/app/pages/map/map-details/map-details.component.html` — wrapper dedicato (`#contentWrapper`/`#cardHeader`) attorno a `<ng-content>`/header per il `ResizeObserver` e la misura dell'header
- `core/src/app/pages/map/map-details/map-details-height.util.ts` (nuovo) — funzione pura `computeTargetHeight()`
- `core/src/app/pages/map/map-details/map-details-height.util.spec.ts` (nuovo) — unit test della funzione pura
- `core/src/app/pages/map/map-details/map-details.component.spec.ts` (nuovo) — unit test per soglie di stato, guardia gesture e resize
- `core/src/app/constants/map.ts` — nuova costante `MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS`
- `core/angular.json`, `core/tsconfig.spec.json` — inclusione di `src/app/pages/map/map-details` nello scope dei test di CI (stesso pattern di oc:8023/oc:8176)
- `core/src/theme/geohub/75.css` — fix emerso da review formale: 4 selettori `:has(> wm-X)` corretti in `:has(wm-X)` (nessun `>`), rotti dal nuovo `.wm-content-wrapper` che rendeva i componenti proiettati nipoti invece di figli diretti di `ion-card-content`. Dettagli in `notes.md`
