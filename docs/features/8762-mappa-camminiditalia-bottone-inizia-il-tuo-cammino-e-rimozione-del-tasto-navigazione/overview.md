> Ticket: oc:8762

# Mappa camminiditalia: bottone «Inizia il tuo cammino»

## Cosa cambia

Nell'app camminiditalia, sulla pagina mappa, compare in basso al centro un bottone con testo
«Inizia il tuo cammino» che apre direttamente il pannello di registrazione della traccia, senza
passare dal menu del fab di registrazione. Il resto della mappa non cambia: fab «locate» con
orientamento e navigazione, fab di registrazione con traccia e POI. Per farlo la pagina mappa
ottiene una variante camminiditalia che cambia solo il template, con la logica comune spostata in
una classe base condivisa; la logica del bottone sta in un componente standalone a parte.

## Perché

Il cliente vuole che l'app spinga a registrare il cammino, perché le tracce registrate saranno la
prova per convalidare automaticamente le tappe del passaporto (call del 12/10/2026, dal dossier del
tag: Giuseppe «lo possiamo mettere da sempre fisso nella mappa, inizia il cammino», «non sia un fab
button, ma che sia proprio un bottone», «inizia il tuo cammino, non inizia il cammino degli dei»).
È una delle tre modifiche da fare prima del rilascio in produzione del passaporto previsto in
settimana.

## Requisiti

- [ ] **Classe base**: la logica di `MapPage` si sposta in `core/src/app/pages/map/map.page.base.ts`,
  classe astratta decorata con `@Directive()` (serve perché erediti constructor e `@ViewChild`),
  mai soggetta a `fileReplacements`. `map.page.ts` (default) e `map.page.camminiditalia.ts` la
  estendono, con lo stesso nome di classe `MapPage` e lo stesso selettore, e definiscono solo
  `@Component`: la variante non aggiunge logica né dipendenze. Nessuno dei due figli importa
  l'altro.
- [ ] **Estrazione e variante in due commit separati**, revertibili ciascuno da solo: prima
  `refactor(oc:8762)` con la sola classe base, verificato con `ng build` di default e prova a mano
  della mappa su uno shard di default; poi `feat(oc:8762)` con variante e bottone.
- [ ] **URL dei tile carg in un punto solo**: `overlayXYZ` diventa una costante della classe base,
  letta da entrambi i template; `CLAUDE.md` e `.claude/rules/download-offline.md` citano
  `map.page.base.ts` al posto di `map.page.html`.
- [ ] **Default invariato**: per tutti gli altri shard la mappa resta identica, nel template e nel
  comportamento.
- [ ] **Variante camminiditalia**: `map.page.camminiditalia.ts` con template
  `map.page.camminiditalia.html`, copia del template di default più il bottone. La voce
  `fileReplacements` si aggiunge alla configuration `camminiditalia` sotto `build` in
  `core/angular.json`; `serve` la eredita da `buildTarget: app:build:camminiditalia`.
- [ ] **Componente bottone**: `webmapp-btn-start-walk`, standalone, in
  `core/src/app/components/shared/buttons/btn-start-walk/`, accanto a `btn-track-recording`. È un
  `ion-button` con testo (non un fab); il template camminiditalia lo monta in basso al centro,
  fuori da `<div bottom-right>` (il CSS di `register-panel-enabled` individua i fab con
  `nth-last-child`), posizionato dalla pagina: lo slot `bottom-center` di `wm-map` non è inoltrato
  da `wm-geobox-map`.
- [ ] Il tocco, da loggato, fa `setEnableTrackRecorderPanel({enable: true})`, come il fab.
- [ ] **Utente non loggato**: il tocco apre il login; se il login riesce si apre subito il pannello
  di registrazione, senza un secondo tocco; se il login viene chiuso senza entrare non succede
  nulla. `LoginComponent` chiude la modale senza dati in entrambi i casi, quindi a
  `onDidDismiss` il bottone rilegge `isLogged` dallo store (`take(1)`) e fa il dispatch solo se è
  true. Vale solo per il bottone nuovo: il fab di `btn-track-recording` resta com'è.
- [ ] **Visibilità**: il bottone si nasconde se vale almeno una condizione fra dettaglio in `full`,
  `enableRecorderPanel$` (registrazione di traccia o di POI), `showDownload$` (pannello di download
  della traccia), download dei tile attivo, registrazione non abilitata dalla config
  (`isTrackRecordingEnable$` false).
- [ ] **Pannello di dettaglio**: il bottone sale con gli stessi offset fissi per stato già usati dal
  bottone rec del recorder in `map.page.scss` (`onlyTitle` 110px, `open` 357px); in `open`
  l'altezza del pannello è sempre 320px, perché `computeTargetHeight` usa 320 come minimo e come
  massimo.
- [ ] **Prova di stile**: prima della rifinitura, due o tre varianti del bottone (pillola smussata o
  tonda, con o senza icona di registrazione), partendo dallo stile dei bottoni già presenti
  nell'app; sceglie il dev.
- [ ] Testo «Inizia il tuo cammino» aggiunto in tutti e 7 i file di
  `wm-core/localization/i18n/` (it, en, de, fr, es, pr, sq), con chiave = testo italiano.
- [ ] **Regola e conoscenza aggiornate**: in `.claude/rules/file-replacements.md` il divieto «Non
  estrarre una classe base in un terzo file» si sostituisce con un criterio: classe base quando la
  variante non duplica logica (cambia solo il template, o sovrascrive un campo o un metodo e
  aggiunge il resto: search-bar, ugc-box, map.page); file intero duplicato quando la logica
  diverge in più punti (home, profile). Si aggiunge la trappola dei due template della mappa da
  tenere allineati a mano. `docs/knowledge/temi-e-varianti-di-shard.md` registra il perché, con i
  tentativi scartati e le scelte opposte, e sposta il divieto in «Come ci siamo arrivati».
- [ ] **Verifica**: `ng build` riuscita con la configuration di default e con `camminiditalia`;
  spec Karma su `btn-start-walk` (non loggato → login riuscito → dispatch; login chiuso → nessuna
  azione), con la sua cartella aggiunta a `core/tsconfig.spec.json` e a `test.include` in
  `core/angular.json`; prova a mano con `ng serve` su camminiditalia e su uno shard di default (mappa e fab
  identici a prima); prova su dispositivo di posizione rispetto a tab bar e safe area.
- [ ] [UX] Area toccabile alta almeno 44px, testo in contrasto sul colore del bottone, margine dalla
  safe area inferiore e dalla tab bar, nessuna sovrapposizione con i fab a destra e con
  l'attribuzione della mappa.
- [ ] [UX] Il testo non si tronca nelle lingue più lunghe (de, fr): una riga sola
  (`white-space: nowrap`), larghezza adattiva entro un massimo.

## Rischi

- **Contrasto con la regola del repo**: la regola registra due tentativi di classe base scartati
  (home, profile), ma nel frattempo due eccezioni sono già entrate (`SearchBarBaseComponent`,
  `UgcBoxBaseComponent` di oc:8764). Mitigato riscrivendo regola e conoscenza nello stesso ticket.
- **Rottura della mappa per gli altri shard**: lo spostamento di 445 righe in una classe base può
  cambiare il comportamento del default, e sulle app native il ritorno indietro passa dagli store
  (giorni). La CI builda solo il default (`preview.yml`, `deploy_prod.yml`), mai la variante.
  Mitigato con l'estrazione in un commit a sé, verificata da sola, e con la build `camminiditalia`
  fatta a mano prima del commit della variante.
- **Login senza esito**: `LoginComponent` chiude la modale senza dati, quindi leggere l'esito da
  `onWillDismiss` come fa il fab dà sempre `undefined`. Mitigato rileggendo lo store.
- **Spec non eseguiti**: `tsconfig.spec.json` include solo alcune cartelle, e Karma non applica
  `fileReplacements`. Mitigato testando un componente a parte e aggiungendone la cartella agli
  include.
- **Import circolare**: se la variante importasse da `map.page.ts`, `fileReplacements` la farebbe
  puntare a se stessa (`TS2506`). La base sta in `map.page.base.ts`.
- **Template duplicato**: il template camminiditalia è una copia di quello di default; una modifica
  futura a `map.page.html` va riportata a mano nella variante. Registrato fra le trappole.
- **Aspettativa del cliente**: nella call si è chiesto di togliere la navigazione, che invece
  resta; il dev valuterà durante il lavoro se togliere dei bottoni.
- **Deploy web**: la variante vale solo con la configuration `camminiditalia` e con il suo script
  di deploy (`deploy-to-web-camminiditalia`); il deploy generico resta senza `--configuration`.
- **`ng serve`**: dopo aver cambiato shard in `environment.ts` serve riavviare il server.
- [UX] Con fab a destra e bottone al centro, su schermi stretti lo spazio in basso è poco (circa
  15px di margine a 360px di larghezza).

## Out of scope

- Togliere il tasto di navigazione dal fab «locate»: resta com'è, salvo diversa valutazione del dev
  durante il lavoro.
- Riaccendere il tasto «centra posizione» (`wm-btn-center-position`, oggi `*ngIf="false"`).
- Riprendere la registrazione dopo il login anche dal fab di `btn-track-recording`: da proporre come
  ticket a parte.
- Togliere il fab di registrazione: per ora resta.
- Form diverso al salvataggio della traccia («racconta la tua esperienza»): è un'altra macro area
  del tag.
- Rendere configurabile il bottone per altri shard.

## Moduli toccati

**webmapp-app**

- `core/src/app/pages/map/map.page.base.ts` (nuovo, logica comune, flag `showStartWalk`, costante
  `overlayXYZ`)
- `core/src/app/pages/map/map.page.ts` (estende la base)
- `core/src/app/pages/map/map.page.camminiditalia.ts` e `map.page.camminiditalia.scss` (nuovi)
- `core/src/app/pages/map/map.page.html` (`overlayXYZ` dalla costante, blocchi sotto
  `showStartWalk`), `map.module.ts` (import dei due componenti standalone)
- `core/src/app/components/shared/buttons/btn-start-walk/` e `btn-add-poi/` (nuovi: componente,
  spec)
- `core/src/app/components/shared/buttons/btn-track-recording/` (login con ripresa dell'azione,
  spec nuovo)
- `core/src/app/components/track-recorder-component/track-recorder.component.ts` (pannello ridotto
  al titolo solo se aperto)
- `core/src/app/functions/login-if-needed.ts`, `minimize-open-map-details.ts` e spec (nuovi)
- `core/angular.json` (`fileReplacements` sotto `build` della configuration `camminiditalia`,
  `test.include`), `core/tsconfig.spec.json`
- `CLAUDE.md`, `.claude/rules/download-offline.md`, `.claude/rules/file-replacements.md`
- `docs/knowledge/temi-e-varianti-di-shard.md`, `registrazione-traccia.md`,
  `download-offline-carg.md`

**wm-core** (submodule) — overview a parte in `docs/features/<stesso slug>/`

- `localization/i18n/{it,en,de,fr,es,pr,sq}.ts`
