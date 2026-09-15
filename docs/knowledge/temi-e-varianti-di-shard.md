# Temi e varianti di shard

> Il meccanismo dei file gemelli e il criterio per estrarre una classe base sono dominio della
> libreria: `core/src/app/shared/wm-core/docs/knowledge/varianti-per-shard.md`. Qui c'è come li usa
> questo prodotto, e la procedura sta in
> [docs/howto/personalizzazioni-per-shard.md](../howto/personalizzazioni-per-shard.md).

## Come funziona oggi

Le personalizzazioni per singolo shard hanno **due strade**, e la scelta non è libera.

**CSS, quando basta lo stile**: un tema in `core/src/theme/<shard>/`, caricato a runtime da
`MetaComponent` (`wm-core`) solo per quello shard.

**`fileReplacements`, quando la UI è strutturalmente diversa**: una configuration in
`core/angular.json` sostituisce il `.ts` di un componente con un gemello `.<shard>.ts`. Oggi lo
usano `home-layer.component.ts` e `search-bar.component.ts`, entrambi in `wm-core`.

La configuration si sceglie da sé: `core/scripts/serve.js` (via `npm start`) e `runIonicBuild()`
nel `gulpfile.js` leggono `shardName` dall'`environment.ts` e cercano una configuration con match
esatto, oppure per prefisso — così `camminiditaliadev` trova `camminiditalia`. Nessun flag da
ricordare.

## Perché così

- **Il CSS-only è stato sostituito dove non bastava più** (oc:8305 → oc:8391): il redesign di
  `home-layer` era nato come selettori globali con `!important` in `1.css`, e con oc:8391 è
  diventato una variante vera via `fileReplacements`. Il blocco è stato rimosso da entrambi i
  `1.css`, e la variante è stata verificata con una build reale
  `ng build --configuration=camminiditalia`.
- **Il CSS-only resta però la scelta giusta quando funziona** (oc:8305): il redesign iniziale usava
  CSS Grid con `grid-template-areas` sulle classi globali esistenti e un divisore condizionato con
  `:has()` alla presenza del logo nel DOM — senza introdurre una classe condizionale lato
  componente e senza toccare il componente condiviso.
- **Il pannello filtri non è diventato un componente nuovo** (oc:8414): il piano ne prevedeva uno
  generico, `home-route-filters`, mai esistito prima. Il developer ha fatto notare che, a differenza
  di `wm-home-layer` — preesistente e comune a tutti gli shard — non aveva senso mantenere una
  «versione generica» di una feature interamente nuova. Il pannello è quindi entrato nella variante
  camminiditalia della searchbar.
- **`SearchBarBaseComponent` è una deviazione motivata** dalla regola «non estrarre una classe
  base» (oc:8414): non è l'intero componente duplicato con lo stile diverso, è un sottoinsieme di
  logica di ricerca condiviso al 100%, e la variante **aggiunge** funzionalità invece di
  duplicarla. Il criterio completo sta nella pagina di `wm-core`.
- **Un'altezza hardcoded è stata rimossa invece che sincronizzata** (oc:8305):
  `favourites-layers.component.scss` non ripete più l'altezza di `.wm-box`, che ora ce l'ha propria
  in `wm-core` — elimina alla radice il rischio di disallineamento cross-repo che un numero copiato
  avrebbe lasciato aperto.

## La trappola degli override di tema

**Cambiare la tecnica di stacking in un componente di `wm-core` rompe in silenzio gli override di
tema basati su `top`/`right`/`bottom`/`left`**: su un elemento `position:static` quelle proprietà
sono ignorate, senza alcun errore. È già successo (oc:8305): la migrazione a CSS Grid ha reso
inerte una personalizzazione di `stelvio` (`top:20%`), corretta con l'approvazione esplicita del
developer pur essendo fuori dallo scope del ticket — **le personalizzazioni per-shard devono
restare funzionanti anche quando cambia la tecnica di base del componente condiviso**.

## Debito noto

- **Nessuna copertura CI o E2E sulla configuration `camminiditalia`**: un refactor in `wm-core` che
  rinomini o sposti i file `.camminiditalia.ts` la rompe in silenzio.
- **Le icone dei filtri sono a metà** (oc:8414): il developer ha fornito le SVG esatte del sito solo
  per Lunghezza, Tipologia, Temi e Stagioni; Portata e Regioni sono ricreate a mano.
- **`route-filters.cy.ts` è scritto ma non è mai stato eseguito** (oc:8414), né in CI né in locale.
