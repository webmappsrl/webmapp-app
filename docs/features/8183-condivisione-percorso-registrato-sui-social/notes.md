> Ticket: oc:8183

# Note di implementazione — semplificazione drastica (repo principale, webmapp-app)

Riferimento: `overview.md` in questa stessa cartella, riscritto alla terza revisione (fonte di
verità corrente). Questo documento **sostituisce integralmente** le note precedenti, che
descrivevano un approccio (plugin nativo Capacitor custom `wm-social-story-share` + mini-map
`WmUgcTrackShareMapComponent` in map-core + screenshot client-side) esplicitamente scartato dal
developer per un problema di WKWebView su iOS mai isolato — vedi "Perché" in `overview.md`. Chi mi
ha preceduto in questa sessione aveva già rimosso dal working tree tutto il codice di
map-core/plugin nativo legato a quell'approccio; questo giro di lavoro parte da lì e si limita a
riportare `share.service.ts`/`map.page.ts` a uno stato coerente col nuovo contratto, molto più
semplice.

## Cosa è cambiato rispetto all'approccio precedente

- **Nessuno screenshot generato lato client**: rimossi `_captureTrackScreenshot()`,
  `_resolveTileUrl()`, il mount dinamico via `createComponent()` di
  `WmUgcTrackShareMapComponent` (map-core — il componente stesso non esiste già più nel working
  tree, confermato con `find` prima di iniziare: nessun file `*ugc-track-share-map*` sotto
  `core/src/app/shared/map-core`).
- **Nessuna statistica calcolata lato client**: rimossa `_computeTrackStats()` e con essa l'unico
  uso di `GeoutilsService` in questo file — l'iniezione del servizio è stata rimossa dal
  costruttore. Il backend ora calcola durata/distanza/dislivello da `properties.locations` (vedi
  overview `wm-package`).
- **Nessun `app_id` nel payload**: il nuovo `shareTrackToStories()` invia solo `{uuid}`.
- **Nessun plugin nativo custom**: rimosso l'import `wm-social-story-share`
  (`WmSocialStoryShare.shareToInstagramStories`/`shareToFacebookStories`) e tutta la logica di
  fallback a cascata Instagram → Facebook → `Share.share()` generico. Ora si chiama **sempre e
  solo** `Share.share()` di `@capacitor/share` direttamente (non tramite il metodo `share()` di
  questa stessa classe — vedi nota sotto sul bug preesistente di quel metodo).
- **Payload di risposta atteso ora è `{immagine, shareUrl}`** anziché solo un PNG binario: il
  flusso non produce più un'immagine "usa e getta" ma anche un link pubblico (pagina Blade con OG
  tags lato backend, vedi overview `wm-package`), perché lo share è tornato ad essere generico
  (`Share.share()`) invece di un intent diretto Stories — per i canali che non aprono
  Instagram/Facebook Stories nativamente (es. WhatsApp), serve un URL con anteprima, non solo il
  file immagine.

## Assunzione sul formato di risposta del backend — **non ancora confermata contro il codice reale**

Ho implementato assumendo che `POST /api/share-story-image` risponda con **JSON**:

```json
{"image_base64": "...", "share_url": "https://..."}
```

**Verificato esplicitamente, e la conferma è negativa**: ho letto
`wm-package/src/Http/Controllers/Api/ShareStoryImageController.php` (repo BackEnd,
`/Users/peco/Documents/BackEnd/camminiditalia/wm-package/`) prima di scrivere il codice. Il
controller lì presente **riflette ancora la revisione precedente**, non quella semplificata:
- Accetta un payload `multipart/form-data` con `uuid`, `app_id` (opzionale), **`screenshot`**
  (file immagine, obbligatorio), `duration_seconds`, `distance_km`, `ascent_meters` — cioè
  esattamente il vecchio contratto che questo stesso lavoro di semplificazione elimina
  lato client.
- Risponde con **PNG binario puro** (`response($image->getEncoded(), 200, ['Content-Type' =>
  'image/png'])`), **nessun campo `share_url`/`shareUrl`** nella risposta — niente persistenza,
  niente pagina pubblica.
- Il commit che lo introduce (`45691a3d feat(oc:8183): endpoint compositing immagine Stories per
  condivisione percorso`) è già mergiato in `develop` di `wm-package`; l'`overview.md` di
  `wm-package` invece risulta **modificato ma non ancora committato** (`git status` mostra solo
  `overview.md` come modificato, working tree pulito per il resto) — cioè la riscrittura
  dell'overview alla terza revisione è già avvenuta, ma l'implementazione PHP che dovrebbe
  seguirla (nuovo servizio statistiche, nuovo servizio rendering mappa, persistenza Spatie, nuova
  route pubblica, endpoint semplificato `{uuid}`-only) **non è stata ancora scritta** al momento
  in cui ho controllato.

Questo è coerente con quanto atteso dal task: l'agente parallelo su `wm-package` sta lavorando
sulla stessa feature in questo stesso momento, e il suo lavoro non era ancora arrivato
all'implementazione quando ho verificato. Ho proceduto con l'assunzione JSON indicata (la più
semplice da consumare da `HttpClient` senza un secondo giro con `responseType: 'blob'` solo per
poter leggere il body di errore) esattamente come da istruzione esplicita, documentandola qui.

**Punto aperto — da riconciliare appena il backend reale è pronto**: verificare
- nome esatto dei campi (`image_base64`/`share_url` assunti qui, possono differire, es.
  `image`/`shareUrl` come scritto nell'overview stesso, che usa nomi diversi in punti diversi del
  documento — `{immagine, shareUrl}` nei Requisiti, `image`/`share_url` altrove);
- se la risposta è davvero JSON o torna a essere binaria con header custom per l'URL (l'overview
  di `wm-package` lascia esplicitamente aperta questa scelta: "formato esatto ... da definire in
  `plan.md`" — il `plan.md` di `wm-package` non esisteva ancora aggiornato al momento del check);
- formato/chiave del messaggio di errore per risposte 403/404/422/500 (assunto qui `{"error":
  "..."}`, coerente con il controller *attualmente* deployato, che usa quella chiave — ma
  potrebbe cambiare quando l'endpoint verrà riscritto).

Se il formato reale differisce, l'unico punto di modifica lato client è isolato:
`ShareStoryImageResponse` (interfaccia) e `_requestShareImage()`/`_extractBackendErrorMessage()`
in `share.service.ts` — nessun altro file dipende dalla forma esatta della risposta.

## File modificati

- **`core/src/app/services/share.service.ts`** — riscritto quasi per intero:
  - Rimossi: import `ApplicationRef`/`ComponentRef`/`EnvironmentInjector`/`createComponent`
    (`@angular/core`), `DEF_XYZ_URL` (map-core), `WmUgcTrackShareMapComponent`/
    `WmUgcTrackShareMapCaptureError` (map-core), `ICONTROLSBUTTON` (wm-core types),
    `confMAP`/`Store` (ngrx — non serve più leggere la conf tile lato client), `GeoutilsService`,
    `WmSocialStoryShare` (`wm-social-story-share`), `take` (rxjs).
  - Rimossi metodi privati: `_captureTrackScreenshot`, `_resolveTileUrl`, `_computeTrackStats`,
    `_requestStoryImage` (vecchia versione multipart+blob), `_shareCompositedImage`,
    `_shareImageViaGenericShare`, `_dataUrlToBlob`, `_blobToBase64`, la funzione modulo
    `createComponentRef`, l'interfaccia `TrackShareStats`.
  - Nuovo: interfaccia `ShareStoryImageResponse` (`{image_base64, share_url}`, vedi sopra),
    `_requestShareImage(uuid)` (JSON `POST` con solo `{uuid}`), `_writeImageToCache(imageBase64)`
    (riusa il pattern `Filesystem.writeFile({path, data, directory: Directory.Cache})` già
    presente nel vecchio `_shareImageViaGenericShare`, unica parte di logica sopravvissuta quasi
    identica dal codice precedente), `_extractBackendErrorMessage` semplificato (nessun parsing
    Blob: essendo JSON in entrambe le direzioni, `HttpErrorResponse.error` è già l'oggetto
    parsato).
  - `shareTrackToStories(track)` riscritto: guardia doppio tap invariata
    (`_shareStoryInFlight`), poi `uuid` da `track.properties?.uuid` (con errore esplicito e
    chiaro se assente — caso non gestito esplicitamente prima, la traccia potrebbe non essere
    ancora sincronizzata), chiamata `_requestShareImage`, scrittura su cache,
    `Share.share({url: share_url, files: [fileUri], text, title, dialogTitle})` diretto.
  - **Bug preesistente non toccato, solo evitato**: il metodo pubblico `share()` di questa classe
    fa `Object.assign(this.defaultShareObj, shareObj)`, che muta permanentemente l'oggetto
    condiviso invece di fare merge in uno nuovo — ogni chiamata sporca lo stato per le successive.
    Come nella versione precedente di questo file, `shareTrackToStories` continua a chiamare
    `Share.share()` **direttamente**, non tramite `this.share()`, per non aggravare il bug con un
    array `files` che finirebbe permanentemente nel default condiviso. Non risolto perché fuori
    scope di questo giro (tocca anche `sharePoiByID`/`shareRoute`/`shareTrackByID`, invariati).
  - `shareRoute()`, `shareTrackByID()`, `sharePoiByID()`, `share()` invariati — usano
    `GeoutilsService`? No: verificato che nessuno degli altri metodi del file usava
    `GeoutilsService` prima della rimozione (l'unico uso era in `_computeTrackStats`, rimosso), la
    rimozione dell'iniezione dal costruttore è quindi sicura.

- **`core/src/app/pages/map/map.page.ts`** — **nessuna modifica di contenuto**: verificato che
  `onShareTrack(track)` chiamava già `this._shareSvc.shareTrackToStories(track).then(result =>
  this.shareResult$.next(result))`, cioè esattamente il wiring richiesto — delega tutto a
  `ShareService` e propaga il risultato. Non c'era nessun residuo diretto di map-core/plugin
  nativo in questo file (l'orchestrazione screenshot/plugin viveva solo dentro
  `share.service.ts`). Nessuna modifica necessaria.

- **`core/src/app/pages/map/map.page.html`** — **nessuna modifica**: il binding
  `[track]="ugcTrack"` / `[shareResult]="shareResult$|async"` / `(poi-click)="..."` /
  `(share-track)="onShareTrack($event)"` su `<wm-ugc-track-properties>` era già presente e
  corrisponde esattamente al contratto wm-core (vedi sotto).

## Conformità al contratto wm-core (invariato dalle revisioni precedenti)

Verificato riga per riga contro `core/src/app/shared/wm-core/docs/features/8183-.../notes.md`:

- `@Output('share-track') shareTrack: EventEmitter<WmFeature<LineString>>` → `map.page.html` usa
  `(share-track)="onShareTrack($event)"`, `onShareTrack(track: WmFeature<LineString>)` — tipo e
  alias combaciano esattamente.
- `@Input('shareResult') set setShareResult(result: UgcTrackShareResult | null)` → `map.page.html`
  usa `[shareResult]="shareResult$|async"`, `shareResult$: BehaviorSubject<UgcTrackShareResult |
  null>` inizializzato a `null` (coerente col "no-op esplicito" documentato lato wm-core).
- `UgcTrackShareResult { success: boolean; errorMessage?: string }` → `share.service.ts` importa
  il tipo direttamente da `@wm-core/ugc-track-properties/ugc-track-properties.component` (stessa
  fonte usata da `map.page.ts`), nessuna ridefinizione locale divergente.

## Verifiche eseguite in questa sessione

- **Ispezione preliminare del working tree**: confermato via `find` che
  `WmUgcTrackShareMapComponent` non esiste più sotto `core/src/app/shared/map-core` (rimosso dal
  predecessore, come indicato nel task) — `share.service.ts`, prima della mia modifica,
  referenziava ancora quell'import: senza intervento, il file non avrebbe compilato.
- **`npx tsc --noEmit --skipLibCheck -p tsconfig.json`** (Node 22, `nvm use 22`): **zero errori**
  in `share.service.ts` o `map.page.ts` (grep mirato su entrambi i nomi file, nessun match). Il
  progetto nel suo complesso riporta ~638 errori preesistenti e non correlati, tutti in altri
  file — unico file toccato indirettamente in cui compaiono errori nel grep è
  `ugc-track-properties.component.spec.ts` (wm-core), ma sono tutti `TS2339`/`TS2551` su typing
  Jasmine (`toBe`/`toBeNull`/`toHaveBeenCalledWith` "non esistono" su `Assertion`) — rumore di
  configurazione tipi preesistente, non causato da questa modifica (il file spec non è stato
  toccato in questa sessione).
- **`npx ng build` di produzione completo** (Node 22): **completato con successo, exit code 0**.
  Unici warning: deprecazioni Sass `@import` preesistenti in vari file `.scss` non toccati, e due
  file `.ts` non referenziati (`egeojson-geometry-types.enum.ts`, `save.enum.ts`), anch'essi
  preesistenti. Questo è un compile AOT reale con `strictTemplates` attivo: copre quindi anche il
  binding `(share-track)="onShareTrack($event)"` / `[shareResult]="shareResult$|async"` su
  `<wm-ugc-track-properties>` — se l'alias o il tipo non avessero combaciato esattamente col
  contratto Output/Input dichiarato in wm-core, la build sarebbe fallita con un errore di
  binding/type-check sul template. È la verifica end-to-end più forte disponibile senza un device
  reale.
- Non esagerato oltre: nessun test Cypress/E2E eseguito in questa sessione (fuori scope del task,
  che chiedeva solo type-check + build), nessuna chiamata reale all'endpoint backend (non ancora
  implementato nella forma semplificata, vedi sopra).

## Punti aperti

1. **Riconciliare il formato di risposta reale del backend** appena l'agente parallelo su
   `wm-package` completa l'implementazione semplificata — vedi sezione dedicata sopra. Il punto
   di modifica è isolato (`ShareStoryImageResponse`, `_requestShareImage`,
   `_extractBackendErrorMessage` in `share.service.ts`).
2. **Verificare `Share.share()` con `files` su iOS/Android reali**: non testato su device in
   questa sessione (nessun device/simulatore disponibile) — solo type-check e build. Il rischio
   "esperienza meno diretta su iOS" è già documentato ed esplicitamente accettato in
   `overview.md`.
3. **Bug preesistente in `share()` (mutazione di `defaultShareObj`)**: non toccato, vedi nota
   sopra — candidato per un fix separato se in futuro un altro chiamante di `share()` passa un
   array (`files`, `id`, ecc.) che dovrebbe restare per-chiamata.
4. **Nessuna gestione esplicita per `uuid` mancante prima di questo giro**: aggiunto un guard
   esplicito (`errorMessage: 'Impossibile condividere: percorso non ancora sincronizzato.'`) —
   caso che si può verificare se l'utente tenta di condividere una traccia UGC non ancora
   sincronizzata col backend (nessun `uuid` assegnato). Non specificato esplicitamente
   nell'overview, aggiunto per difesa perché il backend altrimenti risponderebbe 404 con un
   messaggio meno chiaro per l'utente.

## Revisione: secondo punto di ingresso (schermata di successo) + fix reale del punto 4

Richiesta esplicita del developer: aggiungere la condivisione anche nella schermata
"Attività registrata con successo" (`ModalSuccessComponent`), mostrata subito dopo aver
terminato una registrazione GPS — non solo nel pannello proprietà traccia già esistente.

### `ModalSuccessComponent` — chip di condivisione

- **Design esplorato con 3 opzioni** (mockup HTML pubblicato come Artifact, non nel repo):
  A) pulsante Condividi come CTA primario (stile Strava, "Torna ad esplorare" retrocesso a
  link), B) due pulsanti affiancati pari peso, C) chip icona circolare agganciato all'angolo
  della card statistiche. **Scelta finale: opzione C**, dopo aver scartato la A in un giro
  successivo ("non mi sta piacendo molto").
- **Stessa state machine di `ugc-track-properties`** (wm-core): `EUgcTrackShareState`,
  `AlertController` per l'errore, nessun banner di successo. Qui però l'orchestrazione
  (`ShareService.shareTrackToStories`) è chiamata **direttamente** dal componente (non via
  `@Output`/`@Input` come in wm-core) perché `ModalSuccessComponent` vive nel repo principale,
  stesso repo di `ShareService` — nessun bisogno del contratto cross-submodule.
- **Bug reale trovato e corretto durante l'iterazione visiva**: il chip usava `[disabled]`
  nativo di Ionic per lo stato `GENERATING` — ma essendo sovrapposto (posizionamento assoluto)
  all'angolo della card bianca sottostante, l'opacità che Ionic applica ai bottoni disabilitati
  faceva trasparire il bordo bianco della card, un artefatto visivo chiaramente rotto su
  device reale. Fix: nessun `[disabled]` nativo sul chip, guardia di re-entrancy solo lato TS;
  lo stato "in attesa" (sia `GENERATING` sia, in un secondo momento, "non sincronizzato") usa
  invece uno swap di colore di sfondo piatto via classe CSS custom (mai opacità).
- **Bug di markup trovato durante lo sviluppo**: un `</ng-container>` di troppo, rimasto da
  una modifica precedente, ha fatto crashare l'app a runtime ("Unexpected closing tag") **pur
  con `ng build --configuration=ci` verde** — quella configurazione di build non cattura
  questo tipo di errore di template (motivo non isolato). Da quel momento in poi, verificato
  anche il bilanciamento dei tag (`grep -c` su apertura/chiusura) prima di dichiarare una
  modifica al template pronta, non solo l'esito della build.

### Fix reale del punto aperto 4: il sync non partiva nemmeno in tempo

Il guard "uuid mancante" del giro precedente copriva solo il caso limite (nessun uuid
assegnato), ma il developer ha confermato un caso più comune e reale: **quando l'utente è
sulla schermata di successo, la traccia non è ancora stata inviata al backend affatto** — non
solo "in corso di sincronizzazione", proprio non ancora iniziata.

- **Causa radice**: `ModalSaveComponent.save()` dispatchava `syncUgcTracks()`/`syncUgcPois()`
  solo nel `.subscribe()` finale della pipeline, che si risolve solo **dopo** che
  `ModalSuccessComponent` viene chiuso (`await modaSuccess.onDidDismiss()` blocca la catena
  fino a quel momento). Quindi il sync non partiva proprio finché l'utente restava su quella
  schermata — un pulsante di condivisione gated sulla sincronizzazione non si sarebbe MAI
  abilitato lì, un vicolo cieco.
- **Fix**: il dispatch è stato anticipato a un `tap()` subito dopo `saveUgc()` (salvataggio
  locale), prima di `removeCurrentUgcTrackLocations()`/`backToSuccess()`/apertura del modal di
  successo — così la sincronizzazione ha davvero la possibilità di completarsi (o essere in
  corso) mentre l'utente guarda la schermata con il pulsante.
- **Segnale di "sincronizzato" per una traccia specifica**: nessun campo/azione dedicato
  esiste per questo nel sistema — il segnale corretto, già usato altrove
  (`UgcSynchronizedBadgeComponent`, wm-core), è la presenza di `properties.id` (assegnato dal
  server) accanto a `properties.uuid` (locale), verificato contro il selettore
  `ugcTracksFeatures` (wm-core), che fonde tracce locali e sincronizzate.
- **Bug preesistente scoperto per strada, non toccato**: `UgcState.syncing` diventa `true` al
  dispatch di sync ma non torna mai `false` su successo (`ugc.reducer.ts`, solo
  `syncUgcFailure` lo resetta) — quindi `syncing` da solo non è un segnale affidabile di "sync
  in corso adesso" oltre il primo ciclo. Non usato per questo gating proprio per questo motivo
  (si usa invece la presenza dell'`id` sulla traccia, un segnale positivo e stabile).
- **Stessa logica di gating applicata anche al primo punto di ingresso**
  (`ugc-track-properties`, wm-core) per coerenza — vedi il `notes.md` di quel repo per il
  dettaglio specifico di quel componente (lì il `[disabled]` nativo è sicuro da usare, nessuna
  card sovrapposta).

### Ricreazione dei branch

Le PR #206 (webmapp-app) e #178 (wm-core) della revisione precedente sono state **mergiate**
in `RDO_ass_cammini_italia_2026_2` e i branch remoti cancellati (comportamento di default di
GitHub dopo merge). Per continuare il lavoro con lo stesso nome di branch, ricreato
`feature/oc-8183-condivisione-percorso-registrato-sui-social` dalla punta aggiornata di
`RDO_ass_cammini_italia_2026_2` in entrambi i repo, recuperando via `git stash` solo le
modifiche pertinenti a questo giro (escluse tarature locali dell'ambiente di sviluppo e lavoro
non correlato di altri ticket presenti nel working tree al momento).
