> Ticket: oc:8766

# Notes — Mappa: indicazione di segnale GPS scarso, posizione non disponibile o poco affidabile

## Divergenze dal piano, task per task

### Task 1 — funzione degli stati

- **Gli errori arrivati con lo stato `off` si ignorano**: a watcher fermo un errore può venire solo
  da una callback in ritardo (review finale).
- Codici d'errore e messaggio del plugin sono costanti con nome (`GPS_NOT_AUTHORIZED`,
  `GPS_LOCATION_DISABLED_MESSAGE`), esportate perché le usa anche il servizio.

### Task 2 — watcher nativo

- **Il watcher si rimuove su `denied` solo su iOS.** Il piano diceva di rimuoverlo sempre. Su
  Android il plugin, quando manca `ACCESS_FINE_LOCATION`, chiede il permesso ma crea comunque il
  watcher (`BackgroundGeolocation.java:159`); con la sola posizione approssimativa il watcher
  continua a consegnare fix mentre il plugin manda `NOT_AUTHORIZED` ("User denied location
  permission"). Rimuoverlo bloccava il pallino, che prima di questo ticket continuava a muoversi.
  Il plugin Android riattiva da sé il watcher quando il permesso viene concesso (`handleOnResume`,
  righe 325-331). Su iOS invece il plugin ferma il watcher (`Plugin.swift:197`) e va ricreato al
  ritorno nell'app. Trovato dal dev nella prova su Pixel 9 Pro.
- **Su Android un `NOT_AUTHORIZED` dopo che il watcher ha già consegnato posizioni si ignora.** Con
  la posizione approssimativa i fix arrivano mentre la finestra del permesso è aperta e l'errore
  arriva solo alla sua chiusura; da fermi il `distanceFilter` non lascia passare altri fix e lo
  stato restava `denied` con il pallino visibile (screenshot del dev, seconda prova). Se una
  posizione è arrivata il permesso c'è; la revoca a sessione in corso su Android riavvia l'app.
- **Le chiamate al plugin passano da due metodi del servizio** (`_addNativeWatcher`,
  `_removeNativeWatcherById`): il plugin è un Proxy Capacitor che `spyOn` non intercetta, e senza
  questi metodi il percorso nativo non era testabile.
- **Un contatore di generazione (`_nativeWatcherGen`)** scarta le callback in ritardo di un watcher
  già rimosso, che altrimenti potevano cancellare il watcher attivo (review finale).
- **Il `NOT_AUTHORIZED` ignorato dopo un fix su Android è solo quello di permesso**: la
  localizzazione spenta (`Location services disabled.`) porta comunque in `disabled` (review
  `wm-review-ticket`).
- **`gpsStatus$` è in sola lettura** (`asObservable()`), con il getter `gpsStatus` per il valore:
  prima un consumer poteva chiamare `next()` e disallinearlo dallo stato interno.
- **Sul web `startNavigation()` riapre il watcher se lo stato è `denied` o `disabled`**: il watcher
  del browser non riparte da solo dopo un errore, e prima la posizione tornava solo ricaricando la
  pagina.
- **Il parametro `'high' | 'low'` di `_startLocationWatcher` è stato tolto**: con l'alta precisione
  sempre attiva non aveva più effetto.
- La rimozione del watcher nativo passa da un solo metodo (`_detachNativeWatcher`), usato sia da
  `_stopWatcher` sia sul `denied` di iOS; un errore del plugin finisce in `console.warn`.

### Task 3 — regole d'interfaccia

- **Un passaggio in background non chiude l'episodio di segnale debole.** Con lo schermo bloccato,
  o su iOS anche solo aprendo il Centro di controllo, il watcher si ferma e lo stato va in `off`:
  prima questo spegneva il badge, e al rientro l'avviso si ripresentava a ogni sblocco. Ora
  l'episodio resta sospeso: se entro 15 s dal primo fix dopo il rientro il segnale è ancora scarso
  torna il badge giallo senza avviso, altrimenti l'episodio si chiude senza verde (non c'è la prova
  dei 15 s sotto i 30 m). Era anche una deviazione dal piano, che diceva che il badge giallo resta
  fino all'uscita da `poor` (review `wm-review-ticket`, unico bloccante).
- **`disabled` da desktop non si mostra**, come già `poor`: il testo parla della localizzazione del
  telefono e sul desktop `POSITION_UNAVAILABLE` arriva anche per motivi che l'utente non controlla.
- **Anche l'avviso di ricerca si può chiudere**: al chiuso il primo fix può non arrivare mai.
- **Il verde compare solo uscendo da `poor`**, non dopo un riavvio del watcher (review finale).
- I timer sono `setTimeout` e non `switchMap` + `timer` come nel piano: le regole sono più leggibili
  così e sono coperte da 20 test.

### Task 4 — avviso e badge

- **Il badge è un componente standalone** (`webmapp-gps-badge`), figlio di `ion-fab` accanto
  all'`ion-fab-button`, e non uno `span` dentro il bottone, dove verrebbe tagliato. Resta nel DOM
  anche spento perché è il punto d'arrivo dell'animazione.
- **L'host di `webmapp-gps-alert` è un livello assoluto a tutto schermo** (`pointer-events: none`) e
  la scheda è `absolute` al suo interno: nello slot `fixed` di `ion-content` l'host riceve un
  `transform`, e una scheda `position: fixed` risultava larga 0 px (visto nel browser).
- **I testi di `denied` e `disabled` sono titolo + sottotitolo**, come nel prototipo approvato, e non
  una frase unica come nel piano. Il sottotitolo di `disabled` («Serve per vedere la tua posizione
  sulla mappa») è nuovo rispetto al piano.
- **La pulsazione del bottone sta in `map.page.scss`**, come da piano; per un periodo era nel foglio
  dell'avviso e dipendeva dal fatto che l'avviso fosse montato. Il colore è il primario del tema,
  non un arancione fisso.
- **L'icona delle tacche è un componente condiviso** (`webmapp-gps-signal-icon`) fra avviso e badge,
  e le misure d'arrivo del volo si leggono dal CSS del badge invece di essere ripetute nel TS.
- Il controllo di «riduci movimento» è una funzione condivisa (`functions/prefers-reduced-motion.ts`).
- La scheda ha `width: calc(100% - 32px)` e `max-width: 340px`, come nel prototipo, invece del solo
  `max-width: calc(100% - 32px)` del piano.
- **Spec in più**: `gps-alert.component.spec.ts`, che ha richiesto di aggiungere la cartella
  `gps-alert` in `angular.json` e `tsconfig.spec.json`.

### Task 5 — testi

- **Riusata la chiave esistente `'Apri impostazioni App'`** invece di crearne una nuova
  `'Apri impostazioni'`: era già tradotta nelle sette lingue.
- **Le chiavi reali sono dieci**, diverse da quelle elencate nel piano: titolo e sottotitolo dei
  quattro avvisi (otto chiavi) e due etichette per gli screen reader del badge (`'Segnale GPS
  debole'`, `'Segnale GPS tornato buono'`). Per `denied` e `disabled` il badge riusa il titolo
  dell'avviso.

## Bug trovati

- Nello slot `fixed` di `ion-content` un figlio `position: fixed` prende come contenitore l'host,
  largo 0: corretto con l'host assoluto (vedi Task 4).
- Lo spegnimento animato del badge, se nel frattempo arrivava un altro badge, azzerava quello nuovo:
  corretto ignorando lo spegnimento quando `kind` non è più `null`.
- Dalla review con `wm-review-ticket` (5 revisori), ciascuno con un test che prima falliva: il
  segnale debole che si ripresentava a ogni sblocco del telefono (bloccante), `disabled` da
  desktop, l'avviso di ricerca senza chiusura, la PWA che non ripartiva dopo un permesso negato,
  `gpsStatus$` scrivibile, la dissolvenza annullata che trasformava comunque l'avviso in badge, la
  localizzazione spenta ignorata dopo un fix su Android.
- Dalla review finale, ciascuno con un test che prima falliva:
  - all'inizio del volo la scheda saltava a sinistra di metà della sua larghezza, perché
    l'animazione d'ingresso (`fill: forwards`) prevaleva sugli stili inline;
  - con il bottone della posizione nascosto l'avviso volava verso l'angolo in alto a sinistra: ora
    sfuma;
  - un riavvio del watcher a metà di un episodio di segnale debole accendeva il verde senza prova:
    ora il verde compare solo uscendo da `poor`;
  - una callback in ritardo di un watcher rimosso poteva cancellare quello attivo.

## Decisioni

- **Tag Orchestrator:** il dev ha chiesto di saltare la proposta dei tag, sia di ambiente sia di
  contenuto.
- **Design:** prototipo interattivo approvato dal dev
  (https://claude.ai/artifact/33ee7bQpmMZwRf1qhPFa9J), stile «scheda chiara»; dopo il prototipo il
  dev ha chiesto la transizione in tre fasi con la stessa icona, più rapida (0,7 s), e il badge
  verde di conferma per 5 s al ritorno del segnale buono.
- **Posizione approssimativa su Android, verificata sul telefono:** per Capacitor il permesso
  «location» è concesso solo se lo sono sia `COARSE` sia `FINE` (`Bridge.java:1253`), quindi con la
  sola approssimata il plugin segnala `NOT_AUTHORIZED`, ma le posizioni arrivano comunque, con
  un'`accuracy` molto ampia. Con la correzione del Task 2 lo stato passa da `denied` a `ok` al primo
  fix e a `poor` al secondo: compare l'avviso di segnale debole con il consiglio sulla «Posizione
  esatta». L'avviso di permesso negato può comparire per un istante prima del primo fix.
- **Posizione approssimativa con un solo fix: nessun avviso, limite accettato dal dev.** Se da fermi
  arriva un solo fix approssimativo, la regola dei due fix di fila sopra 50 m non scatta e lo stato
  resta `ok`: pallino con il cerchio di precisione molto ampio, senza avviso. Scartate: una soglia
  «un fix sopra 500 m → subito `poor`», perché all'avvio a freddo Android consegna spesso un primo
  fix da celle o Wi-Fi di 500-2000 m e l'avviso comparirebbe a ogni apertura; e l'uso del
  `NOT_AUTHORIZED` dopo i fix (segnale esatto della posizione approssimativa su Android) per entrare
  subito in `poor`, che il dev ha preferito non aggiungere.
- **PWA, impostazioni:** `stopAll()` ora chiude davvero il watcher web (prima restava aperto e alla
  riapertura ne nasceva un secondo). Di conseguenza, sulla PWA, dopo la chiusura delle impostazioni
  il pallino si ferma finché non si cambia pagina o si tocca il bottone della posizione: è lo stesso
  follow-up già accettato per il nativo.
- **Lint:** `ng lint` non parte per un config ESLint rotto preesistente
  (`plugin:@angular-eslint/ng-cli-compat` non trovato); convenzioni controllate a mano.
- **Test locali:** servono Node 22 e una config Karma con `pingTimeout` più alto (la trappola nota
  del «ping timeout»); le suite di app e wm-core vanno lanciate una alla volta, in parallelo la
  macchina va in timeout.

## Follow-up

- Riconoscere il segnale perso ricevendo le posizioni a intervalli di tempo (vedi Out of scope
  dell'overview).
- Watcher fermo dopo la chiusura delle impostazioni, ora anche sulla PWA.
- Avviso di ricerca ed evento PostHog contano anche quando la mappa non è la pagina visibile (il
  watcher parte con la pagina mappa e resta attivo sugli altri tab).
- Durante la registrazione il bottone della posizione può essere nascosto: l'avviso sfuma e il
  badge non si vede.
- Il contrasto del bottone primario e del badge rosso dipende dai colori del tema di ogni istanza.
- L'avviso di permesso negato, se non viene chiuso, ricompare a ogni rientro nell'app e rimanda
  `gpsAlertShown`: da sapere quando si leggono le metriche.
- Prova su dispositivo ancora da completare: iOS (permesso negato, localizzazione spenta,
  «Posizione esatta» spenta, ritorno dalle impostazioni) e un vero segnale debole all'aperto, per
  verificare le soglie di 50 e 30 m.
- Config ESLint dell'app da sistemare.
