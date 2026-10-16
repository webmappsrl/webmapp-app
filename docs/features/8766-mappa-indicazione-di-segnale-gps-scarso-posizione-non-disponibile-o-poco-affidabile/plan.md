> Ticket: oc:8766

# Indicazione dello stato del GPS sulla mappa — piano di implementazione

> **Per chi esegue:** sub-skill richiesta: `superpowers:subagent-driven-development` (consigliata) o
> `superpowers:executing-plans`, task per task. I passi usano le checkbox (`- [ ]`).
>
> **⚠️ Nessun commit automatico.** I passi «Commit» sono istruzioni testuali per il dev: Claude non
> esegue `git add`, `git commit`, `git push` né crea branch senza un via libera esplicito per ogni
> singolo commit.

**Obiettivo:** mostrare sulla mappa dell'app l'attesa del GPS, il segnale scarso, il permesso negato
e la localizzazione spenta, leggendo errori e `accuracy` che il plugin già fornisce.

**Architettura:** in `wm-core` una funzione pura calcola lo stato del GPS da eventi (avvio, stop,
fix, errori, tick); `GeolocationService` la alimenta e la espone come `gpsStatus$`. Nell'app un
servizio (`GpsAlertService`) traduce lo stato in regole d'interfaccia (quando mostrare un avviso,
quando il badge, eventi PostHog) e un componente (`webmapp-gps-alert`) disegna l'avviso e
l'animazione verso il badge sul bottone della posizione.

**Stack:** Angular 20, Ionic 8, Capacitor 7, `@capacitor-community/background-geolocation` 1.2.26,
RxJS, Karma + Jasmine.

**Spec:** [overview.md](overview.md) (app) e
`core/src/app/shared/wm-core/docs/features/8766-mappa-indicazione-di-segnale-gps-scarso-posizione-non-disponibile-o-poco-affidabile/overview.md`
(wm-core). Chi esegue legge entrambe.

## Vincoli globali

- Soglie, costanti in wm-core: ingresso in `poor` con `accuracy` **> 50 m** per **2 fix di fila**;
  uscita dopo **15 000 ms** di fix con `accuracy` **< 30 m**; un fix con `accuracy >= 30` azzera il
  timer d'uscita.
- Avviso di ricerca dopo **8 000 ms** di `searching`, al massimo **una volta per avvio dell'app**.
- `stale: false` invariato; `distanceFilter` invariato.
- In wm-core: identificatori in inglese, nessun testo visibile, nessun evento PostHog nuovo.
- Nell'app: selettori con prefisso `webmapp-`, classi CSS nuove con prefisso `webmapp-gps-`,
  componenti standalone come `btn-start-walk`, JSDoc su funzioni e metodi, membri privati con `_`.
- i18n: la chiave è il testo italiano, ripetuto come valore in `it.ts`; sette file
  `core/src/assets/i18n/{de,en,es,fr,it,pr,sq}.ts`. `'Chiudi'` esiste già in wm-core: non va
  duplicata.
- Documentazione, commenti e commit in italiano; scope dei commit `oc:8766`.

## Focus della review

1. **`accuracy` assente o non numerica** (`null`, `undefined`, `NaN`): lo stato non deve andare in
   `poor` né rompersi; il fix vale come posizione arrivata. → test nel Task 1.
2. **Fix che arriva dopo lo stop** (callback in ritardo del watcher appena rimosso): da `off` resta
   `off`. → test nel Task 1.
3. **Errore `NOT_AUTHORIZED` mentre si è in `poor` con il timer d'uscita avviato**: lo stato passa a
   `denied` e il timer non lo riporta mai a `ok`. → test nel Task 1.
4. **Passaggio navigazione → registrazione sul web**: il watcher precedente va chiuso, mai due
   watcher attivi. → test nel Task 2.
5. **Avviso chiuso dall'utente e nuovo episodio dello stesso tipo nella stessa sessione**: un
   `denied` chiuso non ricompare, un nuovo episodio `poor` sì. → test nel Task 3.

---

### Task 1: funzione pura degli stati del GPS (wm-core)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-1--funzione-degli-stati)

**File:**
- Crea: `core/src/app/shared/wm-core/projects/wm-core/src/utils/gps-status.ts`
- Test: `core/src/app/shared/wm-core/projects/wm-core/src/utils/gps-status.spec.ts`

**Interfacce prodotte:**

```ts
export type GpsStatus = 'searching' | 'ok' | 'poor' | 'denied' | 'disabled' | 'off';

export const GPS_POOR_ENTER_ACCURACY = 50;   // metri
export const GPS_POOR_ENTER_FIXES = 2;
export const GPS_POOR_EXIT_ACCURACY = 30;    // metri
export const GPS_POOR_EXIT_MS = 15000;

export interface GpsStatusState {
  status: GpsStatus;
  poorStreak: number;        // fix consecutivi sopra GPS_POOR_ENTER_ACCURACY
  goodSince: number | null;  // timestamp (ms) del primo fix sotto GPS_POOR_EXIT_ACCURACY, in `poor`
}

export type GpsStatusEvent =
  | {type: 'start'}
  | {type: 'stop'}
  | {type: 'fix'; accuracy: number | null | undefined; time: number}
  | {type: 'tick'; time: number}
  | {type: 'nativeError'; code?: string; message?: string}
  | {type: 'webError'; code: number}; // GeolocationPositionError.code: 1, 2, 3

export function initialGpsStatusState(): GpsStatusState; // {status: 'off', poorStreak: 0, goodSince: null}
export function reduceGpsStatus(state: GpsStatusState, event: GpsStatusEvent): GpsStatusState;
```

Regole di `reduceGpsStatus` (non deducibili dalla firma):
- `start` → `searching`, contatori azzerati, da qualsiasi stato.
- `stop` → `off`, contatori azzerati.
- `fix` da `off` → invariato.
- `fix` da `searching`, `denied`, `disabled` → `ok`, con `poorStreak` = 1 se `accuracy > 50`
  altrimenti 0 (il secondo fix sopra 50 porterà in `poor`).
- `fix` in `ok`: `accuracy > 50` → `poorStreak + 1`, e a 2 → `poor` con `goodSince = null`;
  altrimenti `poorStreak = 0`.
- `fix` in `poor`: `accuracy < 30` → `goodSince = goodSince ?? time`, e se
  `time - goodSince >= 15000` → `ok` con contatori azzerati; `accuracy >= 30` → `goodSince = null`.
- `accuracy` non numerica: vale come fix (esce da `searching`/`denied`/`disabled` verso `ok`), ma
  non tocca `poorStreak` né `goodSince`.
- `tick` in `poor` con `goodSince != null` e `time - goodSince >= 15000` → `ok`; altrimenti
  invariato.
- `nativeError` con `code === 'NOT_AUTHORIZED'`: `message === 'Location services disabled.'` →
  `disabled`, altrimenti `denied`; contatori azzerati. Ogni altro `nativeError` → invariato.
- `webError`: `1` → `denied`, `2` → `disabled`, `3` → invariato.
- La funzione non muta lo stato ricevuto: restituisce sempre un oggetto nuovo.

- [ ] **Passo 1: scrivi i test che falliscono** in `gps-status.spec.ts`, un `it` per ciascuno:
  - `start porta in searching da ogni stato` (da `off`, `poor`, `denied`)
  - `stop porta in off`
  - `il primo fix porta da searching a ok` (accuracy 12)
  - `due fix sopra 50 m di fila portano in poor` (51, 80 → `poor`)
  - `un fix sopra 50 seguito da uno sotto non porta in poor` (80, 20, 80 → `ok`)
  - `fra 30 e 50 m lo stato non cambia` (in `ok`: 45 → `ok`; in `poor`: 45 → `poor`, `goodSince` null)
  - `esce da poor dopo 15 s sotto i 30 m` (`poor`, fix 10 a t=0, fix 10 a t=14999 → `poor`; fix 10 a t=15000 → `ok`)
  - `un fix a 30 m o più azzera il timer d'uscita` (fix 10 a t=0, fix 35 a t=5000, fix 10 a t=16000 → `poor`, `goodSince` 16000)
  - `il tick fa uscire da poor anche senza altri fix` (fix 10 a t=0, tick t=15000 → `ok`)
  - `il tick senza goodSince non cambia nulla`
  - `accuracy non numerica non porta in poor` (`null`, `undefined`, `NaN` da `searching` → `ok`, `poorStreak` 0)
  - `un fix dopo lo stop resta off`
  - `NOT_AUTHORIZED con Location services disabled porta in disabled`
  - `NOT_AUTHORIZED con altro messaggio porta in denied`
  - `un errore nativo senza codice non cambia lo stato` (da `ok` e da `poor`)
  - `NOT_AUTHORIZED in poor con il timer avviato porta in denied, e il tick non lo riporta a ok`
  - `errori web: 1 → denied, 2 → disabled, 3 → invariato`
  - `un fix dopo denied porta in ok` (ritorno dalle impostazioni)
  - `non muta lo stato ricevuto` (`Object.freeze` sullo stato in ingresso)

- [ ] **Passo 2: lancia i test e verifica che falliscano**

  Da `core/src/app/shared/wm-core`: `npx ng test wm-core --watch=false --include='**/utils/gps-status.spec.ts'`
  Atteso: FAIL, modulo `gps-status` non trovato.

- [ ] **Passo 3: implementa `gps-status.ts`** con le interfacce e le regole sopra. Un `switch` su
  `event.type`; un helper privato `isNum(v)` (`typeof v === 'number' && !isNaN(v)`). JSDoc in
  italiano su tipi e funzioni esportate.

- [ ] **Passo 4: lancia i test e verifica che passino** (stesso comando). Atteso: PASS.

- [ ] **Passo 5: commit (istruzione per il dev, nel submodule wm-core)**
  ```bash
  git add projects/wm-core/src/utils/gps-status.ts projects/wm-core/src/utils/gps-status.spec.ts
  git commit -m "feat(oc:8766): funzione pura degli stati del GPS"
  ```

---

### Task 2: `GeolocationService` espone lo stato e corregge il watcher web (wm-core)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-2--watcher-nativo)

**File:**
- Modifica: `core/src/app/shared/wm-core/projects/wm-core/src/services/geolocation.service.ts`
  (watcher righe 272-323, `stopAll` 216-221)
- Test: `core/src/app/shared/wm-core/projects/wm-core/src/services/geolocation.service.spec.ts` (nuovo)

**Interfacce:**
- Consuma: `GpsStatus`, `GpsStatusEvent`, `GpsStatusState`, `initialGpsStatusState`,
  `reduceGpsStatus`, `GPS_POOR_EXIT_MS` dal Task 1.
- Produce:
  - `gpsStatus$: BehaviorSubject<GpsStatus>` (valore iniziale `'off'`), pubblico, accanto a
    `onLocationChange$`; emette solo quando lo stato cambia.
  - `openAppSettings()` resta com'è (righe 230-234): è il metodo che l'app usa per «Apri impostazioni».

Modifiche:
- `private _gpsState: GpsStatusState = initialGpsStatusState()` e
  `private _gpsExitTimer: ReturnType<typeof setTimeout> | null = null`.
- `private _applyGpsEvent(event: GpsStatusEvent): void` — chiama `reduceGpsStatus` dentro un
  `try/catch` (in `catch` solo `console.warn`, nessun rilancio); aggiorna `_gpsState`; emette su
  `gpsStatus$` se lo stato è cambiato; se `_gpsState.goodSince != null` e non c'è un timer,
  programma un `setTimeout` a `goodSince + GPS_POOR_EXIT_MS - Date.now()` che invia
  `{type: 'tick', time: Date.now()}`; se `goodSince` torna `null`, cancella il timer.
- `_startWatcher()`: `_applyGpsEvent({type: 'start'})` prima di `addWatcher`, solo quando crea
  davvero un watcher (dopo il controllo `_watcherId != null`). Nella callback: `if (error)` →
  `_applyGpsEvent({type: 'nativeError', code: error.code, message: error.message})`; se lo stato
  risultante è `denied`, rimuovi il watcher (`removeWatcher`) e azzera `_watcherId`, così al
  ritorno nell'app `_startWatcher` lo ricrea; poi `return`. Sui fix:
  `_applyGpsEvent({type: 'fix', accuracy: location.accuracy, time: Date.now()})` **dopo**
  `_onLocationUpdate` e `_addLocationToRecording`.
- `_startWebWatcher(accuracy)`: se `_webWatcherId != null`, `navigator.geolocation.clearWatch` e
  azzera; poi `start`; `enableHighAccuracy: true` sempre (il parametro `accuracy` resta nella firma,
  usato solo da `_getWatcherOptions`); callback d'errore →
  `_applyGpsEvent({type: 'webError', code: err.code})`; sui fix, `fix` come sopra.
- `_stopWatcher()`: chiude anche il watcher web (`clearWatch`, `_webWatcherId = null`) e invia
  `{type: 'stop'}`; cancella `_gpsExitTimer`.

- [ ] **Passo 1: scrivi i test che falliscono** in `geolocation.service.spec.ts`, con TestBed,
  `DeviceService` finto con `isBrowser: true`, `Store` da `provideMockStore`,
  `UgcTrackStatsService` finto con `params$: of(UGC_TRACK_STATS_DEFAULT_PARAMS)`, e
  `navigator.geolocation.watchPosition` / `clearWatch` spiati con `spyOn`:
  - `gpsStatus$ parte da off`
  - `startNavigation porta in searching e apre il watcher web con enableHighAccuracy true`
  - `il passaggio a registrazione chiude il watcher web precedente` (`startNavigation()`, poi
    `startRecording()`: `clearWatch` chiamato con il primo id, un solo watcher aperto)
  - `un fix dal watcher web porta in ok` (invoca la success callback catturata con
    `coords.accuracy: 10`)
  - `l'errore web PERMISSION_DENIED porta in denied` (error callback con `{code: 1}`)
  - `stopAll porta in off e chiude il watcher web`

- [ ] **Passo 2: lancia i test e verifica che falliscano**

  Da `core/src/app/shared/wm-core`: `npx ng test wm-core --watch=false --include='**/services/geolocation.service.spec.ts'`
  Atteso: FAIL, `gpsStatus$` non esiste.

- [ ] **Passo 3: implementa le modifiche** descritte sopra.

- [ ] **Passo 4: lancia i test del servizio e dell'intera libreria**

  `npx ng test wm-core --watch=false`. Atteso: PASS, nessuna regressione negli spec esistenti
  (`ugc-track-stats.spec.ts` compreso).

- [ ] **Passo 5: commit (istruzione per il dev, nel submodule wm-core)**
  ```bash
  git add projects/wm-core/src/services/geolocation.service.ts projects/wm-core/src/services/geolocation.service.spec.ts
  git commit -m "feat(oc:8766): stato del GPS in GeolocationService e watcher web non duplicato"
  ```

---

### Task 3: `GpsAlertService` — le regole d'interfaccia (app)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-3--regole-dinterfaccia)

**File:**
- Crea: `core/src/app/services/gps-alert.service.ts`
- Test: `core/src/app/services/gps-alert.service.spec.ts` (la cartella è già inclusa in
  `tsconfig.spec.json` e in `angular.json`)

**Interfacce:**
- Consuma: `GeolocationService.gpsStatus$`, `GeolocationService.openAppSettings()` (Task 2),
  `GeolocationService.onLocationChange$` (per l'`accuracy` dell'evento PostHog),
  `DeviceService.isMobile`, `POSTHOG_CLIENT` (`@wm-core/store/conf/conf.token`, `@Optional()`).
- Produce:

```ts
export type GpsAlertKind = 'searching' | 'poor' | 'denied' | 'disabled';

@Injectable({providedIn: 'root'})
export class GpsAlertService {
  readonly alert$: Observable<GpsAlertKind | null>;   // avviso da mostrare ora
  readonly badge$: Observable<'poor' | 'good' | 'denied' | 'disabled' | null>;
  readonly pulse$: Observable<boolean>;               // true in `searching`
  collapse(): void;      // fine animazione di `poor`: avviso nascosto, badge acceso
  dismiss(): void;       // l'utente chiude `denied`/`disabled`
  openSettings(): void;  // delega a GeolocationService.openAppSettings()
}
export const GPS_SEARCHING_ALERT_DELAY_MS = 8000;
export const GPS_GOOD_BADGE_MS = 5000;
```

Regole:
- `searching`: `pulse$` true; se dura **8 000 ms** e l'avviso di ricerca non è già stato mostrato in
  questo avvio dell'app, `alert$` = `'searching'` finché lo stato non cambia. Il flag «già
  mostrato» vive nel servizio (singleton, si azzera solo al riavvio dell'app).
- `poor` (solo se `DeviceService.isMobile`): all'ingresso `alert$` = `'poor'`; `collapse()` →
  `alert$` = `null`, `badge$` = `'poor'`. Finché `badge$` è `'poor'`, un nuovo ingresso non
  rimostra l'avviso. All'uscita da `poor` verso `ok`, se il badge era acceso, `badge$` = `'good'`
  per **5 000 ms** e poi `null`: l'episodio si chiude allo spegnimento. Se nei 5 s si rientra in
  `poor`, `badge$` torna `'poor'` senza avviso (l'episodio non era chiuso). L'uscita da `poor` verso
  `off`, `denied` o `disabled` spegne subito il badge verde (non ha senso confermare un segnale
  buono).
- `denied` / `disabled`: `badge$` subito; `alert$` = tipo, salvo che l'utente abbia già chiuso
  quel tipo in questo avvio (`dismiss()`); all'uscita dallo stato, avviso e badge spariscono.
- `ok` e `off`: niente avviso, niente badge, niente pulsazione (salvo il badge `poor` che resta fino
  all'uscita già descritta).
- PostHog: `gpsAlertShown` con `{kind}` ogni volta che `alert$` passa a un valore non nullo; per
  `poor` anche `{accuracy}`, l'ultima letta da `GeolocationService.onLocationChange$`.

- [ ] **Passo 1: scrivi i test che falliscono** in `gps-alert.service.spec.ts`, con
  `GeolocationService` finto (`gpsStatus$` come `BehaviorSubject`), `DeviceService` finto
  (`isMobile` configurabile), client PostHog spia, `fakeAsync`/`tick`:
  - `searching fa pulsare e mostra l'avviso dopo 8 s`
  - `l'avviso di ricerca compare una sola volta per avvio` (searching 8 s → ok → off → searching 8 s: `alert$` resta `null`)
  - `poor mostra l'avviso e collapse lo trasforma in badge`
  - `un nuovo ingresso in poor con il badge acceso non rimostra l'avviso`
  - `l'uscita da poor accende il badge verde per 5 s, poi lo spegne`
  - `rientrare in poor durante il badge verde riaccende il badge giallo senza avviso`
  - `un nuovo episodio di poor dopo la sparizione del badge rimostra l'avviso`
  - `poor su desktop non mostra nulla` (`isMobile: false`)
  - `denied mostra avviso e badge; dismiss nasconde l'avviso ma non il badge`
  - `un denied chiuso non ricompare nello stesso avvio`
  - `ok e off spengono avviso, badge e pulsazione` (da `denied`)
  - `ogni avviso mostrato manda gpsAlertShown con il tipo` (e con `accuracy` per `poor`)

- [ ] **Passo 2: lancia e verifica che falliscano**

  Da `core/`: `npx ng test --watch=false --include='src/app/services/gps-alert.service.spec.ts'`
  Atteso: FAIL, modulo non trovato.

- [ ] **Passo 3: implementa `GpsAlertService`** con le regole sopra. Uno stato interno in
  `BehaviorSubject` e `switchMap` + `timer(GPS_SEARCHING_ALERT_DELAY_MS)` per l'avviso di ricerca.

- [ ] **Passo 4: lancia e verifica che passino** (stesso comando). Atteso: PASS.

- [ ] **Passo 5: commit (istruzione per il dev, repo dell'app)**
  ```bash
  git add core/src/app/services/gps-alert.service.ts core/src/app/services/gps-alert.service.spec.ts
  git commit -m "feat(oc:8766): regole degli avvisi sullo stato del GPS"
  ```

---

### Task 4: avviso animato, badge e pulsazione sul bottone della posizione (app)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-4--avviso-e-badge)

**File:**
- Crea: `core/src/app/components/shared/gps-alert/gps-alert.component.{ts,html,scss}`
- Modifica: `core/src/app/pages/map/map.page.html:132-157` (fab `#fab2` con `locate-outline`)
- Modifica: `core/src/app/pages/map/map.page.base.ts` (inject `GpsAlertService`, campi pubblici)
- Modifica: `core/src/app/pages/map/map.page.scss` (pulsazione e badge)
- Modifica: `core/src/app/pages/map/map.module.ts` (import del componente standalone)

**Interfacce:**
- Consuma: `GpsAlertService` (Task 3).
- Produce: componente standalone `GpsAlertComponent`, selettore `webmapp-gps-alert`,
  `@Input() anchor: HTMLElement` (l'elemento del badge su cui atterra l'animazione).

Comportamento:
- L'avviso è un riquadro centrato in orizzontale, **in alto**, sotto la barra di stato e la
  searchbar: `top: calc(env(safe-area-inset-top) + 72px)`, `max-width: calc(100% - 32px)`; mai al
  centro dello schermo. Al Passo 4 si verifica che non copra la searchbar di camminiditalia.
- `role="alert"` e `aria-live="assertive"` sul contenitore; icona + testo, mai solo colore;
  contrasto ≥ 4.5:1 con i colori di tema (`--wm-color-light` / `--wm-color-dark`).
- Testi (via `wmtrans`):
  - `searching`: «Ricerca del segnale GPS…» + «All'aperto e lontano dagli edifici è più rapido»
  - `poor`: «Segnale GPS debole: la posizione potrebbe essere imprecisa» + «Se succede spesso,
    controlla che "Posizione esatta" sia attiva nelle impostazioni dell'app»
  - `denied`: «La posizione non è disponibile: controlla che la localizzazione sia attiva e che
    l'app abbia il permesso» + bottone «Apri impostazioni» (solo se `DeviceService.isAppMobile`) +
    bottone «Chiudi»
  - `disabled`: «Attiva la localizzazione del telefono per vedere la tua posizione» + bottone
    «Chiudi», **senza** «Apri impostazioni»
- **Stile approvato: scheda chiara** (sfondo `--wm-color-light`, ombra come i fab, angoli 14 px,
  icona in un cerchio da 32 px a sinistra). Riferimento visivo: il prototipo
  https://claude.ai/artifact/33ee7bQpmMZwRf1qhPFa9J (versione 3).
- `poor`: l'avviso resta **4 000 ms**, poi la trasformazione in badge, con la Web Animations API
  (`element.animate`), in tre fasi per un totale di circa 0,7 s:
  1. il testo sfuma in **120 ms**, l'icona (tacche del segnale su cerchio giallo `--wm-color-warning`)
     resta ferma;
  2. la scheda si stringe attorno all'icona in **220 ms**, fino a un cerchio con bordo bianco di 2 px;
  3. il cerchio vola lungo un arco (curva quadratica) fino alla posizione del badge, riducendosi da
     36 a 22 px, in **380 ms**; all'arrivo il badge compare con un piccolo rimbalzo (scala
     0 → 1,35 → 1 in 260 ms) e si chiama `collapse()`.
  Con `matchMedia('(prefers-reduced-motion: reduce)')` niente trasformazione: dissolvenza di 200 ms
  e poi `collapse()`.
- Il badge `poor` ha **la stessa icona delle tacche** su giallo; il badge di `denied`/`disabled` è
  rosso (`--wm-color-danger`) con «×»; il badge `good` è verde (`--wm-color-success`) con le tacche
  piene e icona nel colore di contrasto del tema, e compare con lo stesso rimbalzo; allo spegnimento rimpicciolisce e sfuma in
  220 ms. Misura 22 px con bordo bianco di 2 px, a `top: -4px; right: -4px` del bottone.
- Nel template della mappa: dentro l'`ion-fab-button` di `locate-outline`, uno
  `<span #gpsBadge class="webmapp-gps-badge">` (icona come sopra, nascosto quando `badge$` è
  `null`, `aria-label` con il testo del tipo); classe `webmapp-gps-searching` sull'`ion-fab-button`
  quando `pulse$` è true; `<webmapp-gps-alert [anchor]="gpsBadge">` fuori dai fab, nel contenitore
  della pagina.
- SCSS: pulsazione con `@keyframes` (anello arancione che si allarga e sfuma attorno al bottone,
  1,6 s in loop); entrambi disattivati sotto `@media (prefers-reduced-motion: reduce)`
  (il badge resta, senza animazione d'ingresso).
- La variante camminiditalia (`map.page.camminiditalia.ts`) usa lo stesso `map.page.html` e la
  stessa `MapPageBase`: nessuna modifica lì.

- [ ] **Passo 1: implementa componente e collegamenti** come descritto.

- [ ] **Passo 2: verifica la build** — da `core/`: `npx ng build`. Atteso: nessun errore
  (`strictTemplates` attivo).

- [ ] **Passo 3: lint** — `npm run lint` sui file toccati. Atteso: nessun errore nuovo
  (selettore `webmapp-`, JSDoc, membri privati con `_`).

- [ ] **Passo 4: prova nel browser** — `npm start`, Chrome DevTools → Sensors → Location:
  posizione con `accuracy` 80 m (o «Location unavailable» per `disabled`, permesso bloccato per
  `denied`), emulazione del telefono attiva per `isMobile`. Atteso: avviso in alto, volo sul
  bottone, badge; con `prefers-reduced-motion: reduce` emulato, dissolvenza senza volo.

- [ ] **Passo 5: commit (istruzione per il dev, repo dell'app)**
  ```bash
  git add core/src/app/components/shared/gps-alert core/src/app/pages/map
  git commit -m "feat(oc:8766): avviso animato e badge del GPS sul bottone della posizione"
  ```

---

### Task 5: testi nelle sette lingue (app)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-5--testi)

**File:** `core/src/assets/i18n/{it,en,de,es,fr,pr,sq}.ts`

Chiavi nuove (testo italiano), da aggiungere in fondo a ogni file:
- `'Ricerca del segnale GPS…'`
- `'All\'aperto e lontano dagli edifici è più rapido'`
- `'Segnale GPS debole: la posizione potrebbe essere imprecisa'`
- `'Se succede spesso, controlla che "Posizione esatta" sia attiva nelle impostazioni dell\'app'`
- `'La posizione non è disponibile: controlla che la localizzazione sia attiva e che l\'app abbia il permesso'`
- `'Attiva la localizzazione del telefono per vedere la tua posizione'`
- `'Apri impostazioni'`

`'Chiudi'` esiste già in wm-core e non va aggiunta. Il nome dell'impostazione nel consiglio va
tradotto con il nome che il sistema operativo usa in quella lingua («Precise location» in inglese).

- [ ] **Passo 1: prima di aggiungere, cerca ciascuna chiave** in tutti i file i18n dell'app e di
  wm-core (`grep -rn "<testo>" core/src/assets/i18n core/src/app/shared/wm-core/projects/wm-core/src/localization/i18n`):
  due chiavi uguali nello stesso file non compilano.
- [ ] **Passo 2: aggiungi le chiavi** nei sette file.
- [ ] **Passo 3: verifica** — `npx ng build` senza errori; nell'app con lingua inglese gli avvisi
  sono in inglese.
- [ ] **Passo 4: commit (istruzione per il dev)**
  ```bash
  git add core/src/assets/i18n
  git commit -m "feat(oc:8766): traduzioni degli avvisi del GPS"
  ```

---

### Task 6: prova su dispositivo e aggiornamento del submodule

- [ ] **Passo 1: Android** (`gulp build-android-apk`, installazione sul telefono):
  - permesso negato alla prima richiesta → avviso `denied` con «Apri impostazioni»; concesso dalle
    impostazioni e ritorno nell'app → `searching` e poi pallino;
  - localizzazione spenta dalla tendina prima di aprire la mappa → avviso `disabled` senza
    «Apri impostazioni»; riaccesa → pallino;
  - solo posizione approssimativa → annota quale stato compare (rischio aperto nell'overview);
  - all'aperto vicino a edifici o alberi → avviso `poor`, volo, badge; badge che diventa verde dopo
    15 s di segnale buono e sparisce dopo altri 5 s;
  - durante una registrazione → stessi avvisi, traccia registrata invariata;
  - app in background e ritorno → nessun avviso di ricerca ripetuto.
- [ ] **Passo 2: iOS** (`gulp build-ios`): permesso negato, «Posizione esatta» spenta, segnale
  scarso.
- [ ] **Passo 3: PWA** — da telefono e da desktop: su desktop nessun avviso `poor`.
- [ ] **Passo 4: registra in `notes.md`** gli esiti, in particolare il comportamento con la
  posizione approssimativa su Android e il ritorno dalle impostazioni.
- [ ] **Passo 5: commit del puntatore del submodule (istruzione per il dev)**, dopo il push di
  wm-core:
  ```bash
  git add core/src/app/shared/wm-core
  git commit -m "feat(oc:8766): aggiorna wm-core con lo stato del GPS"
  ```
