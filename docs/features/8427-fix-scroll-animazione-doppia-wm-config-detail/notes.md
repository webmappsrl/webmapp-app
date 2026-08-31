> Ticket: oc:8427

# Note — deviazioni dal piano e correzioni post-review

## Architettura shippata vs `plan.md`/`overview.md`

L'implementazione finale diverge in modo sostanziale dal piano originale, per due redesign successivi decisi in corso d'opera con il developer (non registrati qui fino a questa nota, trovato in `wm-skills:wm-review-ticket`):

1. **Nessun `@Output()` Angular con pass-through**: il piano prevedeva `wm-map-details` iscritto a un `@Output()` di `wm-config-detail`, propagato attraverso `wm-home-layer`/`wm-track-properties`/`wm-poi-properties` (Task 2/3 del plan, mai eseguiti — questi tre file sono rimasti invariati). L'implementazione reale usa un `CustomEvent('configDetailSettled')` nativo (`bubbles: true, composed: true`) dispacciato da `wm-config-detail` stesso: attraversa il DOM proiettato senza bisogno di pass-through nei componenti intermedi. Un solo binding, su `wm-map-details` in `map.page.html`, copre tutti e 3 i consumer.
2. **`ResizeObserver` rimosso interamente, non sospeso durante la finestra di transizione**: il piano (Requisito 4) chiedeva di preservare il resize automatico "generico" per contenuto che cambia dimensione senza un toggle esplicito (immagini in ritardo, dati asincroni). Dopo un ulteriore giro di test manuale del developer ("una volta full deve avere sempre la stessa dimensione"), il resize automatico su cambio contenuto proiettato è stato **eliminato del tutto**: una volta raggiunto `'open'`/`'full'`, l'altezza del pannello resta quella calcolata all'ingresso finché non si cambia esplicitamente stato. Rischio noto e accettato: un contenuto che cambia altezza *dopo* l'ingresso in quello stato (es. dati async che arrivano in ritardo) non farà più ridimensionare il pannello fino al prossimo cambio di stato esplicito.
3. **`scrollIntoView({block: 'nearest'})` invece di `{block: 'start'}`**, e solo se l'header non è già interamente visibile (`_isFullyInView()`, non presente nel piano originale) — per evitare uno scroll percepito come superfluo quando l'item è già in vista.

## Bug reale trovato e corretto in `wm-review-ticket` (bloccante)

**Deadlock permanente di `_resizeChain`** in `map-details.component.ts`: `background()`/`onlyTitle()` chiamavano `setAnimations()` direttamente, fuori dalla coda di serializzazione introdotta per `open()`/`full()`. Se una di queste due veniva invocata mentre un resize `open()`/`full()` era ancora in animazione (finestra di 250ms, tutt'altro che rara — es. l'utente chiude il pannello subito dopo averlo aperto), `setAnimations()` chiamava `Animation.destroy()` sull'animazione ancora `.play()`-ata altrove. Verificato nel sorgente Ionic: `destroy()` non chiama mai `stop()`, quindi la Promise di quel `play()` restava pendente per sempre — la catena di resize (`_resizeChain`) si bloccava, e ogni `open()`/`full()` successivo per il resto della sessione non calcolava più l'altezza content-fit.

Fix: estratto `_enqueueAnimation()`, usato ora da **tutte e quattro** le transizioni di altezza (`open`/`full`/`background`/`onlyTitle`), così nessuna chiamata a `setAnimations()` avviene mai fuori dalla stessa catena serializzata. Aggiunto anche un `.catch()` sulla catena (mancante prima): un errore imprevisto in una singola animazione non "avvelena" più la coda per il resto della sessione.

## Altri cleanup applicati nella stessa sessione di review

- Costante morta `MAP_DETAILS_CONTENT_RESIZE_DEBOUNCE_MS` (`core/src/app/constants/map.ts`) rimossa — il `ResizeObserver` che la consumava non esiste più (vedi punto 2 sopra).
- `_gestureActive` (write-only, nessun consumer residuo) e `_prefersReducedMotion()` (dead code dopo la rimozione del resize automatico) rimossi da `map-details.component.ts`.
- `MapDetailsComponent` implementa di nuovo `OnDestroy` (rimosso per errore nel redesign precedente): le due subscription attivate in `ngAfterViewInit()` (`_featureOpened$`, `mapDetailsStatus`) sono ora raccolte in una `Subscription` e disiscritte alla distruzione.
- Rinominato `onProjectedContentToggle` → `onConfigDetailSettled` (e l'equivalente in wm-core, `onConfigDetailToggled` → `onConfigDetailSettled`) per coerenza di naming tra i due consumer dello stesso evento.

Dettagli tecnici sul fix del deadlock, sui cleanup lato `wm-config-detail` (filtro `transitionend` su `target`, guardia `showLess()`) e sui test aggiunti: vedi `notes.md` gemello in `core/src/app/shared/wm-core/docs/features/8427-.../notes.md`.
