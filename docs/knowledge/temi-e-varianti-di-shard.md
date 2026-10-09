# Temi e varianti di shard

> **Il dominio sta nella libreria.** Come funziona il foglio per app — il `<link>` costruito a
> runtime, il 404 silenzioso quando manca, perché rinominare un componente scollega i selettori,
> la forma additiva per le regole che valgono su entrambi i prodotti, cosa non si traduce, e la
> regola che una regola inerte non è un difetto da correggere — vive in
> [`wm-core/docs/knowledge/varianti-per-shard.md`](../../core/src/app/shared/wm-core/docs/knowledge/varianti-per-shard.md),
> insieme al meccanismo dei file gemelli e al criterio per estrarre una classe base. I file stessi
> hanno un [README accanto](../../core/src/app/shared/wm-core/projects/wm-core/src/assets/theme/README.md).
>
> Qui c'è **soltanto ciò che vale per questo prodotto**. La procedura sta in
> [docs/howto/personalizzazioni-per-shard.md](../howto/personalizzazioni-per-shard.md).

## Come funziona oggi

Le personalizzazioni per singolo shard hanno **due strade**, e la scelta non è libera.

**CSS, quando basta lo stile**: un foglio per app, servito da `wm-core` e caricato a runtime.
Da oc:8613 questi file **non stanno più in questo repo** — vedi il rimando qui sopra.
`core/src/theme/` esiste ancora ma non contiene più fogli per app: ci sono gli SCSS globali
(`variables.scss`, `typography.scss`, `mixins.scss`, `fonts.scss`) e i `global_env.scss` di shard
(`default/`, `stelvio/`) usati a compile-time da `stylePreprocessorOptions`. È un'altra cosa, e
non va confusa con i fogli per app.

**`fileReplacements`, quando la UI è strutturalmente diversa**: una configuration in
`core/angular.json` sostituisce il `.ts` di un componente con un gemello `.<shard>.ts`. Per
camminiditalia lo usano, nell'app, `profile.page.ts`, `tabs.page.ts` e `tabs-routing.module.ts`
(voce e rotta del tab Passaporto, oc:8703), e in `wm-core` `home-layer`, `search-bar`, `layer-box`
e `search-box`. Una variante può avere anche uno stile tutto suo, aggiungendo un `.scss` ai
`styleUrls` del gemello, come la tab bar per l'icona SVG del Passaporto.

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

Lo stesso schema si è ripetuto due volte con oc:8406 su `geohub/75.css`, l'unico tema di questo
prodotto che riordina il dettaglio di un POI: una rinomina che ha scollegato i selettori, e una
spaziatura spostata sul margine che quel tema azzera. Il meccanismo di entrambi sta nella pagina
di `wm-core`; qui resta cosa farne.

**Niente segnala nessuno dei due casi**: un selettore che non corrisponde a nulla non è un errore
per build, test o lint, e un `var()` che risolve a `0px` è un valore legittimo. Dopo un refactor
che rinomina o rispazia gli elementi del dettaglio, i temi vanno controllati a mano. Gli orfani si
elencano così:

```bash
grep -rhoE "selector: *'[^']+'" core/src/app --include="*.ts" | sed "s/selector: *'//;s/'$//" \
  | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -E "^(wm|webmapp)-" | sort -u > /tmp/sel.txt
grep -ohE "(^|[ ,>~+])(wm|webmapp)-[a-z0-9-]+" \
  core/src/app/shared/wm-core/projects/wm-core/src/assets/theme/*/*.css | sed 's/^[ ,>~+]//' \
  | sort -u | comm -23 - /tmp/sel.txt
```

Attenzione a due cose usandolo: `\s` non funziona in ERE POSIX, e con la regex sbagliata
l'estrazione dei selettori restituisce zero, quindi **tutto** risulta orfano — un numero fuori
scala vuol dire strumento rotto, non codice rotto. E un `!important` può servire davvero: la
regola del tema e quella del componente hanno spesso la **stessa** specificità, e il CSS del
componente Angular è iniettato dopo il foglio statico, quindi a parità vince lui.

## Cosa è di questo prodotto

**Tre dei nove fogli sono nati qui**: `camminiditalia/1.css`, `camminiditaliadev/1.css` e
`geohub/75.css`. Gli altri sei vengono dalla webapp e, da oc:8613, arrivano anche a noi — quindi
una regola scritta per quel prodotto può ora colpire l'app. Per lo stesso motivo la font delle
icone dichiara **due** nomi, `'webmapp'` e l'alias `'wm'` usato dalla webapp
(`core/src/assets/icons/webmapp-icons/style.css`): una `font-family` sconosciuta non è un errore,
il browser ricade sulla font di sistema e il glifo sparisce in silenzio.

**Il controllo che ferma la build è invocato da dodici punti**, non da uno. Undici passano da
`npm run check-themes`, definito una volta in `core/package.json`; il dodicesimo è
`checkInstanceThemes()` nel `gulpfile`, che lancia `node` sullo script per la ragione spiegata più
sotto. I fogli sono pubblicati
da una glob di `assets` in `core/angular.json` e nessuno li referenzia a compile-time: se il
submodule è a un commit che li precede, la build **riesce** e l'app esce senza le
personalizzazioni. Il controllo è `scripts/check-themes.js` in `wm-core`, condiviso con la webapp,
e va chiamato ovunque si builda:

- `prebuild` in `core/package.json`, che copre `npm run build`;
- i **sette** script che invocano `ionic build` direttamente — `deploy-cai-to-web`,
  `deploy-to-web-verbose`, `deploy-to-web-assets` e i quattro `surge-*` — perché `ionic build` non
  passa da `npm run build` e il `prebuild` non scatterebbe;
- `deploy-to-web-default.js` e `deploy-to-web-camminiditalia.js`, che lo invocano via `run()`;
- il passo prima di `Build` in `.github/workflows/preview.yml`;
- `runIonicBuild()` nel `gulpfile.js`.

**Le build native hanno un secondo controllo**, `checkBuiltThemes()` nel `gulpfile`, che
`check-themes.js` non può fare: confronta il manifest con i file dentro `www/theme/`, cioè con
l'**output** di una build e non con i sorgenti del submodule. Serve quando si riusa una `www/`
esistente invece di ribuildare — `addAndroidPlatform` e `addIosPlatform` lo fanno — perché una
`www/` vecchia può avere temi vecchi con i sorgenti a posto. Se ferma la build, la cura è
**cancellare la `www/` dell'istanza** per farla ribuildare. Non è ipotetico:
`instances/caiparma` ha oggi tre temi su nove nella sua `www/`.

**Il percorso dello script resta scritto per esteso in due soli punti**, `preview.yml` e
`checkInstanceThemes()` nel `gulpfile`, e per lo stesso motivo: entrambi devono distinguere «lo
script non c'è» — submodule a un commit che precede oc:8613 — da «i temi non ci sono», e quella
distinzione richiede di guardare il file prima di lanciarlo.

**Aggiungere o togliere un cliente tocca quattro posti**: la cartella `assets/theme/` di
`wm-core`, l'elenco atteso nel workflow di `wm-core`, e il `theme-manifest.json` di **ciascuno dei
due prodotti** — qui `core/theme-manifest.json`, e quello di `wm-webapp`. Nessuno dei quattro
avvisa che ne stai dimenticando un altro **nel momento in cui lo modifichi**: te ne accorgi dopo,
quando una build si ferma perché non coincidono. È il suo scopo, ma è una rete a valle, non un
controllo a monte.

E **togliere un tema dal repo non lo toglie dalla produzione**: nessuno dei deploy cancella —
`deploy-to-web-default.js` e `-camminiditalia.js` usano `rsync` senza `--delete`, gli altri tre
(`deploy-cai-to-web`, `deploy-to-web-verbose`, `deploy-to-web-assets`) copiano con `scp -r`, che
non cancella per costruzione. Il file resta quindi sul server. Disattivare un cliente sono due operazioni —
vedi [build-e-deploy-web](build-e-deploy-web.md).

**Il gulpfile è il punto che pesa di più, e non esiste nella webapp**: da lì si arriva ai binari
nativi e agli store, dove un tema mancante non si corregge con un redeploy. Il controllo gira con
`cwd` **dentro la copia dell'istanza**, che è ciò che viene davvero buildato — farlo in `core/`
passerebbe anche se la copia perdesse gli asset del submodule. La condizione usa `throw`, come le
validazioni di `icon.png` e `splash.png`: `abort()` in quel file **logga soltanto e non
interrompe**.

## Debito noto

- **Nessuna copertura CI o E2E sulla configuration `camminiditalia`**: un refactor in `wm-core` che
  rinomini o sposti i file `.camminiditalia.ts` la rompe in silenzio.
- **Le icone dei filtri sono a metà** (oc:8414): il developer ha fornito le SVG esatte del sito solo
  per Lunghezza, Tipologia, Temi e Stagioni; Portata e Regioni sono ricreate a mano.
- **`route-filters.cy.ts` è scritto ma non è mai stato eseguito** (oc:8414), né in CI né in locale.
