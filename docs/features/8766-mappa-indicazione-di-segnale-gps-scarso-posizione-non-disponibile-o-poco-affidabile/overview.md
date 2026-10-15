> Ticket: oc:8766

# Mappa: indicazione di segnale GPS scarso, posizione non disponibile o poco affidabile

## Cosa cambia

Sulla mappa dell'app l'utente viene informato dello stato del GPS, che oggi è invisibile:

- **in attesa della prima posizione**: il bottone della posizione pulsa; se dopo circa 8 secondi la
  posizione non è ancora arrivata compare un piccolo avviso «Ricerca del segnale GPS…», che sparisce
  all'arrivo del pallino;
- **segnale scarso** (posizione arrivata ma imprecisa): compare un piccolo avviso in alto, sotto la
  barra di stato, che con un'animazione si rimpicciolisce in un pallino e vola fino al bottone della
  posizione, dove resta come badge; dopo 15 secondi di segnale di nuovo buono il badge diventa verde
  per 5 secondi e poi sparisce;
- **permesso negato o localizzazione spenta**: un avviso che resta finché l'utente non lo chiude,
  con il bottone «Apri impostazioni» quando le impostazioni dell'app possono risolvere il problema.

Lo stato del GPS nasce in `wm-core` (`GeolocationService`), l'interfaccia vive solo nell'app. Vale
per tutte le istanze dell'app, non solo per camminiditalia. Nella webapp non compare nessun
avviso: il servizio condiviso calcola lo stato, ma nessuno lo legge. Cambia però il watcher web,
che è condiviso: ora usa sempre l'alta precisione anche in navigazione (primo fix più lento al
chiuso, un po' più di batteria sui browser mobile) e non si duplica più.

## Perché

Il pallino blu a volte tarda a comparire senza nessuna spiegazione e gli utenti lo segnalano come
bug. Davide Nanna (Cammini d'Italia) l'ha chiesto nella call del 12/10/2026 («se si riuscisse a
mettere anche un qualcosa tipo quando non prende il pallino, tipo in attesa di GPS»); Giuseppe ha
condizionato il lavoro al fatto che riduca le richieste di assistenza.

Oggi il codice non ha nessuna informazione sullo stato del GPS da mostrare: il watcher nativo
scarta gli errori (`geolocation.service.ts:284`, `if (error) return;`), quello web ha la callback
d'errore vuota (riga 314) e nessun timeout. Il plugin però già segnala il permesso negato e, su
Android, la localizzazione spenta (`NOT_AUTHORIZED`), e ogni posizione porta la sua `accuracy`: le
informazioni ci sono, vanno solo lette. Non si chiede nulla in più al GPS, quindi nessun costo di
batteria.

## Requisiti

### Stato del GPS (wm-core)

- [ ] `GeolocationService` espone uno stato del GPS come observable, accanto a `onLocationChange$`,
      con i valori: in attesa (`searching`), buono (`ok`), scarso (`poor`), permesso negato
      (`denied`), localizzazione spenta (`disabled`), watcher fermo (`off`)
- [ ] Lo stato è `searching` all'avvio del watcher, passa a `ok` al primo fix (`poor` richiede due
      fix di fila), e torna
      `off` ogni volta che il watcher viene fermato (`stopAll()`, background fuori dalla
      registrazione)
- [ ] **Isteresi sullo stato scarso:** entra in `poor` quando l'`accuracy` supera **50 m** per
      **due fix di fila**; ne esce solo dopo **15 secondi** con `accuracy` **sotto i 30 m**, misurati
      con un timer che parte al primo fix buono e si azzera a ogni fix sopra i 30 m. Fra 30 e 50 m lo
      stato non cambia
- [ ] Il timer d'uscita scade anche se non arrivano altri fix: con `distanceFilter` a 10 m chi sta
      fermo non riceve aggiornamenti, e l'assenza di aggiornamenti non va interpretata come segnale
      perso
- [ ] La logica degli stati è una **funzione pura** (posizione o errore + stato attuale → nuovo
      stato); il servizio la chiama dentro un `try/catch`, così un suo errore non può mai bloccare
      `_onLocationUpdate` né `_addLocationToRecording`
- [ ] **Errori nativi:** solo `NOT_AUTHORIZED` cambia lo stato — con messaggio
      `Location services disabled.` (solo Android) → `disabled`, altrimenti → `denied`. Gli errori
      senza codice vengono ignorati e lo stato resta quello di prima
- [ ] **Errori web:** `PERMISSION_DENIED` → `denied`, `POSITION_UNAVAILABLE` → `disabled`;
      `TIMEOUT` lascia lo stato com'è
- [ ] **Watcher web:** prima di aprirne uno nuovo si chiude il precedente (`clearWatch`), che oggi
      non viene mai chiuso; `enableHighAccuracy` è `true` anche in navigazione, come fa già il
      nativo
- [ ] Quando l'utente torna dalle impostazioni avendo concesso il permesso o acceso la
      localizzazione, la posizione riparte e lo stato torna `searching`
- [ ] Le soglie (50 m, 30 m, 2 fix, 15 s) sono costanti, non configurabili da `config.json`
- [ ] `stale: false` resta com'è: una posizione vecchia non deve mai comparire come attuale né
      finire in una traccia registrata
- [ ] Posizioni e registrazione non cambiano: lo stato si aggiunge, non filtra né ritarda le
      posizioni

### Interfaccia (webmapp-app)

- [ ] [UX] Mentre lo stato è `searching`, il bottone della posizione (`locate-outline` in
      `map.page.html`) pulsa
- [ ] [UX] Dopo circa 8 secondi di `searching` compare un avviso breve «Ricerca del segnale GPS…»
      con un suggerimento (all'aperto e lontano dagli edifici è più rapido), che sparisce all'arrivo
      del primo fix. Compare **al massimo una volta per avvio dell'app**: ai ritorni successivi
      nell'app resta solo la pulsazione. Si può chiudere con «Chiudi»
- [ ] [UX] All'inizio di un episodio di `poor` compare un piccolo avviso **in alto, sotto la barra
      di stato**, che non copre il pallino quando la mappa è centrata sulla posizione: «Segnale GPS
      debole: la posizione potrebbe essere imprecisa», seguito dal consiglio «Se succede spesso,
      controlla che "Posizione esatta" sia attiva nelle impostazioni dell'app». Dopo qualche secondo
      si rimpicciolisce in un pallino e vola fino al bottone della posizione, dove resta come badge
- [ ] [UX] L'avviso compare **una volta per episodio**: finché il badge è visibile non ricompare;
      ricompare solo a un nuovo episodio dopo che il badge è sparito. Un passaggio in background
      (schermo bloccato, Centro di controllo su iOS) non chiude l'episodio: se entro 15 secondi dal
      rientro il segnale è ancora scarso, torna il badge giallo senza avviso
- [ ] [UX] Quando lo stato esce da `poor` (15 secondi sotto i 30 m) il badge non sparisce subito:
      diventa verde con le tacche piene, a conferma che il segnale è tornato buono, resta **5
      secondi** e poi sparisce
- [ ] [UX] Lo stato `poor` (avviso e badge) si mostra solo sui telefoni (`isMobile`): da desktop la
      posizione del browser è sempre imprecisa e il badge resterebbe acceso per sempre
- [ ] [UX] `denied`: avviso persistente «La posizione non è disponibile» / «Controlla che la
      localizzazione sia attiva e che l'app abbia il permesso», con il bottone «Apri impostazioni App»
      sul nativo (`openAppSettings()`, già esistente). Il testo copre entrambe le cause perché iOS
      non distingue il permesso negato dalla localizzazione spenta
- [ ] [UX] `disabled` (solo Android e web da telefono): avviso persistente «Attiva la localizzazione
      del telefono» / «Serve per vedere la tua posizione sulla mappa», **senza** «Apri impostazioni»,
      che porterebbe alla pagina dell'app e non all'interruttore della localizzazione. Da desktop
      non si mostra
- [ ] Sul web, dopo `denied` o `disabled`, la posizione riparte quando l'utente torna sulla mappa o
      tocca il bottone della posizione (il watcher del browser non riparte da solo)
- [ ] [UX] Se l'utente chiude l'avviso di `denied` o `disabled`, non ricompare fino al prossimo avvio
      dell'app; il badge sul bottone resta finché il problema c'è
- [ ] [UX] Con lo stato `off` niente pulsazione, niente avvisi, niente badge
- [ ] [UX] Nessun avviso blocca l'uso della mappa: niente modali
- [ ] [UX] Il significato non passa solo dal colore: badge e avvisi hanno icona e testo, leggibili
      al sole (contrasto almeno 4.5:1)
- [ ] [UX] Gli avvisi sono annunciati agli screen reader (`role="alert"` / `aria-live`)
- [ ] [UX] Con `prefers-reduced-motion` l'avviso non vola: scompare in dissolvenza e il badge
      compare sul bottone; il bottone non pulsa
- [ ] Vale anche durante la registrazione di una traccia, dove il segnale scarso sporca i dati
- [ ] Un evento PostHog quando l'utente **vede** un avviso (segnale scarso con l'`accuracy`,
      permesso negato, localizzazione spenta, ricerca lunga), inviato da `GpsAlertService`
      dell'app e non da wm-core, così la webapp non manda eventi
- [ ] Testi in italiano come chiave e tradotti nelle sette lingue dell'app
      (`core/src/assets/i18n/{de,en,es,fr,it,pr,sq}.ts`)

### Verifica

- [ ] Test unitari in wm-core sulla funzione degli stati: isteresi, due fix di fila, timer d'uscita
      (anche senza fix successivi), mappatura degli errori nativi e web, errori senza codice
      ignorati, stato `off`
- [ ] Prova a mano su dispositivo Android e iOS: permesso negato e ritorno dalle impostazioni,
      localizzazione spenta, posizione approssimativa, attesa del primo fix, segnale scarso vicino a
      edifici o alberi, durante una registrazione; prova sulla PWA da telefono e da desktop

## Rischi

- [UX] Un avviso che compare e scompare a ogni oscillazione dell'`accuracy` diventerebbe fastidioso
  per chi cammina: mitigato dall'isteresi, dai due fix di fila e dall'avviso una volta per episodio.
- [UX] Un avviso che si chiude da solo può passare inosservato mentre si cammina: per questo resta il
  badge sul bottone finché il segnale non torna buono.
- Prima del primo fix l'app non può distinguere un segnale scarso da una partenza a freddo del GPS:
  i plugin non espongono né il numero di satelliti né l'intensità del segnale. L'avviso di attesa
  quindi non parla di segnale scarso, ma di ricerca del segnale.
- **Segnale perso dopo il primo fix, limite accettato.** Con `distanceFilter` a 10 m il plugin non
  manda posizioni a chi sta fermo, e su Android la perdita della posizione (`onLocationAvailability`)
  finisce solo nel log del plugin. Se il segnale si perde in una gola o se l'utente spegne la
  localizzazione dalla tendina a sessione in corso, lo stato resta l'ultimo noto e il pallino resta
  fermo senza avviso. Per lo stesso motivo il badge può restare acceso durante una sosta finché non
  arriva un fix buono.
- **Posizione approssimativa.** Chi la sceglie riceve posizioni con un'imprecisione di centinaia di
  metri o più. Su iOS arrivano come segnale debole. Su Android il plugin segnala anche
  `NOT_AUTHORIZED` (per Capacitor il permesso è concesso solo con `COARSE` e `FINE` insieme), ma le
  posizioni continuano ad arrivare: lo stato passa da `denied` a `poor` al secondo fix (verificato
  sul telefono, vedi notes.md). In entrambi i casi l'avviso consiglia di controllare la «Posizione
  esatta».
- **Nessun interruttore remoto, scelta accettata.** Se su qualche dispositivo gli avvisi risultano
  falsi, spegnerli richiede un revert in wm-core e una nuova release, che sul nativo passa dalla
  review degli store.
- Il ritorno dalle impostazioni dopo un permesso negato: `_startWatcher` non riparte se
  `_watcherId` è già valorizzato, e va verificato che il watcher rifiutato venga rimosso e
  ricreato.

## Out of scope

- **Follow-up da valutare: riconoscere il segnale perso.** Ricevere le posizioni a intervalli di
  tempo (`distanceFilter: 0` nel plugin) e applicare il filtro dei 10 m nel nostro codice prima di
  pallino e registrazione: così l'assenza di posizioni per qualche secondo vuol dire davvero
  segnale perso, e si può mostrare il pallino grigio come fa Google Maps. Su Android il GPS è già
  acceso ad alta precisione ogni secondo, quindi il costo di batteria è contenuto, ma va misurato
  in registrazione e il filtro deve rispettare il valore configurato oggi.
- **Follow-up da verificare: watcher spento dopo le impostazioni.** Chiudendo il modale delle
  impostazioni `stopAll()` ferma il watcher, e la pagina mappa lo riavvia solo in
  `ionViewWillEnter`, che alla chiusura di un modale non scatta: il pallino potrebbe smettere di
  aggiornarsi. Esiste già oggi, indipendentemente da questo ticket.
- La webapp (`wm-webapp`): lo stato del GPS sta in wm-core e si potrà montare l'interfaccia in un
  ciclo successivo.
- Soglie configurabili per istanza da `config.json`.
- Mostrare l'ultima posizione nota del telefono mentre si aspetta il primo fix.
- Uno stile diverso del cerchio di precisione in `map-core`.
- Satelliti e intensità del segnale tramite un plugin nativo (disponibili solo su Android).

## Moduli toccati

**wm-core** (`core/src/app/shared/wm-core/projects/wm-core/src/`) — vedi l'overview in
`wm-core/docs/features/8766-…/overview.md`:

- `services/geolocation.service.ts` — stato del GPS, gestione degli errori, watcher web, `off`
- `utils/gps-status.ts` — la funzione pura degli stati, e il suo spec
- `services/geolocation.service.spec.ts` — nuovo, watcher web e nativo

**webmapp-app** (`core/src/app/`):

- `services/gps-alert.service.ts` — le regole d'interfaccia e gli eventi PostHog, con lo spec
- `components/shared/gps-alert/` — avviso animato (`webmapp-gps-alert`), badge
  (`webmapp-gps-badge`) e icona delle tacche condivisa (`webmapp-gps-signal-icon`), con lo spec
  dell'avviso
- `functions/prefers-reduced-motion.ts` — controllo di «riduci movimento» condiviso
- `pages/map/map.page.html` — montaggio di avvisi e badge sul bottone della posizione
- `pages/map/map.page.base.ts` — `GpsAlertService` per il template
- `pages/map/map.page.scss` — pulsazione del bottone
- `pages/map/map.module.ts` — import dei componenti standalone
- `core/src/assets/i18n/{de,en,es,fr,it,pr,sq}.ts` — testi
- `core/angular.json`, `core/tsconfig.spec.json` — la cartella `gps-alert` fra quelle dei test
