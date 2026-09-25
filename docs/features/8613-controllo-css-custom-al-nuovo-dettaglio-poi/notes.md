> Ticket: oc:8613

# Notes — Controllo CSS custom al nuovo dettaglio POI (webmapp-app)

Il *perché* duraturo sta in
[docs/knowledge/temi-e-varianti-di-shard.md](../../knowledge/temi-e-varianti-di-shard.md),
sezione «La trappola degli override di tema», dove i due casi di questo ticket sono stati
aggiunti accanto a quello di oc:8305. Qui resta la cronaca.

## Deviazioni dal piano

- **Non c'era un piano.** Il lavoro è partito da una segnalazione in QA — «le Informazioni sono
  sotto al nome e non va bene» — e il `plan.md` è una registrazione a posteriori, dichiarata
  come tale in testa al file.

## Bug trovati

- **Quattro selettori del tema 75 scollegati dal refactor di oc:8406.** Il più grave era
  `wm-feature-useful-urls`, diventato `.wm-poi-properties-contacts`: senza la sua regola il
  blocco perdeva `order: 9` e, valendo 0, risaliva **sopra tutti gli altri**, comparendo sotto
  il titolo. Aveva perso anche i propri stili, perché altre quattro regole puntavano allo stesso
  wrapper morto.

- **La spaziatura sotto la linea di separazione, sparita per una catena di due cose ragionevoli.**
  `75.css` dichiara `--wm-feature-details-margin: 0px !important`: su quell'app lo spazio lo dà
  il `padding` di ciascun blocco, non il margine comune. Il commit `671d4ed` di oc:8406 ha tolto
  all'HTML incorporato il padding proprio spostando lo spazio su quel margine — neutro ovunque,
  **tranne dove il margine è azzerato**. Risultato: il riquadro attaccato alla linea.

- **Un orfano preesistente nel dettaglio traccia**: `wm-track-properties wm-tab-audio`, mentre il
  componente è `wm-track-audio`. Non causato da oc:8406 — quel selettore non ha mai agganciato
  nulla. Corretto perché identico agli altri e a costo zero.

## Decisioni

- **`wm-config-detail` lasciato senza `order`**, su indicazione esplicita del dev: non esisteva
  quando il tema è stato scritto e non sarà presente su questa app. Ha altezza 0, quindi sta in
  cima senza spostare nulla. Se un domani venisse popolato qui, comparirebbe nel posto sbagliato.

- **`wm-tab-detail` (`order: 8`) lasciato invariato**: non è montato nel dettaglio POI, la regola
  è inerte. Rimuoverla avrebbe cambiato la struttura del tema, che il dev ha chiesto di mantenere.

- **`!important` sulla spaziatura, dopo una verifica e non per riflesso.** Il primo tentativo
  senza non funzionava: la regola c'era nel file servito ma non si applicava. La regola del tema
  e quella del componente hanno la **stessa specificità** (una classe e due tag entrambe), e il
  CSS del componente Angular è iniettato **dopo** il foglio statico, quindi a parità vinceva lui.

- **Fix nel tema e non in wm-core**, su richiesta del dev («solo modifiche CSS»). L'alternativa —
  rivedere la regola del ritmo verticale perché non presupponga quella variabile — resta la
  correzione alla radice, ma tocca un componente condiviso.

## Falsi allarmi, registrati perché non si ripercorrano

- **«Ottieni indicazioni non funziona più».** Non era una regressione. L'effect
  `startGetDirections$` (`user-activity.effects.ts:351`) mette `onLocationChange$` dentro un
  `withLatestFrom`, che non emette finché **tutte** le sorgenti hanno emesso: senza
  geolocalizzazione attiva l'effect non parte, e il ramo `if (poiFirstCoords)` — che della
  posizione non ha bisogno — non viene mai raggiunto. `git blame`: riga del **13/01/2026**,
  nessun commit di oc:8406 la tocca. Verificato che **anche la produzione si comporta così** con
  il permesso non concesso. Il dev ha poi attivato la localizzazione e il pulsante ha funzionato.
  Resta un difetto reale, non nostro: per i POI quella dipendenza è inutile.

- **«Sulla mobile manca tutto il corpo del dettaglio»**, segnalato dall'agente della webapp. Il
  corpo era completo: la misura era stata presa mentre il pannello era montato ma ancora
  collassato. Succede anche a me: la prima query dava `wm-poi-properties` assente, la seconda un
  pannello alto 0, e solo dopo qualche secondo il contenuto. **Misurare il DOM del pannello senza
  attendere il mount produce falsi negativi.**

## La misura dei selettori del tema 75

Prima di riscrivere le regole prefissate con `wm-map-details` serviva sapere quali agganciano
davvero qualcosa. Misurato il 25/09/2026 sulla mobile in locale, app 75, tema servito
(26.771 byte), percorrendo **16 stati distinti** dell'interfaccia: home landing, lista dei layer,
vista layer nel pannello, schede Percorsi e Luoghi, dettaglio POI (chiuso ed espanso), galleria
immagini aperta, pannello filtri, filtro selezionato, dettaglio percorso, profilo, feature nel
viewport.

| | |
|---|---|
| Selettori distinti nel tema | 209 |
| Raggiungibili sulla mobile | 168 |
| Rami `.details-container`, inerti qui per costruzione | 9 |
| Non raggiungibili sulla mobile | 32 |

Dei 32: in **27 casi il contenitore esiste** e a non trovare riscontro è solo la parte finale del
selettore — sono regole scritte su una struttura che il componente non ha più. In **5 casi il
componente non compare mai** (`wm-related-pois-navigator`, `.wm-poi-properties-info`,
`.sketchfab-embed-wrapper`).

Casi che vale la pena nominare:

- **`ion-chip.ion-color-success` nei filtri, 4 regole.** Il chip selezionato oggi prende la classe
  `wm-active-filter`; `ion-color-success` non esiste più nel componente. Sono morte per un
  rename, non per il ticket.
- **`.webmapp-pagepoi-info-header-pre-title` e `-title`, più i due `.webmapp-info-header-container
  > ion-label`.** Sono le quattro regole del titolo delle Ville, congelate in attesa della
  decisione del dev: il contenitore `wm-map-details ion-card` c'è, la catena interna no.
- **`.sketchfab-embed-wrapper`** riguarda gli embed 3D: nessun POI dell'app li ha, quindi non è
  detto sia morta — è senza dato.

### Due errori di metodo, entrambi corretti durante la misura

- **`querySelectorAll` non aggancia mai uno pseudo-elemento.** Prova di controllo:
  `document.querySelectorAll('body::after')` restituisce `0` mentre `body` esiste. Le 14 regole con
  `::after`/`::before` risultavano tutte morte per artefatto dello strumento; rimisurate
  sull'elemento host, **12 su 14 sono vive**. Senza questo controllo il numero dei morti sarebbe
  stato gonfiato di un terzo.
- **Le tab di Ionic tengono montate più pagine insieme.** Un `wm-home-layer` trovato con una query
  globale può stare dentro `wm-home` (Esplora) e non dentro `wm-map-details`: verificato con
  `closest()`. Nello stato «layer aperto» i due mount point sono **vivi nello stesso momento** —
  ed è la prova diretta che il prefisso `wm-map-details` è portante e non decorativo.

Una terza premessa era sbagliata a monte: avevo dato l'app 75 per priva di layer. Ne ha **cinque**,
letti dalla `config.json` servita all'app in esecuzione. Il numero precedente dei non raggiungibili
si appoggiava a quella deduzione ed è stato buttato.

## Le 8 regole di contenuto rese condivise

Commit `492c4ea` in `wm-core`. Nove selettori (dieci occorrenze) hanno ora un secondo ramo
`.details-container`, il contenitore del dettaglio sulla webapp. La forma è **additiva**: il ramo
mobile resta identico al byte, e `.details-container` non è prodotta da nessun template della
mobile, quindi qui il nuovo ramo è inerte per costruzione.

Controprova dell'agente sulla webapp, app 75, `/map?layer=502`, con `getComputedStyle`: padding,
margini, `display: none`, dimensione e famiglia del titolo arrivano tutti al bersaglio, **senza
`!important` aggiuntivi** — i due rami hanno la stessa lunghezza di catena, quindi la specificità
non cambia.

Restano fuori le **cinque strutturali** (`> ion-card`, un `::after`, tre `:has(...)`): il dettaglio
della webapp è un `div` senza `ion-card`, quindi vanno tradotte, non estese.

## Follow-up

- **La regola di wm-core che ha causato il secondo difetto resta invariata**: presuppone che
  `--wm-feature-details-margin` sia valorizzata. Oggi solo il 75 la azzera, quindi non urge, ma
  qualunque tema futuro che faccia lo stesso avrà lo stesso problema.
- **`wm-phone`/`wm-email` e l'effect delle indicazioni** restano difetti noti di wm-core fuori
  dallo scope di un ticket di soli CSS.
- **Temi condivisi fra i due prodotti**: valutazione rimandata dal dev. I numeri e la fattibilità
  stanno nelle note di oc:8406.
