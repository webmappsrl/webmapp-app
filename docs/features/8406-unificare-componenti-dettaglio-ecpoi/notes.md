> Ticket: oc:8406

# Notes — Unificare i componenti di dettaglio EcPoi (webmapp-app)

Le decisioni di merito sul componente stanno nel `notes.md` gemello in wm-core
(`core/src/app/shared/wm-core/docs/features/8406-.../notes.md`). Qui solo ciò che
riguarda l'app.

## Deviazioni dal piano

- **Il perimetro si è allargato in corsa.** La parte prevista dall'overview — rimozione del
  componente locale e ri-consumo da `WmCoreModule` — è andata come scritta e senza attriti.
  Si è poi aggiunto lo spostamento dell'intestazione, e due decisioni di team hanno cambiato
  ordine ed etichette: sotto i due punti che seguono.
- **`PoiPropetiesModule` aveva un solo importatore**, `map.module.ts:6`. La rimozione è
  risultata più netta del previsto: nessuna catena di import da sbrogliare.

- **Rimossa anche l'intestazione dal pannello, non prevista dall'overview iniziale.** Il
  piano si fermava al consumo del componente promosso. Titolo, località e
  `wm-related-pois-navigator` sono stati spostati in `wm-poi-properties` in un secondo
  momento, quando è emerso che erano markup duplicato con il popup di `wm-webapp` e che le
  due rese erano divergenti. Qui restano il pulsante di chiusura (su `wm-map-details`, mai
  stato dentro il blocco rimosso), il ramo UGC con `wm-updated-at` e il ramo traccia.

- **Due decisioni di team hanno superato scelte prese in questo cantiere.** Vengono dalle
  trascrizioni degli scrum, call del 04/09/2026, e non erano nel ticket né nei piani:
  le tassonomie vanno **subito sotto il titolo** e non in fondo (stavano in fondo in
  entrambi i prodotti, quindi promuovendo la mobile in libreria era stato riprodotto
  fedelmente un ordine già bocciato); le etichette che separano i gruppi vanno tolte.
  Lo split «Contatti» / «Link utili» chiesto durante il QA del 03/09 è stato quindi
  sostituito da un elenco unico, oggi intitolato «Informazioni». Chi rilegge la cronologia
  di questo file troverà le due cose in contraddizione: la seconda è posteriore e prevale.

## Bug trovati

- **`ng build --configuration=production` esce con codice 0 ma non produce
  `www/index.html`.** L'output contiene `✖ Index html generation failed —
  document.documentElement?.setAttribute is not a function`: i bundle JS vengono
  generati, l'index no, e una build senza index non è deployabile. In CI un exit code 0
  farebbe passare questo silenziosamente.

  **Non è causato da questo ticket** — nessuna modifica tocca dipendenze, `index.html` o
  la configurazione di build, e il fallimento avviene nella fase successiva al bundling.
  È il problema `domhandler` documentato in CLAUDE.md sotto oc:8382: l'`overrides` è
  presente in `core/package.json`, ma l'albero installato non lo riflette —
  `node_modules/domhandler` è ancora `4.3.1` (la copia rotta) mentre `beasties` porta la
  propria `5.0.3`, e `node_modules/` (2 settembre) è più vecchio di `package.json`.
  Serve una reinstallazione, non un fix di codice.

  **Attribuzione ragionata, non dimostrata**: la verifica pulita richiederebbe di
  ricostruire `node_modules`, cioè di toccare l'ambiente del dev, e non è stata
  autorizzata. Finché non viene fatta, **il requisito "verifica con
  `--configuration production`" resta scoperto**, ed era stato messo proprio per
  intercettare il debito noto di `SharedModule` (importa `WmCoreModule` senza
  ri-esportarlo, oc:8382) — che si manifesterebbe in produzione e non in `ng serve`.

## Decisioni

- **Verifica accettata: spec sul componente promosso + passaggio manuale mirato.**
  I tre casi manuali sono stati scelti sui dati di produzione, non a intuito:
  POI con indirizzo e senza quota (2.298 record), POI con virgola in `contact_phone`
  (1.798 — di cui **1.647, il 92%, hanno un solo numero più etichette vuote**: non sono
  telefoni realmente multipli), POI con `config_detail` valorizzato (la riga più recente
  del template, da oc:8181).

  QA eseguito su shard FIE (app 29), POI `97598` e `5338`. Nessun POI dell'app ha tutti
  i campi popolati: per una verifica completa servono più POI insieme —
  **42535** (Rifugio Telegrafo: tre telefoni davvero valorizzati, 7 immagini, indirizzo
  `",,"` che non deve comparire), **42533** (Santuario Madonna della Corona: 12 immagini,
  descrizione lunga, indirizzo con virgole ai bordi), **42417** (Pizzighettone: due siti
  con etichette leggibili), **53037** (Pro Loco Cassano d'Adda: `related_url` in `http://`
  puro, il caso che rompe `wm-related-urls`).
- **`core/src/environments/environment.ts` è stato modificato per il QA**
  (`appId: 1 / carg` → `29 / geohub`). **Va ripristinato prima dei commit**: non fa
  parte della feature e non deve entrare nella PR.

## Follow-up

- **I temi per-shard si sono scollegati dal componente promosso, e nessuno se ne accorge.**
  **Risolto sotto oc:8613**, con sole modifiche al tema; il perché sta in
  [docs/knowledge/temi-e-varianti-di-shard.md](../../knowledge/temi-e-varianti-di-shard.md).
  `core/src/theme/geohub/75.css` riordina le sezioni del dettaglio POI con `order:` flexbox.
  Rinominando gli elementi, quattro suoi selettori sono rimasti orfani — in flexbox un figlio
  senza `order` vale 0 e finisce **in cima**, quindi il blocco dei contatti è comparso sotto
  il nome invece che in fondo, e ha perso anche i propri stili. Un selettore CSS che non
  corrisponde a nulla non è un errore per nessuno strumento: né build, né test, né lint.
  **Quando si rinomina un elemento del dettaglio, i temi per-shard vanno controllati a mano.**
  Il comando che elenca gli orfani:

  ```bash
  grep -rhoE "selector: *'[^']+'" core/src/app --include="*.ts" | sed "s/selector: *'//;s/'$//" \
    | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -E "^(wm|webmapp)-" | sort -u > /tmp/sel.txt
  grep -ohE "(^|[ ,>~+])(wm|webmapp)-[a-z0-9-]+" core/src/theme/*/*.css | sed 's/^[ ,>~+]//' \
    | sort -u | comm -23 - /tmp/sel.txt
  ```

- **Da valutare: temi per-shard condivisi fra i due prodotti.** Oggi mobile e webapp hanno
  cartelle `theme/` separate, una per repo, con **nove file e nessuna sovrapposizione**: la
  mobile ha `camminiditalia/1.css`, `camminiditaliadev/1.css` e `geohub/75.css`; la webapp ha
  `forestas/1.css` (più le varianti dev e uat, identiche) e `geohub/{29,32,33}.css`.
  Nessuna app è customizzata su entrambi, quindi oggi non esiste drift — ma per l'app 75 la
  webapp risponde **404** su `/theme/geohub/75.css`, e questa è la vera ragione per cui i due
  prodotti rendono il dettaglio in ordine diverso, non una differenza del codice condiviso.

  La condivisione sarebbe fattibile e il precedente esiste già: entrambi gli `angular.json`
  copiano già asset da dentro un submodule (`map-core/src/assets` → `map-core/assets`), e
  `meta.component.ts:50` che costruisce l'URL del tema **è già in wm-core**, quindi condiviso.
  Servirebbe una cartella di temi in wm-core e una riga di `assets` per prodotto.
  **Non è stato fatto in questo ciclo**: un file unico non renderebbe identici i due prodotti
  finché il contenitore della webapp non è allineato, perché l'`order` agisce sul contenitore
  flex e lì è diverso. Il dev ha deciso di valutarlo più avanti, eventualmente con un ticket
  dedicato.

- **Il criterio di QA su `config_detail` non è stato eseguito, e non era eseguibile**: il
  campo esiste solo sullo shard dev di Cammini d'Italia (POI «Santa Barbara», due blocchi
  popolati). Su geohub e sulle app FIE, dove è stato fatto il QA, la lista è vuota e
  l'accordion non compare. Era uno dei tre casi manuali approvati dal dev: resta scoperto,
  non superato.

- Ripristinare `environment.ts`.
- Riallineare `node_modules` all'`overrides` di `package.json` e ripetere la build di
  produzione, per chiudere il requisito rimasto scoperto.
- Bump del pin dei submodule (wm-core, wm-types) da fare **dopo** il merge delle rispettive
  PR, non prima: un pin che punta a un commit non mergiato rende il pannello di dettaglio
  vuoto per chiunque faccia checkout.
- Ordine di merge: wm-types → wm-core → webmapp-app. Poi la fase C su wm-webapp.
