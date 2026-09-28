---
paths:
  - "core/src/app/shared/wm-core/projects/wm-core/src/assets/theme/**"
  - "core/src/theme/**"
---

# Trappole: i temi CSS per app e come misurarli

Il perché di questi file sta in
[docs/knowledge/temi-e-varianti-di-shard.md](../../docs/knowledge/temi-e-varianti-di-shard.md).

- **`querySelectorAll` non aggancia mai uno pseudo-elemento.** Prova di controllo:
  `document.querySelectorAll('body::after')` restituisce `0` mentre `body` esiste. Chi verifica
  quali regole di un tema siano ancora vive e conta i match con `querySelectorAll` classifica come
  morte **tutte** le regole con `::after` e `::before`, e non se ne accorge perché non viene
  sollevata nessuna eccezione. Va cercato l'elemento host, con lo pseudo rimosso dal selettore. Sul
  tema dell'app 75, nell'audit di oc:8613, questo valeva per 14 regole, di cui **12 vive**.

- **Le tab di Ionic tengono montate più pagine insieme**, quindi una query globale trova elementi
  che non stanno nel contenitore che si crede. `document.querySelectorAll('wm-home-layer')` dava
  `1` mentre `wm-map-details` era vuoto: quell'elemento stava in `wm-home`, la pagina Esplora.
  L'ancoraggio va verificato con `closest()` o misurando il selettore completo, mai il solo tag.

- **Il prefisso `wm-map-details` nelle regole del tema è portante, non decorativo.**
  `wm-home-layer` e `wm-status-filter` si montano in **due** punti: nel pannello della mappa
  (`map.page.html`) e nella home (`home.component.html`). Nello stato «layer aperto» sono vivi
  entrambi nello stesso momento — misurato. Togliere il prefisso per «semplificare» applica quelle
  regole anche alla home.

- **Un tema si misura percorrendo gli stati dell'interfaccia, non deducendoli dalla `config.json`.**
  Una schermata sola copre una frazione dei selettori: sul tema del 75 sono serviti 16 stati per
  arrivare a 168 selettori vivi su 209. E un layer non si apre con la query string: su mobile
  `?layer=<id>` non seleziona niente, il layer va scelto dalla lista in Esplora.

- **Le regole prefissate `.details-container` sono il ramo della webapp** e su mobile sono inerte
  per costruzione: quel contenitore non è prodotto da nessun template di questo prodotto. Vanno
  aggiunte **accanto** al ramo `wm-map-details`, mai al suo posto, così la resa su mobile non può
  cambiare.

- **La forma additiva garantisce che mobile non cambi, non che i due prodotti si allineino.** Sono
  due affermazioni diverse e la seconda è falsa: `.details-container` è una **classe**,
  `wm-map-details` un **elemento**, quindi ogni ramo webapp ha una classe in più e vince contesti
  che il ramo mobile perde. Caso misurato — la copertina della scheda del layer nel tema 75:

      .details-container wm-home-layer wm-img img   (0,1,3)  vince sul componente
      wm-img .wm-img-image                          (0,1,1)  img.component.scss:17
      wm-map-details wm-home-layer wm-img img       (0,0,4)  perde

  Sulla webapp la copertina è davvero `display: none`; su mobile resta `block` e non si vede solo
  perché il contenitore è alto 0. Un tema che volesse vincere anche qui deve prendere di mira la
  **classe**, come fa già `forestasuat/1.css` con `.wm-img-image`. Le regole che dipendono dalla forma della card (`> ion-card`, `wm-map-details::after`,
  i quattro `ion-card-content:has(...)`) restano solo mobile: il dettaglio della webapp è un `div`
  senza `ion-card` e senza tab bar.

- **Una glob che non trova niente non protesta.** I temi sono pubblicati da una voce di `assets`
  in `core/angular.json` e nessuno li referenzia a compile-time: se il submodule è a un commit che
  precede oc:8613, la cartella non c'è, la build **riesce** e l'app esce senza i CSS dei clienti.
  Per questo `npm run build`, i sette script che invocano `ionic build` direttamente, i due deploy
  web, `preview.yml` e `runIonicBuild` nel `gulpfile` passano tutti da
  `node src/app/shared/wm-core/scripts/check-themes.js`. Vale la regola generale: in una
  scansione, *zero risultati* e *zero problemi* si leggono uguale — serve un'aspettativa
  dichiarata (qui, almeno un `.css`) perché il vuoto diventi un errore.

- **`abort()` nel `gulpfile` non interrompe**, logga soltanto. Per fermare davvero una build si usa
  `throw new Error('Build interrotta: …')`, come fanno le validazioni di `icon.png` e `splash.png`.

- **`querySelectorAll` dice se il selettore trova, non se la dichiarazione vince.** È lo stesso
  strumento della prima trappola e sbaglia dall'altro lato: per **difetto** sugli pseudo-elementi,
  per **eccesso** qui. Un selettore con un bersaglio può essere perfettamente inerte se un'altra
  regola lo sovrascrive — succede spesso perché tema e componente hanno la **stessa** specificità e
  il CSS del componente Angular è iniettato **dopo** il foglio statico, quindi a parità vince lui.
  Caso reale: `wm-tab-detail { margin-top: 15px }` nel tema 33 è battuto da
  `margin: var(--wm-feature-details-margin)` del componente, ed è rimasto inerte **quattordici
  mesi** senza che nessuno se ne accorgesse. Il controllo giusto non è contare i bersagli ma
  confrontare il valore dichiarato con `getComputedStyle` sulla proprietà dichiarata.
