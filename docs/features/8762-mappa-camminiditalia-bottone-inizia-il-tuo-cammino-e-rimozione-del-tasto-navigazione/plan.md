> Ticket: oc:8762

# Mappa camminiditalia: bottone «Inizia il tuo cammino» — piano di implementazione

> **Per chi esegue:** usare `superpowers:subagent-driven-development` o `superpowers:executing-plans`.
> **Nessun commit, `git add` o branch automatico**: i comandi di commit qui sotto sono istruzioni
> per il dev, che li esegue o li autorizza uno per uno.

**Obiettivo:** su camminiditalia la mappa mostra in basso al centro un bottone «Inizia il tuo
cammino» che apre il pannello di registrazione della traccia, anche passando dal login.

**Architettura:** la logica di `MapPage` si sposta in una classe base astratta
(`map.page.base.ts`, `@Directive()`); default e variante camminiditalia la estendono e differiscono
solo per il template. La variante si attiva con `fileReplacements`. La logica del tocco sta in un
componente standalone `webmapp-btn-start-walk`, testabile senza `fileReplacements`.

**Stack:** Angular 20, Ionic 8, NgRx 20, Karma + Jasmine.

**Spec:** [overview.md](overview.md) (webmapp-app) e l'overview omonima in
`core/src/app/shared/wm-core/docs/features/` (solo i18n).

## Vincoli globali

- Selettori dei componenti con prefisso `webmapp-` (ESLint, `core/.eslintrc.json:38`); JSDoc su
  funzioni e metodi; membri privati con underscore iniziale.
- Nessun import fra `map.page.ts` e `map.page.camminiditalia.ts` (`TS2506` con
  `fileReplacements`).
- La classe si chiama `MapPage` in entrambi i figli, selettore `webmapp-map-page`, così
  `map.module.ts` e `map-routing.module.ts` non cambiano.
- i18n in wm-core: chiave = testo italiano, ripetuto come valore in `it.ts`.
- Commenti, documentazione e messaggi di commit in italiano.
- Il deploy web generico resta senza `--configuration`.

## Focus della review

1. Mappa di default (shard diverso da camminiditalia) identica a prima dopo l'estrazione:
   template, fab, pannelli, navigazione. Coperto dalla prova a mano del Task 1.
2. Login chiuso con la X: nessun pannello aperto. Test nel Task 2.
3. Bottone nascosto durante la registrazione di un POI, con il pannello di download della traccia
   e con il dettaglio in `full`. Prova a mano nel Task 3.
4. Testo su una riga in de e fr su uno schermo da 360px, senza sovrapporsi ai fab a destra. Prova a
   mano nel Task 4.
5. Build `camminiditalia` che compila davvero la variante (conteggio della stringa nel bundle).
   Task 3.

---

### Task 1: estrazione della classe base (commit `refactor`)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-1-estrazione-della-classe-base)

**File:**
- Crea: `core/src/app/pages/map/map.page.base.ts`
- Modifica: `core/src/app/pages/map/map.page.ts` (resta solo il `@Component`)
- Modifica: `core/src/app/pages/map/map.page.html:190`

**Interfacce:**
- Produce: `export abstract class MapPageBase`, decorata con `@Directive()`, con tutti i membri,
  il constructor (stessi 10 parametri, stesso ordine) e i `@ViewChild` di oggi; in più
  `readonly overlayXYZ = 'https://carg.geosciences-ir.it/storage/cargmap/'`.
- Produce: `export class MapPage extends MapPageBase {}` in `map.page.ts`, con il `@Component` di
  oggi invariato (`standalone: false`, OnPush, `ViewEncapsulation.None`).

- [ ] **Step 1:** spostare il corpo di `MapPage` (righe 92-445 e gli import che usa) in
  `map.page.base.ts`, sotto `@Directive()` + `export abstract class MapPageBase`. Nessuna modifica
  alla logica.
- [ ] **Step 2:** ridurre `map.page.ts` al `@Component` di oggi e a
  `export class MapPage extends MapPageBase {}`, senza constructor (lo eredita).
- [ ] **Step 3:** in `map.page.html:190` sostituire la stringa con `[overlayXYZ]="overlayXYZ"`.
- [ ] **Step 4:** aggiornare il punto dell'URL dei tile in `CLAUDE.md` (regola su `overlayXYZ`) e
  in `.claude/rules/download-offline.md`: la stringa ora sta in `map.page.base.ts`.
- [ ] **Step 5:** verifica build. Da `core/`: `npx ng build`. Atteso: build riuscita, nessun
  errore `NG` o `TS`.
- [ ] **Step 6:** verifica test. `npm run test -- --watch=false`. Atteso: gli spec di
  `map-details` verdi come prima.
- [ ] **Step 7:** prova a mano su uno shard di default (`npm start` con uno shard senza
  configuration propria): mappa, fab locate con orientamento e navigazione, fab di registrazione,
  dettaglio di una traccia in `open` e `full`, download della traccia. Atteso: tutto identico a
  prima.
- [ ] **Step 8 (istruzione per il dev):**

```bash
git add core/src/app/pages/map/map.page.base.ts core/src/app/pages/map/map.page.ts
git commit -m "refactor(oc:8762): estrae la logica della pagina mappa in MapPageBase"
```

> Il commit del refactor contiene solo l'estrazione: `overlayXYZ` come costante, il flag
> `showStartWalk` e i documenti che ne parlano entrano col commit della feature, perché nel
> working tree le due cose non sono più separabili per file (`map.page.html` e
> `map.page.base.ts` contengono entrambe). La base va quindi committata nella sua versione
> finale, con la costante e il flag già presenti ma ancora non usati dal template di default.

### Task 2: componente `webmapp-btn-start-walk` e traduzioni

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-2-componente-e-traduzioni)

**File:**
- Crea: `core/src/app/components/shared/buttons/btn-start-walk/btn-start-walk.component.{ts,html,scss}`
- Crea: `core/src/app/components/shared/buttons/btn-start-walk/btn-start-walk.component.spec.ts`
- Modifica: `core/tsconfig.spec.json` (include), `core/angular.json:174-178` (`test.include`)
- Modifica (wm-core): `projects/wm-core/src/localization/i18n/{it,en,de,fr,es,pr,sq}.ts`

**Interfacce:**
- Produce: `BtnStartWalkComponent`, `standalone: true`, selettore `webmapp-btn-start-walk`,
  OnPush; importa `IonicModule` e `WmTransPipe`. Nessun `@Input`.
- Produce: metodo pubblico `start(): Promise<void>`.
- Consuma: `isLogged` (`@wm-core/store/auth/auth.selectors`),
  `setEnableTrackRecorderPanel` (`@wm-core/store/user-activity/user-activity.action`),
  `LoginComponent` (`@wm-core/login/login.component`), `ModalController`.

- [ ] **Step 1: test che falliscono.** Spec costruito come `map-details.component.spec.ts`
  (istanza diretta con spy, niente TestBed), `describe('BtnStartWalkComponent (oc:8762)')`:
  - `loggato: start() fa dispatch di setEnableTrackRecorderPanel({enable: true}) senza aprire il login`
    → `store.select` restituisce `of(true)`; atteso `dispatch` chiamato con quell'azione,
    `modalCtrl.create` non chiamato.
  - `non loggato, login riuscito: apre il pannello alla chiusura della modale` → `select`
    restituisce prima `false` poi `true` (un `BehaviorSubject` portato a `true` prima di risolvere
    `onDidDismiss`); atteso `create` chiamato con `component: LoginComponent` e poi un solo
    `dispatch` con `setEnableTrackRecorderPanel({enable: true})`.
  - `non loggato, login chiuso: nessuna azione` → lo store resta `false`; atteso `dispatch` mai
    chiamato.
- [ ] **Step 2:** aggiungere `"src/app/components/shared/buttons/btn-start-walk/**/*.spec.ts"` a
  `tsconfig.spec.json` e `"src/app/components/shared/buttons/btn-start-walk"` a `test.include` di
  `angular.json`. Lanciare `npm run test -- --watch=false`. Atteso: i tre test falliscono perché il
  componente non esiste.
- [ ] **Step 3:** implementare il componente. `start()` legge `isLogged` con `take(1)`: se true fa
  il dispatch; altrimenti crea la modale di login con le stesse opzioni del fab
  (`canDismiss: true`, `mode: 'ios'`, `id: 'webmapp-login-modal'`), la presenta, attende
  `onDidDismiss()`, rilegge `isLogged` con `take(1)` e fa il dispatch solo se true. Dipendenze
  con `inject()`. Template: un `ion-button` con l'icona `icon-outline-recording` e
  `{{ 'Inizia il tuo cammino' | wmtrans }}`, che chiama `start()`.
- [ ] **Step 4:** traduzioni in wm-core, chiave `'Inizia il tuo cammino'` (cercare prima che non
  esista già):
  it «Inizia il tuo cammino», en «Start your walk», de «Beginne deinen Weg»,
  fr «Commence ton chemin», es «Empieza tu camino», pr «Comece o seu caminho»,
  sq «Fillo rrugëtimin tënd».
- [ ] **Step 5:** `npm run test -- --watch=false`. Atteso: i tre test verdi, nessun altro spec
  rotto.

### Task 3: variante camminiditalia della pagina mappa

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-3-variante-camminiditalia)

**File:**
- Crea: `core/src/app/pages/map/map.page.camminiditalia.ts`
- Crea: `core/src/app/pages/map/map.page.camminiditalia.html`
- Modifica: `core/src/app/pages/map/map.module.ts` (import di `BtnStartWalkComponent`)
- Modifica: `core/src/app/pages/map/map.page.scss`
- Modifica: `core/angular.json` (configuration `camminiditalia`, solo sotto `build`)

**Interfacce:**
- Consuma: `MapPageBase` (Task 1), `BtnStartWalkComponent` (Task 2), gli observable della base
  `mapDetailsStatus$`, `enableRecorderPanel$`, `showDownload$`, `enableTilesDownload$`,
  `isTrackRecordingEnable$`.
- Produce: `export class MapPage extends MapPageBase {}` con
  `templateUrl: './map.page.camminiditalia.html'`, resto del `@Component` uguale al default.

- [ ] **Step 1:** creare `map.page.camminiditalia.ts` (stesso `@Component` del default, cambia solo
  `templateUrl`) e `map.page.camminiditalia.html`, copia di `map.page.html` più
  `<webmapp-btn-start-walk class="wm-btn-start-walk">` **fuori** da `<div bottom-right>`, dentro
  `ion-content`, con `*ngIf` vero solo se `isTrackRecordingEnable$` è true e
  `enableRecorderPanel$`, `showDownload$`, `enableTilesDownload$` sono false.
- [ ] **Step 2:** aggiungere `BtnStartWalkComponent` agli `imports` di `MapPageModule` (standalone,
  innocuo per il default che non lo usa).
- [ ] **Step 3:** in `map.page.scss`, classe `.wm-btn-start-walk`: `position: absolute`, centrata
  in orizzontale, `bottom` alla stessa altezza dell'ultimo fab a destra più
  `env(safe-area-inset-bottom)`, `transition: bottom 0.4s ease-in-out`. Offset per stato accanto a
  quelli del recorder: `.onlyTitle` → 110px, `.open` → 357px; `.full` → `opacity: 0;
  pointer-events: none`. Altezza minima 44px, `white-space: nowrap`, `max-width` tale da lasciare
  libera la colonna dei fab (56px a destra).
- [ ] **Step 4:** in `angular.json`, configuration `camminiditalia` sotto `build`, aggiungere
  `{"replace": "src/app/pages/map/map.page.ts", "with": "src/app/pages/map/map.page.camminiditalia.ts"}`.
- [ ] **Step 5:** verifica build. `npx ng build` e `npx ng build --configuration=camminiditalia`.
  Attesi: entrambe riuscite.
- [ ] **Step 6:** verifica che la variante sia compilata:
  `grep -c "webmapp-btn-start-walk" www/main*.js` sulla build camminiditalia (diverso da 0) e
  sulla build di default (atteso 0 nel template della mappa; il componente può comparire perché è
  importato dal modulo).
- [ ] **Step 7:** prova a mano con `npm start` su camminiditalia (prima `environment.ts`, poi
  riavvio del server): bottone visibile; sale con il dettaglio in `onlyTitle` e `open`; sparisce in
  `full`, durante la registrazione di traccia e POI e con il download della traccia; non loggato →
  login → pannello aperto; login chiuso → niente.

### Task 4: prova di stile

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-4-prova-di-stile)

**File:** `core/src/app/pages/map/map.page.scss`, `btn-start-walk.component.{html,scss}`

- [ ] **Step 1:** preparare due o tre varianti partendo dallo stile dei bottoni presenti
  (`--border-radius: 20px` in `map.page.scss:97`): pillola smussata con icona, pillola tonda con
  icona, pillola tonda senza icona; colore pieno `--ion-color-primary`, testo
  `--ion-color-primary-contrast`.
- [ ] **Step 2:** mostrarle al dev (screenshot da `npm start` su camminiditalia, larghezza 360px,
  lingua it e de) e applicare quella scelta.
- [ ] **Step 3:** prova su dispositivo: margine dalla tab bar e dalla safe area, nessuna
  sovrapposizione con i fab e con l'attribuzione.

### Task 5: regola, trappole e conoscenza

**File:** `.claude/rules/file-replacements.md`, `docs/knowledge/temi-e-varianti-di-shard.md`

- [ ] **Step 1:** in `file-replacements.md` sostituire la voce «Non estrarre una classe base in un
  terzo file» con il criterio: classe base quando la variante non duplica logica (cambia solo il
  template, o sovrascrive un campo o un metodo e aggiunge il resto: search-bar, ugc-box,
  map.page); file intero duplicato quando la logica diverge in più punti (home, profile). Una riga,
  con `(oc:8762)`.
- [ ] **Step 2:** aggiungere la trappola: `map.page.html` e `map.page.camminiditalia.html` sono due
  copie; una modifica al template della mappa va riportata in entrambi (oc:8762).
- [ ] **Step 3:** in `temi-e-varianti-di-shard.md` registrare il perché (variante che cambia solo
  il template, componente a parte per la logica testabile) e spostare il divieto precedente in
  «Come ci siamo arrivati», con il motivo per cui è superato.
- [ ] **Step 4 (istruzione per il dev):** commit della feature, dopo la review, nei due repo:

```bash
# in core/src/app/shared/wm-core
git add projects/wm-core/src/localization/i18n docs/features/8762-*
git commit -m "feat(oc:8762): aggiunge la traduzione di «Inizia il tuo cammino»"
# in webmapp-app (environment.ts escluso: è una modifica locale)
git add core/src/app/pages/map core/src/app/components/shared/buttons core/src/app/functions \
  core/src/app/components/track-recorder-component core/angular.json core/tsconfig.spec.json \
  core/src/app/shared/wm-core CLAUDE.md .claude/rules docs/
git commit -m "feat(oc:8762): bottone «Inizia il tuo cammino» sulla mappa di camminiditalia"
```
