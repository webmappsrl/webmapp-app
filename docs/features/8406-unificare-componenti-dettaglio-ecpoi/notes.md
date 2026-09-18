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
