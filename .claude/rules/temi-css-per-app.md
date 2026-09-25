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
  cambiare. Le regole che dipendono dalla forma della card (`> ion-card`, `wm-map-details::after`,
  i quattro `ion-card-content:has(...)`) restano solo mobile: il dettaglio della webapp è un `div`
  senza `ion-card` e senza tab bar.
