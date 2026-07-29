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
- **Colore del divisore — decisione cambiata dopo il commit/PR iniziale**: la review formale aveva sostituito il valore hex stimato (`#f5821f`) con `var(--wm-color-primary)` per restare allineati al brand automaticamente. Il developer ha poi cambiato idea: **tornato a un valore hardcoded** (`#ef7821`, il valore reale di `THEME.primary_color` per camminiditalia) — motivazione: questo file carica solo per camminiditalia (nessun altro shard lo riusa), quindi l'indirezione tramite la variabile del tema non aggiunge flessibilità reale in questo caso specifico. Applicato in sincronia su entrambe le copie (`camminiditalia/1.css` e `camminiditaliadev/1.css`, tenute identiche per tutta la sessione).

## Follow-up

- Confermare col cliente Cammini d'Italia se il troncamento a 3 righe con ellipsis (deroga introdotta in wm-core, vedi notes.md di quel repo) è accettabile, dato che il `customer_request` originale chiedeva testo sempre completamente leggibile.
- Segnalare a chi gestisce il `config.json` di camminiditalia l'override di traduzione "Sentieri"→"Tappe" (fuori scope per questo repo).
- Valutare con chi ha aperto oc:8164 se impostarlo a "testing" una volta completato e verificato tutto il lavoro di oc:8305.
