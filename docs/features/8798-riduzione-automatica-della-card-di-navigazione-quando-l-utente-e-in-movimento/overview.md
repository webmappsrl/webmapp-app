> Ticket: oc:8798

# Riduzione automatica della card di navigazione quando l'utente è in movimento

## Cosa cambia

Durante una registrazione, la plancia di `wm-track-recorder` si riduce da sola alla linguetta sul
bordo destro quando l'utente sta camminando: dopo almeno 15 secondi e almeno 20 m di spostamento
netto, misurato sui punti tenuti dalla pulizia GPS di `wm-core` e oltre l'accuratezza dichiarata
peggiore fra punto di partenza e ultimo punto. La riapertura resta manuale
(tocco sulla linguetta); se l'utente la riapre e continua a camminare, la plancia si riduce di nuovo
con la stessa regola. Ogni tocco sulla plancia aperta fa ripartire il conteggio, e in pausa la
riduzione automatica è sospesa.

Vale per tutti gli shard. Non riguarda il pannello di dettaglio della traccia né chi segue un
percorso senza registrare: la plancia esiste solo durante la registrazione.

## Perché

La plancia aperta copre parte della mappa, e chi cammina guarda soprattutto la mappa e la strada.
La riduzione manuale c'è già (plancia-registrazione-riducibile), ma richiede un gesto a ogni
apertura. Allo scrum del 19/10/2026 (proposta di G. Bonfanti, dopo la demo della plancia
riducibile) il team ha deciso di ridurla da sola quando si cammina e di lasciare la riapertura
all'utente: la riapertura automatica alla sosta è stata scartata perché il GPS riconosce la sosta
in ritardo e la posizione da fermo oscilla (obiezione di R. Garofalo).

## Requisiti

- [ ] La regola si applica solo alla plancia aperta durante una registrazione attiva. In pausa è
      sospesa con un controllo esplicito nel componente: i punti continuano a entrare nella
      registrazione anche in pausa (`_addLocationToRecording` non guarda la pausa), quindi lo
      stream non si ferma da solo.
- [ ] Il conteggio parte da un **punto di partenza**, che è: il primo punto tenuto dopo l'avvio
      della registrazione, l'apertura della plancia dalla linguetta, la ripresa dopo una pausa,
      l'ultimo tocco sulla plancia aperta. Al punto di partenza si registrano l'istante e la
      posizione (l'ultimo punto tenuto disponibile; se non ce n'è ancora, il primo che arriva).
- [ ] La posizione di confronto è l'ultimo elemento di `GeolocationService.recordedKeptLocations$`,
      che è sempre un punto «buono» (accuratezza entro `max_accuracy`): i sospetti tenuti a
      posteriori stanno prima di lui nell'elenco.
- [ ] Si considera un'emissione di `recordedKeptLocations$` solo se il suo ultimo punto è nuovo
      (ora del punto diversa dall'ultimo già visto). Il valore ricevuto all'iscrizione
      (`BehaviorSubject`, anche dopo una ripresa di registrazione salvata) fissa solo il punto di
      partenza e non fa mai ridurre la plancia; le riemissioni del ricalcolo sui parametri della
      config non contano; l'elenco vuoto si ignora.
- [ ] Ad ogni punto nuovo la plancia si riduce se sono passati almeno **15 s** dal punto di
      partenza **e** l'ultimo punto dista dalla posizione di partenza almeno **20 m** **e** più
      dell'accuratezza dichiarata (`accuracy`) peggiore fra i due punti: lo spostamento deve
      superare il margine d'errore di entrambi. All'avvio il primo punto, che fa da partenza, è
      spesso il meno preciso. Serve soprattutto sul web, dove il GPS non ha il filtro dei 10 m e arriva circa un
      punto al secondo.
- [ ] Le due soglie sono costanti con nome nel componente, non numeri sparsi.
- [ ] La riduzione automatica usa la stessa transizione di quella manuale (`minimize()`), compresa
      la dissolvenza breve con `prefers-reduced-motion`.
- [ ] La riapertura resta solo manuale: nessuna riapertura automatica quando l'utente si ferma.
- [ ] Dopo una riapertura manuale il conteggio riparte, e camminando la plancia si riduce di nuovo.
- [ ] [UX] Ogni tocco sulla plancia aperta (bottoni compresi) fa ripartire il conteggio: un
      contenuto che cambia da solo si sospende mentre l'utente ci interagisce, e un tocco non deve
      finire sulla mappa perché la plancia sta sparendo.
- [ ] [UX] In pausa la plancia resta aperta: lì c'è il bottone «riprendi», e chi è fermo vuole
      leggere i dati.
- [ ] Nessun testo nuovo visibile all'utente, quindi nessuna chiave i18n.
- [ ] Test unitari in `track-recorder.component.spec.ts` per: riduzione oltre le soglie, nessuna
      riduzione sotto una delle due, ripartenza dopo un tocco, sospensione in pausa e ripartenza
      dopo «riprendi», nuova riduzione dopo la riapertura manuale.

## Rischi

- **Riduzione da fermi con segnale scarso**, soprattutto nella PWA: sul web non c'è il filtro dei
  10 m del nativo e arriva circa un punto al secondo, e un punto «buono» può avere accuratezza fino
  a 40 m. Mitigazione: lo spostamento deve superare anche l'accuratezza peggiore fra partenza e
  ultimo punto. Non elimina il caso, lo rende raro.
- **Emissioni che non sono passi dell'utente**: `recordedKeptLocations$` è un `BehaviorSubject` e
  riemette tutto quando cambiano i parametri della pulizia GPS. Mitigazione: si confronta l'ora
  dell'ultimo punto con quella dell'ultimo già visto.
- **Correzione lenta sul nativo**: le soglie sono costanti compilate e non c'è un interruttore in
  config (scelta esplicita): correggerle o spegnere la funzione su iOS e Android richiede una
  release sugli store. Il codice resta confinato in un componente, senza dati da migrare.
- **Uscita dal background**: con l'app in background i punti continuano ad arrivare; al ritorno in
  primo piano la plancia può ridursi subito se l'utente si è spostato. È il comportamento voluto
  (sta camminando), non un difetto.
- **Utente che si ferma prima dei 15 s**: se dopo 20 m smette di camminare e non arrivano altri
  punti, la plancia resta aperta, perché la verifica avviene solo all'arrivo di un punto. È
  coerente con l'intento (è fermo).

## Out of scope

- Riduzione automatica del pannello di dettaglio della traccia o di altre card fuori dalla
  registrazione.
- Riapertura automatica alla sosta.
- Soglie configurabili per shard o un'opzione utente per disattivare il comportamento.
- Eventi PostHog sulla riduzione automatica e sulla riapertura.

## Moduli toccati

Tutto nel repo **webmapp-app** (custom); nessuna modifica ai submodule.

- `core/src/app/components/track-recorder-component/track-recorder.component.ts` — punto di
  partenza, verifica delle soglie, aggancio a `recordedKeptLocations$`, a pausa/ripresa e alla
  riapertura.
- `core/src/app/components/track-recorder-component/track-recorder.component.html` — gestore del
  tocco sulla plancia aperta.
- `core/src/app/components/track-recorder-component/track-recorder.component.spec.ts` — test.
- Usati senza modifiche: `GeolocationService.recordedKeptLocations$` (`wm-core`),
  `haversineMeters` (`wm-core`, `utils/ugc-track-stats.ts`, la stessa distanza della pulizia GPS).
- `docs/knowledge/registrazione-traccia.md` — aggiornamento a fine lavoro.
