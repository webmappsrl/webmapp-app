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

## Le sei strutturali restano solo mobile

Erano cinque nel conteggio iniziale: mi era sfuggita `ion-card-content:has(wm-image-detail)`. Sono
`wm-map-details > ion-card`, `wm-map-details::after` e i **quattro** `ion-card-content:has(...)`
(`wm-track-properties`, `wm-home-layer`, `wm-poi-properties`, `wm-image-detail`).

Nessuna è stata tradotta, e la decisione è sul contenuto, non sul nome:

- **`> ion-card`** ha `padding-bottom: 90px` per la tab bar, che la webapp non ha, e azzera i
  padding laterali di `ion-card`, che sulla webapp non esiste.
- **`::after`** disegna la linguetta bianca arrotondata *sopra* il pannello, a `top: -10px`. Il
  contenitore della webapp è a `top: 0` e si apre in larghezza invece di scorrere dal basso: non
  esiste un «sopra il pannello» dove disegnarla. Non è una scelta estetica, è inapplicabile.
- **I quattro `:has(...)`** compensano l'altezza di `ion-card-content` a seconda di cosa contiene
  (`+24px`, `+70px`, `+14px`, `+70px`): sono correzioni al padding di Ionic. Il contenitore della
  webapp ha un'altezza propria da `--wm-poi-popup-top`, quindi sommarci quei valori darebbe
  overflow.

Verificato che tutti e quattro i `:has(...)` sono vivi sulla mobile: `:has(wm-track-properties)`
vale 1 col percorso aperto, `:has(wm-poi-properties)` 1 col POI, e così gli altri.

## Dove stanno i temi, dopo questo lavoro

I nove file sono passati da `core/src/theme/<shard>/` a
`wm-core/projects/wm-core/src/assets/theme/<shard>/`, pubblicati da entrambi i prodotti con una
voce di `assets` in `angular.json`. Di conseguenza sono state riallineate le indicazioni che
puntavano al percorso vecchio: la riga del `CLAUDE.md`, la pagina
[temi-e-varianti-di-shard](../../knowledge/temi-e-varianti-di-shard.md) — dove anche la ricetta
per cercare i selettori orfani cercava in una cartella ormai vuota, quindi restituiva zero — e in
`wm-core` la pagina `varianti-per-shard`, che diceva ancora «il file non sta qui» contraddicendo
il README messo accanto ai file.

## Rettifiche all'overview — 28/09/2026

`docs/features/` è immutabile, quindi l'`overview.md` resta com'era: queste righe dicono dove non
corrisponde più al lavoro concluso. Sono emerse dal confronto fra i due cantieri, che si
contraddicevano a vicenda.

**«Solo modifiche CSS: nessun file di `wm-core` o dell'app toccato» (`overview.md:32`) è falso.**
Era vero quando è stato spuntato, non alla fine. Sotto oc:8613 in `wm-core` sono stati modificati
`projects/wm-core/src/track-properties/track-properties.component.scss` (l'`order: 100` sullo slot
`[bottom]`, commit `623bc318`) e aggiunto `scripts/check-themes.js`; in questo repo `core/angular.json`,
`core/package.json`, i due `deploy-to-web-*.js`, `.github/workflows/preview.yml`, `gulpfile.js` e
`core/src/assets/icons/webmapp-icons/style.css`. **Conseguenza pratica**: chi legge l'overview per
stimare il raggio d'impatto conclude che nessun componente condiviso è stato toccato e salta la
verifica di regressione su `wm-track-properties`, che invece serve.

**«Condividere i temi fra i due prodotti: rimandata dal dev» (`overview.md:51-53`) è stato poi
fatto**, durante questo stesso ticket. I nove file vivono ora in `wm-core`. Per lo stesso motivo la
voce nei Follow-up qui sotto che li dava ancora «rimandati» è superata dalla sezione «Dove stanno i
temi, dopo questo lavoro».

**«Moduli toccati» (`overview.md:57-61`) elenca un solo file**, `core/src/theme/geohub/75.css`, a un
percorso che non esiste più. L'elenco completo è quello del primo punto. **Conseguenza pratica**: un
rollback guidato da quella tabella lascerebbe `core/angular.json` a puntare a una cartella vuota e
il `prebuild` a invocare uno script assente, cioè una build che si ferma senza un motivo leggibile.

**Le regole del titolo delle Ville sono cinque, non quattro.** Il conteggio a `notes.md:95` ne
elencava quattro perché ne mancava una scritta su più righe. Precisamente: **cinque blocchi, quattro
selettori distinti** — `.webmapp-info-header-container > ion-label` compare due volte con lo stesso
selettore, e la quinta è
`wm-map-details ion-card:has(wm-poi-properties) ion-card-header .webmapp-info-header-container > ion-label`.
Restano inerti e **restano in attesa della decisione del dev**: le due baseline — il codice prima di
oc:8406 e la produzione — divergono, e non è una cosa che la misura possa decidere.

## Rettifica alla forma additiva — 28/09/2026

Nel commit `492c4ea`, nel commento dentro il tema e qui sopra avevo scritto che la forma additiva
lascia la resa invariata «per costruzione». **Vale solo per metà, ed è la metà meno interessante.**

- Il ramo mobile è identico al byte, quindi **su mobile non cambia niente**: questo resta vero.
- I due rami **non sono equivalenti fra loro**: `.details-container` è una classe,
  `wm-map-details` un elemento, quindi ogni ramo webapp ha una classe in più e vince contesti che
  il ramo mobile perde. La riscrittura non avvicina i due prodotti quanto la frase suggeriva.

Il caso che lo dimostra, trovato durante il controllo visivo dall'agente della webapp e
riverificato qui — la copertina della scheda del layer:

    .details-container wm-home-layer wm-img img   (0,1,3)  vince sul componente
    wm-img .wm-img-image                          (0,1,1)  img.component.scss:17
    wm-map-details wm-home-layer wm-img img       (0,0,4)  perde

Sulla webapp la copertina è ora davvero `display: none`; qui resta `block` e non si vede soltanto
perché il contenitore è alto 0. Non è un difetto — sulla webapp il tema ottiene ciò che dichiara —
ma è una divergenza **introdotta dalla nostra riscrittura**, perché prima quel ramo non esisteva.

Non si corregge: vale la regola che una regola inerte non è un difetto da riparare, e la baseline
è lo stato attuale. Se un giorno si decide di riallinearla, il modo è prendere di mira la classe,
come fa già `forestasuat/1.css` con `.wm-img-image` alle righe 273 e 336.

## Due numeri dell'audit da correggere — 28/09/2026

`.sketchfab-embed-wrapper` e `.sketchfab-embed-wrapper iframe` erano classificati fra i cinque
«componenti che non compaiono mai». Il POI 42323 ha un embed 3D, le due regole agganciano e
applicano (`height: 480px`, `iframe` con un bersaglio). **I non raggiungibili sono 30, non 32.**

La morale conta più del numero: quei cinque erano stati classificati percorrendo **16 stati**
dell'interfaccia, ma nessuno di quegli stati aveva il dato giusto. Percorrere gli stati non basta
se il contenuto non li popola — e «non l'ho mai visto» non è «non esiste».

## Il numero dei raggiungibili è un limite superiore — 28/09/2026

L'audit classificava i 209 selettori in «raggiungibili» e «non raggiungibili» contando i bersagli
con `querySelectorAll`. **Quel conteggio dice se il selettore trova qualcosa, non se la
dichiarazione vince.** Le categorie sono tre, non due:

| | |
|---|---|
| nessun bersaglio | il selettore non corrisponde a niente nel DOM |
| aggancia e **applica** | `.sketchfab-embed-wrapper`: `height: 480px` dichiarata e resa |
| aggancia e **perde** | `wm-tab-detail` nel tema 33: `margin-top: 15px` dichiarati, 24px resi |

Quindi **168 è un limite superiore dei selettori con bersaglio**, non un conteggio di regole
efficaci. Quante altre siano nel terzo stato non è noto senza rimisurare confrontando, per ogni
selettore, il valore dichiarato con `getComputedStyle` sulla proprietà dichiarata.

## Una regressione silenziosa durata quattordici mesi — 28/09/2026

Il caso che ha fatto emergere la terza categoria, trovato durante il controllo visivo sull'app 33
e datato insieme all'agente della webapp. Il tema dichiara `wm-tab-detail { margin-top: 15px }`; il
valore reso è 24px.

    tema 33      wm-tab-detail   margin-top: 15px                          (0,0,1)
    componente   wm-tab-detail   margin: var(--wm-feature-details-margin)  (0,0,1)

Stessa specificità, e il CSS del componente Angular è iniettato **dopo** il foglio statico del
tema: a parità vince l'ultimo. La variabile vale `24px 6px 24px 6px`, quindi lo shorthand riscrive
anche `margin-top`.

La cronologia, verificata sui due repo:

    18/10/2024   21d1296c   il tema insegue la rinomina del componente,
                            `webmapp-track-technical-data` → `wm-tab-detail`.
                            Lo stesso commit cancella quel componente (226 righe).
                            Da qui il selettore aggancia e i 15px si vedono.
    06/02/2025   a111219d   oc:4837 aggiunge in wm-core
                            `wm-tab-detail { margin: var(--wm-feature-details-margin) }`.
                            Da qui i 15px smettono di vedersi.
    25/09/2026   5d27b56    il tema si sposta in wm-core.

**Quattordici mesi, e nessuno se n'è accorto.** Non è una regressione di oc:8406 — l'audit lo
conferma — ma è la dimostrazione migliore che abbiamo del perché questi fogli vanno ricontrollati
a mano dopo un refactor: meglio dei due casi di Ville, perché qui il danno è durato un anno.

Nota per chi rifà la verifica: nell'ottobre 2024 il tema stava in `src/theme/33.css`, **senza** la
cartella dello shard. Cercando `21d1296c` nel percorso di oggi non risulta, e sembra che il commit
non c'entri.

## Follow-up

- **La regola di wm-core che ha causato il secondo difetto resta invariata**: presuppone che
  `--wm-feature-details-margin` sia valorizzata. Oggi solo il 75 la azzera, quindi non urge, ma
  qualunque tema futuro che faccia lo stesso avrà lo stesso problema.
- **`wm-phone`/`wm-email` e l'effect delle indicazioni** restano difetti noti di wm-core fuori
  dallo scope di un ticket di soli CSS.
- **Temi condivisi fra i due prodotti**: valutazione rimandata dal dev. I numeri e la fattibilità
  stanno nelle note di oc:8406.
