> Ticket: oc:8427

# Fix scroll e animazione doppia in wm-config-detail (accordion + modalità full)

## Cosa cambia

Quando il pannello `wm-map-details` è in stato `'full'` (schermo intero) e l'utente apre/chiude un item di `wm-config-detail`, il pannello anima la propria altezza (`AnimationController`, 250ms) innescato dal `ResizeObserver` con debounce fisso a 120ms — che scatta **durante** la transizione CSS dell'item (300ms), non dopo. Il risultato sono due animazioni sovrapposte percepite come un movimento vistoso e poco fluido ("doppio scatto"), e con l'aggiunta dello scroll automatico (bug 1, overview gemello in wm-core) il rischio è di arrivare a **tre** animazioni sovrapposte se non coordinate.

Il fix introduce un canale esplicito con `wm-config-detail`: quando il pannello riceve la notifica di un toggle (nuovo `@Output` di `wm-config-detail`, vedi overview wm-core), sa che sta per arrivare una transizione CSS nota di ~300ms e attende la sua fine (`transitionend` filtrato su `grid-template-rows`, con fallback a timeout solo su quella finestra) prima di ricalcolare/animare la propria altezza — invece di affidarsi al debounce generico del `ResizeObserver`, che resta invariato per tutti gli altri resize (immagini, contenuto dinamico). Lo scroll automatico (bug 1) viene poi eseguito **dopo** che questa sequenza è conclusa, non in parallelo.

## Perché

Segnalato dal developer con registrazione schermo: in modalità full, l'apertura di un box informativo produce un movimento del pannello percepibile come "fastidioso". Il meccanismo era già noto e documentato come trade-off accettato in oc:8181 ("~420ms assestamento atteso"), ma il developer lo giudica ora un difetto UX da correggere, non un edge case. La Fase: challenge ha inoltre evidenziato che risolvere questo bug isolatamente, senza coordinarlo con il fix dello scroll (bug 1), rischiava di introdurre un problema peggiore (tripla animazione).

## Requisiti

- [ ] `wm-map-details` si iscrive al nuovo `@Output()` di toggle di `wm-config-detail` (apertura e chiusura). Alla ricezione, se lo stato corrente è `'full'`, sospende il comportamento di resize "generico" (debounce `ResizeObserver`) per quella specifica transizione e attende invece la fine della transizione CSS nota (`transitionend` con `event.propertyName === 'grid-template-rows'`, con fallback a timeout ~300ms+margine se l'evento non arriva — es. transizione interrotta da un secondo toggle rapido, caso non raro per specifica CSS).
- [ ] Un secondo toggle ricevuto mentre la sequenza di attesa precedente è ancora in corso **resetta** la finestra di attesa (nessun timer orfano, nessuna esecuzione su stato stale).
- [ ] Dopo che il resize del pannello (se necessario) è concluso, viene eseguito lo scroll automatico (bug 1) — mai in parallelo con l'animazione di resize. In stato `'open'` (nessun resize, floor=ceiling=320px) lo scroll può avvenire subito dopo la fine della transizione CSS dell'item, senza attendere altro.
- [ ] Per **tutti gli altri resize** non annunciati da un toggle (immagini che caricano in ritardo, altro contenuto dinamico), il comportamento resta quello attuale (`ResizeObserver` + debounce 120ms) — nessuna regressione di latenza percepita su questi casi.
- [ ] Nessuna regressione sui 3 fix già presenti da oc:8313 (galleria immagini `_isGalleryContentActive()`, gesture da stato `'background'`, selettori CSS `geohub/75.css`).
- [ ] Verifica manuale su device reale (iOS/Android via Capacitor) del comportamento combinato (transizione item + resize pannello + scroll) in modalità full, non solo su browser desktop.

## Rischi

- **`transitionend` non scatta se la transizione viene interrotta** (per specifica CSS, non solo "a volte") — mitigato dal fallback a timeout scoped alla singola finestra di attesa, resettato ad ogni nuovo toggle.
- **Filtraggio della proprietà CSS corretta**: `wm-config-detail` ha altre transizioni più brevi nello stesso sottoalbero (`border-color 0.2s`, `transform 0.2s` sul chevron) — il listener deve filtrare esplicitamente su `event.propertyName === 'grid-template-rows'` per non agganciarsi alla transizione sbagliata (che finirebbe prima, riproducendo il bug con un offset diverso).
- **Cambio di layer/POI con item aperto**: il setter `groups` di `wm-config-detail` resetta `_openItem = null` in modo sincrono, senza transizione CSS (il sottoalbero viene ricreato di scatto, non transizionato) — questo caso **non** deve attivare l'attesa `transitionend`/timeout (nessun toggle viene emesso in questo scenario, dato che non passa da `toggle()`), quindi resta gestito dal `ResizeObserver` generico come oggi. Va verificato esplicitamente in fase di implementazione che il reset del setter non emetta comunque l'`@Output` di toggle.
- **Rischio di regressione sul fix oc:8313** (galleria immagini, gesture `'background'`): qualunque modifica a `_applyContentResize()`/`_applyHeightForStatus()` tocca codice già "instabile" (3 bug trovati in review formale nel ciclo precedente) — richiede gli stessi unit test esistenti (`map-details.component.spec.ts`) a garanzia, più nuovi test per la sequenza toggle→transitionend→resize→scroll.
- **Costanti duplicate cross-repo** (300ms CSS in wm-core, debounce 120ms e timeout fallback qui): nessuna fonte di verità unica automatica — mitigato con un commento esplicito nel codice che referenzia file/riga dell'altro repo, non con una costante condivisa (sproporzionato per questo bug fix).

## Out of scope

- Estensione dello stesso fix a "Mostra altro"/"Mostra meno" di `wm-config-detail` — quei due pulsanti cambiano l'altezza istantaneamente (nessuna transizione CSS da attendere), quindi il `ResizeObserver` scatta una volta sola senza sovrapposizioni: non presentano lo stesso sintomo (confermato in Fase: reverse-interaction, risposta "best practice" del developer).
- `prefers-reduced-motion` per lo scroll automatico introdotto lato `wm-config-detail` (vedi overview wm-core) — fuori scope qui, debito accettato esplicitamente dal developer.
- Debito tecnico noto e non affrontato in oc:8313 (incoerenza `prefers-reduced-motion` tra resize automatico e transizioni manuali, tetto massimo non ricalcolato alla rotazione device) — non riaperto in questo ciclo.
- Introduzione di una costante/contratto condiviso cross-repo per le durate di animazione — mitigato con commenti espliciti, non con codice condiviso.

## Moduli toccati

- `core/src/app/components/poi-properties/poi-properties.component.ts`/`.html` — pass-through: nuovo `@Output() configDetailToggled` che inoltra l'evento di `wm-config-detail` verso `map.page.html` (stesso pattern di `home-layer`/`track-properties` in wm-core, necessario perché `wm-config-detail` è annidato nel suo template).
- `core/src/app/pages/map/map.page.html` — binda `(configDetailToggled)` di `wm-home-layer`, `wm-poi-properties`, `wm-track-properties` (tutti e tre montati come contenuto proiettato di `wm-map-details`) verso un nuovo metodo pubblico di `MapDetailsComponent` (via `@ViewChild('details') mapDetailsCmp`, già presente in `map.page.ts`).
- `core/src/app/pages/map/map-details/map-details.component.ts` — nuovo metodo pubblico `onProjectedContentToggle(event: ConfigDetailToggleEvent)` (import tipo da `@wm-types/config`): in stato `'full'` sospende il resize "generico" e attende la fine della transizione CSS nota (`transitionend` su `grid-template-rows` + fallback a timeout, reset su toggle successivo) prima di ridimensionare e poi scrollare; in stato `'open'` esegue lo scroll subito dopo la fine della transizione CSS, senza resize. Il `ResizeObserver`/debounce esistente resta invariato per resize non annunciati da un toggle.
- `core/src/app/pages/map/map-details/map-details.component.spec.ts` — nuovi test per: sequenza toggle→transitionend→resize→scroll, reset su doppio toggle rapido, nessuna regressione sui 3 fix di oc:8313, nessun impatto sul `ResizeObserver` generico per resize non annunciati.
- `core/src/app/shared/wm-types/src/config.ts` — nuovo tipo condiviso `ConfigDetailToggleEvent`, vedi overview wm-types.
- `core/src/app/shared/wm-core/.../config-detail/...`, `home-layer/...`, `track-properties/...`, `home.component.*` — repo submodule wm-core, vedi overview separato (nuovo `@Output()` di toggle e pass-through, bug 1).
