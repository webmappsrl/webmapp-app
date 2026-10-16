> Ticket: oc:8762

# Notes — Mappa camminiditalia: bottone «Inizia il tuo cammino»

## Divergenze dal piano, task per task

### Task 1: estrazione della classe base

- La «prova a mano su uno shard di default» non è stata fatta durante l'esecuzione: è passata alla
  review del dev, insieme alle altre prove a mano. Build di default e test (70/70) sono stati
  verificati subito dopo l'estrazione.
- Oltre a `CLAUDE.md` e `download-offline.md`, è stata aggiornata anche
  `docs/knowledge/download-offline-carg.md`, che descriveva l'`overlayXYZ` come hardcoded nel
  template e lo stub `downloadOverlay` in `map.page.ts`.

### Task 2: componente e traduzioni

- Lo spec usa `TestBed.runInInjectionContext` invece dell'istanza diretta con spy di
  `map-details.component.spec.ts`: il componente prende le dipendenze con `inject()`, che richiede un
  contesto di injection.
- La pipe di traduzione entra con `WmPipeModule`, non con `WmTransPipe` diretta, perché la pipe non è
  standalone.
- Traduzioni portoghese e albanese allineate al registro dei file: `pr` è portoghese europeo
  («Começa o teu caminho»), `sq` usa «rrugë» come gli altri testi del passaporto («Fillo rrugën
  tënde»).

### Task 3: variante camminiditalia

- Il controllo «variante compilata» conta il tag `<webmapp-btn-start-walk>` nel template, non la
  stringa del selettore: la build di sviluppo include gli SCSS nelle sourcemap, quindi il selettore
  compare in entrambi i bundle. Il tag del template compare solo nel bundle `camminiditalia`.
- Il contenitore del bottone ricalca `.wm-map-tiles-download-button` (stessa colonna centrale,
  `bottom: 40px`, transizione su `bottom`), con `padding: 0 60px` per lasciare libera la colonna dei
  fab e `pointer-events: none` sul contenitore, così la mappa resta trascinabile ai lati.

### Task 4: prova di stile

- Le varianti non sono state fatte nell'app ma come prototipi su una tavola di design (quattro
  telefoni con la mappa: smussato, pillola con icona, pillola senza icona, pillola arancio scurito).
  Il dev ha scelto la **B**: pillola tonda, icona di registrazione, arancio del tema, testo bianco.
  Lo stile è stato applicato direttamente nel Task 2.

### Review formale (13/10/2026)

Esito della `wm-review-ticket`: DA CORREGGERE, con tutti i punti corretti nello stesso giro.

- **Bottone sopra la striscia delle card** (bloccante): `wm-features-in-viewport` compare alle
  stesse condizioni del bottone e occupa 38–140px dal fondo; toccando la card centrale partiva la
  registrazione. Ora con `.move-bottom` a pannello chiuso il bottone sale di 116px insieme alla
  colonna dei fab (verificato in headless: centri a 700px, poi a 584px tutti e due).
- **Comandi di commit del piano** (bloccante): non comprendevano i file nati dopo il piano, e il
  commit della feature non avrebbe compilato. Aggiornati in `plan.md`.
- **Template unico**: `map.page.camminiditalia.html` è stato tolto; la variante accende il flag
  `showStartWalk` di `MapPageBase` e i due blocchi stanno in `map.page.html`. Supera la divergenza
  del Task 3 sopra.
- **Stili nella variante**: tutto ciò che riguarda il bottone è passato da `map.page.scss` (tornato
  identico a `Passaporto`) a `map.page.camminiditalia.scss`, negli `styleUrls` della sola variante,
  con variabili commentate al posto dei numeri copiati (offset del recorder, durata
  dell'animazione, spostamento delle card).
- **Helper spostati** in `src/app/functions/` (`login-if-needed.ts`,
  `minimize-open-map-details.ts`): li usano componenti di cartelle diverse.
- **Fab di default**: `btn-track-recording` usa ora `loginIfNeeded()`, quindi anche sugli altri
  shard il login riuscito apre il pannello senza un secondo tocco; l'`@Input isLogged` e il binding
  in `map.page.html` sono stati tolti. Il follow-up registrato sotto è chiuso.
- **Spec**: `fakeAsync` + `flushMicrotasks` invece di contare i microtask; lo spec del bottone non
  conosce più il selettore interno dell'helper. Nuovo spec per `btn-track-recording`.
- Documentazione allineata: regola sulla variante della mappa (flag invece di due template), voce su
  `pages/poi/`, pagine di conoscenza, righe di `CLAUDE.md`, moduli toccati dell'overview.

## Bug trovati

- **Il pannello di dettaglio si apriva all'avvio della registrazione anche se era chiuso** (bug
  preesistente, corretto qui su richiesta del dev): `recordStart()` e `resume()` del recorder
  dispacciavano `setMapDetailsStatus({status: 'onlyTitle'})` senza guardare lo stato, e da
  `background` il pannello passava a `onlyTitle`, cioè compariva. Ora i tre punti (recorder e bottone
  nuovo) passano da `minimizeOpenMapDetails()`, che riduce al titolo solo `open` e `full`. La
  cartella `track-recorder-component` è stata aggiunta agli include dei test.
- In console, sulla mappa: `TypeError: Cannot read properties of undefined (reading 'un')` dal
  setter `enabled` di `WmMapDrawUgcPoiDirective` in `map-core`, che chiama `this.mapCmp.map.un(...)`
  prima che la mappa esista. Preesistente, non toccato.
- `npm run lint` è rotto nel repo, indipendentemente da questo lavoro: con ESLint 9.39 non trova
  `eslint.config.js`, e in modalità legacy non risolve `plugin:@angular-eslint/ng-cli-compat`.
- `.claude/rules/download-offline.md` dice che `pages/poi/utils.ts` è importato da `map.page.ts`, ma
  nessun file del repo importa più `pages/poi/`: la voce è superata, non toccata qui.

## Decisioni

- **Navigazione mantenuta**: il dev ha deciso di non togliere il tasto navigazione dal fab «locate»;
  valuterà durante il lavoro se togliere dei bottoni. Il titolo del ticket va allineato a fine
  lavoro.
- **Ripresa dopo il login** prima solo nel bottone nuovo; nella review formale estesa anche al fab di
  `btn-track-recording`, per tutti gli shard.
- **Contrasto accettato**: il testo bianco sull'arancio del tema (`#ef7821`) ha un contrasto di circa
  2,9:1, sotto il minimo WCAG; il dev ha scelto comunque la variante B con il colore del tema.
- **Modifiche chieste dal dev alla review** (dopo l'approvazione del piano):
  - la registrazione **parte subito**, senza lo «scorri per registrare» del recorder: il bottone fa
    ciò che fa `recordStart()` allo sblocco di `wm-btn-rec` (`startRecording()`, dettaglio in
    `onlyTitle`) e poi apre il pannello. Supera il requisito dell'overview «il tocco fa
    `setEnableTrackRecorderPanel`, come il fab»; il fab resta con lo slider;
  - icona `analytics-outline`, la stessa del fab «traccia», al posto di `icon-outline-recording`;
  - bottone più basso: 36px invece dei 44px del requisito [UX] sull'area toccabile;
  - **fab di registrazione sostituito** nel solo template camminiditalia: il fab che si apriva su
    traccia e POI (`#fab3` con `wm-btn-track-recording`) diventa un fab singolo che crea un POI
    (`webmapp-btn-add-poi`), perché la traccia parte ora da «Inizia il tuo cammino». Anche il fab del
    POI riprende l'azione dopo il login; la logica «login se serve» sta in
    `components/shared/buttons/login-if-needed.ts`, usata dai due bottoni;
  - **allineamento**: il centro del bottone è allineato a quello del fab del POI, misurato in Chrome
    headless a 390×844 (prima 729px contro 700px, dopo 700px entrambi). Il contenitore passa da
    `bottom: 40px` a `69px`, senza `env(safe-area-inset-bottom)`, che la colonna dei fab non usa.
  - **passaggio a `full`**: il bottone sfumava in 0,3s scendendo, e si vedeva sopra il pannello che
    si alzava. Il pannello (`ion-card`) non ha uno z-index proprio, e mandare il bottone dietro
    avrebbe voluto dire cambiare lo stacking di un pannello condiviso; quindi in `full` il bottone
    sparisce all'istante (`visibility: hidden`, `transition: none`) e resta all'altezza di `open`, e
    uscendo da `full` ricompare dopo i 250ms di `DETAILS_ANIMATION_DURATION`. Verificato in headless
    applicando le classi di stato: nascosto da subito in `full`, ancora nascosto a 150ms dal ritorno
    in `open`, visibile a 800ms.
- **Node 22 per la build**: la Angular CLI del repo richiede Node ≥ 20.19; con il Node 18 attivo di
  default `ng build` si ferma subito.
- Tag Orchestrator saltati su richiesta del dev.
- **Call del 14/10**: il testo diventa «Inizia il cammino», senza «tuo» («il tuo è sottinteso» e
  si guadagna spazio); l'icona resta, decisa a voto.
- **Traduzioni spostate da wm-core all'app**: il piano le metteva in
  `wm-core/localization/i18n/`, ma il bottone esiste solo nell'app, e le traduzioni vanno nel repo
  dove sta il codice che le usa. Ora la chiave `'Inizia il cammino'` sta in fondo ai 7 file di
  `core/src/assets/i18n/`, come la voce «Passaporto» di oc:8703; in wm-core il commit `585f2a19`
  va annullato.

## Follow-up

- ~~Ripresa dopo il login anche nel fab di `btn-track-recording`~~: fatta nella review formale.
- Valutare con il cliente la rimozione del tasto navigazione, chiesta nella call del 12/10.
- Il lint del repo va riportato in funzione (migrazione a `eslint.config.js`).
