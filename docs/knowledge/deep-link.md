# Deep link: cosa fa l'app quando un link porta a un contenuto

## Come funziona oggi

**Due ingressi distinti, per due situazioni diverse.**

Il **link nativo** (Universal Link / App Link, app installata) arriva dal listener Capacitor:
`app.component.ts:95` registra `App.addListener('appUrlOpen', …)` e `_handleDeepLinkUrl()`
(riga 175) chiama `this._urlHandlerSvc.handleDeepLink(url)`. È l'unico invocante di quel metodo
di `wm-core`: un link aperto in un browser non lo raggiunge mai.

Il **link web** (browser o PWA) lo legge `UrlHandlerService.initialize()` in `wm-core`, che
dispatcha allo store gli id trovati nei query param. Da lì in poi tocca all'app.

**La navigazione Home→Map è reattiva, non imperativa.** `HomePage` (`pages/home/home.page.ts:46`)
ha un `merge()` che naviga su `map` quando uno fra `currentEcLayer`, `currentEcTrack`,
`currentEcPoi` e `ugcOpened` diventa non-null, filtrati da un predicato `isNotNull` condiviso
(riga 14). Un link con il solo `search` resta quindi su Home.

**Il pannello di dettaglio si apre anche se il feature era già aperto al mount.**
`MapDetailsComponent.ngAfterViewInit()` (`pages/map/map-details/map-details.component.ts:76`)
sottoscrive `featureOpened$` **senza** `skip(1)`, e un commento sul posto spiega perché.

## Perché così

- **`skip(1)` scartava l'unica emissione utile** (oc:8470): con un query param iniziale,
  `UrlHandlerService.initialize()` dispatcha mentre l'utente è ancora su Home, quindi
  `featureOpened` diventa `true` prima che `MapDetailsComponent` esista. Al mount il primo valore
  è già `true`, `skip(1)` lo scartava e nessuna transizione successiva arrivava mai: il POI
  restava evidenziato sulla mappa con il pannello chiuso. Nel flusso "click su un risultato di
  ricerca" il componente è già montato e la transizione si osserva normalmente — è il motivo per
  cui il bug non era mai emerso. Verificato con `git log -p` che quel `skip(1)` veniva da un
  refactor generico (commit `8c518175`), senza una motivazione legata a questo scenario.
- **La navigazione è stata estesa a `track`/`poi`, non reinventata** (oc:8470): prima reagiva solo
  a `currentEcLayer`/`ugcOpened`, e un link con solo `track` caricava la traccia nello store senza
  che nessuna UI la mostrasse — il pannello di dettaglio esiste solo in `map.page.html`.
- **Nessuna guardia `onRecord`/`drawOpened` nel `merge()`** (oc:8470): il meccanismo non l'ha mai
  avuta per `layer`/`ugcOpened`, e aggiungerla solo per `track`/`poi` avrebbe creato
  un'asimmetria non richiesta.
- **L'ordine dentro `initialize()` è un'invariante di `wm-core`**, non una scelta dell'app:
  `_currentQueryParams$.next(params)` viene prima di ogni `dispatch()`, altrimenti una
  `changeURL('map')` scatenata sincronamente legge query param vecchi e li perde dall'URL finale.
  Fonte di verità: `docs/knowledge/deep-link.md` di `wm-core`.

## Prima di cercare nel codice Angular

oc:8470 nasceva come «il link da sito non funziona su cellulare», ma la prima causa era **fuori da
ogni repo git**: due bug di configurazione Apache corrompevano il redirect per user-agent mobile
verso l'infrastruttura condivisa, facendo crashare Angular (`NG04002`) prima ancora che l'app
vedesse l'URL. Corretti in produzione via SSH — proxy spostato fuori dal blocco `<Directory>`,
dove `mod_dir` generava una subrequest `index.html` anch'essa proxata, e `[L]` → `[END]` nel
fallback SPA. Quando un link non funziona **solo** da mobile, conviene escludere l'infrastruttura
prima del codice.

## Debito noto

- **Nessun punto unico di orchestrazione** (oc:8470): i tre fix del ticket convergono sullo stesso
  vuoto — non esiste un posto che stabilisca cosa deve succedere, in che ordine, quando un feature
  diventa corrente via URL, e come si spegne alla chiusura manuale. Il TODO già presente in
  `home.page.ts` («creare uno store della app e gestire questo caso come effect del repo app») è
  più giustificato di prima: tre bug della stessa famiglia in un solo ciclo, di cui uno emerso
  solo da un test manuale.
- **Finestra di race al rimontaggio** (oc:8470): uscendo dall'albero `ion-tabs`
  (`map.page.ts` → `downloadlist`, `profile-data.component.ts` → `downloadlist`) i query param
  `poi`/`track` vengono droppati, il che di norma azzera lo stato prima del rimontaggio di
  `MapDetailsComponent`; resta una finestra stretta (~100 ms, il debounce di `initialize()`) in
  cui il pannello potrebbe riaprirsi da solo dopo che l'utente l'aveva chiuso. Non riprodotta
  empiricamente, accettata.
- **Verifica manuale end-to-end mai eseguita** (oc:8470): il lavoro è coperto da test unitari e
  ispezione del codice, mai da una prova su device reale — incluso lo scenario originale del
  ticket (`https://sentieri.caiparma.it/?track=89812&search=borello` da smartphone).
