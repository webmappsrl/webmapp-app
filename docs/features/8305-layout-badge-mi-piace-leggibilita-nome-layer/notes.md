> Ticket: oc:8305

# Notes — Redesign home-layer camminiditalia e sincronizzazione altezza (webmapp-app)

## Deviazioni dal piano

**Task 1 (`favourites-layers.component.scss`)**: il piano originale prevedeva di "aggiornare l'altezza a un nuovo valore uniforme coordinato con wm-core". In fase di scrittura del piano è emersa una soluzione migliore: rimuovere del tutto l'`height:176px` hardcoded, dato che `.wm-box` (wm-core) ha ora un'altezza fissa propria — nessun numero da tenere sincronizzato tra i due repo.

**Revisione post-review in wm-core (vedi `notes.md` del repo wm-core)**: dopo l'implementazione e la review di questo ciclo, il developer ha richiesto una revisione visiva del fix in wm-core che ha cambiato l'altezza di `.wm-box` da `220px` a `180px` e la tecnica di stacking (da `position:absolute` a CSS Grid). **Questo Task 1 non richiede nessuna azione di conseguenza**: avendo rimosso l'altezza hardcoded invece di duplicare un numero, il file resta corretto indipendentemente dal valore esatto scelto in wm-core — la scelta fatta in fase di piano si è rivelata resiliente proprio a questo tipo di cambiamento successivo.

**Task 2 (`camminiditaliadev/1.css`, redesign `home-layer`)**: componente e file completamente indipendenti dalla revisione di `wm-layer-box` in wm-core — la fascia bianca sotto la foto in `home-layer` resta un trattamento esclusivo di quella schermata, non generalizzato a `wm-layer-box` (il developer ha corretto un tentativo di generalizzazione proposto durante la sessione, confermando che deve restare isolato). **Deviazioni dal piano trovate dalla review formale:**
- Altezza foto (`.wm-img-image`): pianificata `220px`, valore reale `160px` — **confermato dal developer**: modifica diretta sua durante il test visivo live in parallelo, intenzionale, da mantenere.
- Divisore (`::before`): il piano lasciava aperta la scelta tra avvolgerlo in `:has()` o accettare il caso "senza logo" come raro. Implementata l'opzione `:has()` su richiesta esplicita del developer dopo aver visto in uno screenshot un layer senza logo con la linea arancione "orfana".
- Regola `wm-map-details wm-status-filter { display: none; }` (fondo del file, riga 73): **non scritta da Claude**, aggiunta direttamente dal developer, non correlata al ticket oc:8305 — **confermata intenzionale**, da mantenere.

## Bug trovati

Nessuno.

## Decisioni

- Rimozione (non aggiornamento) dell'altezza hardcoded in `favourites-layers.component.scss` — vedi `plan.md` → Architecture.
- **Colore del divisore**: dalla review formale, sostituito il valore hex stimato (`#f5821f`) con `var(--wm-color-primary)` — la CSS custom property è impostata a runtime da `THEME.primary_color` del `config.json` (`theme.ts`, wm-core), oggi `#ef7821` per camminiditalia (quasi identico alla stima iniziale). Resta allineato al brand anche se il colore cambia in futuro, senza bisogno di aggiornare questo file.

## Follow-up

- Promuovere `core/src/theme/camminiditaliadev/1.css` → `core/src/theme/camminiditalia/1.css` prima del merge (rinomina cartella, azione dello sviluppatore, non ancora eseguita).
- Confermare col cliente Cammini d'Italia se il troncamento a 3 righe con ellipsis (deroga introdotta in wm-core, vedi notes.md di quel repo) è accettabile, dato che il `customer_request` originale chiedeva testo sempre completamente leggibile.
- Segnalare a chi gestisce il `config.json` di camminiditalia l'override di traduzione "Sentieri"→"Tappe" (fuori scope per questo repo).
- Valutare con chi ha aperto oc:8164 se impostarlo a "testing" una volta completato e verificato tutto il lavoro di oc:8305.
