> Ticket: oc:8798

# Riduzione automatica della plancia di registrazione — piano di implementazione

> **Per chi esegue:** sotto-skill richiesta: `superpowers:subagent-driven-development` oppure
> `superpowers:executing-plans`, un task per volta. I passi usano le checkbox (`- [ ]`).
> **Nessun commit durante l'esecuzione**: i blocchi «Commit» sono istruzioni per il dev, da
> eseguire solo dopo la review e il suo via libera.

**Obiettivo:** durante la registrazione la plancia di `wm-track-recorder` si riduce da sola alla
linguetta quando l'utente cammina (≥ 15 s e ≥ 20 m netti, oltre l'accuratezza dell'ultimo punto).

**Architettura:** tutto dentro `TrackRecorderComponent`. Il componente si iscrive a
`GeolocationService.recordedKeptLocations$` (wm-core, invariato), tiene un *punto di partenza*
(istante `Date.now()` + ultimo punto tenuto) e a ogni punto nuovo verifica le soglie; se superate
chiama la `minimize()` esistente. Il punto di partenza si rifissa all'avvio, alla riapertura, alla
ripresa e a ogni tocco sulla plancia aperta.

**Stack:** Angular 20 (OnPush), RxJS, Karma + Jasmine.

**Spec:** [overview.md](overview.md)

## Vincoli globali

- Soglie: `AUTO_MINIMIZE_MS = 15000`, `AUTO_MINIMIZE_M = 20`, costanti con nome in testa al
  componente, accanto a `MINIMIZE_MS`.
- Solo repo webmapp-app; nessuna modifica a `wm-core`, `map-core`, `wm-types`.
- Nessun testo nuovo, nessuna chiave i18n.
- JSDoc su ogni metodo nuovo, membri privati con underscore, commenti in italiano.
- Nessun evento PostHog.
- Il tempo si misura con `Date.now()`, non con `location.time` (che serve solo a riconoscere un
  punto nuovo).

## Punti da tenere d'occhio in review

1. Valore iniziale del `BehaviorSubject` (registrazione ripresa dopo il riavvio dell'app): non deve
   mai ridurre la plancia, solo fissare la posizione di partenza → test nel Task 1.
2. Riemissione identica dopo il ricalcolo sui parametri della config: ignorata → test nel Task 1.
3. Elenco vuoto (fine registrazione): nessun errore, nessuna riduzione → test nel Task 1.
4. Punto oltre 20 m ma entro la sua accuratezza (rumore da fermo, tipico della PWA): nessuna
   riduzione → test nel Task 1.
5. Punti che arrivano in pausa: nessuna riduzione; alla ripresa il conteggio riparte → test nel
   Task 2.

---

### Task 1: riduzione automatica sui punti tenuti

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-1-haversinemeters-al-posto-di-distancebetweenpoints)

**File:**
- Modifica: `core/src/app/components/track-recorder-component/track-recorder.component.ts`
- Test: `core/src/app/components/track-recorder-component/track-recorder.component.spec.ts`

**Interfacce:**
- Usa: `GeolocationService.recordedKeptLocations$: BehaviorSubject<WmLocation[]>`,
  `distanceBetweenPoints(a: Location, b: Location): number` da `@map-core/utils/ol`,
  `minimize(): Promise<void>` esistente.
- Produce (usati dal Task 2):
  - `private _autoAnchor: {time: number; location: Location | null}`
  - `private _resetAutoMinimize(): void` — `time = Date.now()`, `location` = ultimo elemento di
    `recordedKeptLocations$.value` o `null`.
  - `private _lastKeptTime: number | null`
  - `private _onKeptLocations(kept: Location[]): void`

- [ ] **Passo 1: adeguare il mock nello spec.** In `setup()` aggiungere al `SpyObj` la proprietà
  `recordedKeptLocations$: new BehaviorSubject<Location[]>(initialKept)`, con `initialKept` nuovo
  parametro opzionale di `setup` (default `[]`). Helper nello spec:
  `point(metersNorth: number, time: number, accuracy = 5): Location` che restituisce un punto a
  `metersNorth` metri a nord di un'origine fissa (`latitude: 43.7 + metersNorth / 111320`,
  `longitude: 10.4`).

- [ ] **Passo 2: scrivere i test (falliscono).** Nuovo `describe('riduzione automatica')`, con
  `jasmine.clock().install()` + `mockDate()` e `setup(true)`; `minimize` spiato con
  `spyOn(cmp, 'minimize').and.resolveTo()`. Il primo punto emesso fissa la posizione di partenza.
  - `riduce dopo 15 s e 20 m`: emetti `point(0, 1)`, `tick(15000)`, emetti `[p0, point(21, 2)]` →
    `minimize` chiamato una volta.
  - `non riduce prima di 15 s`: come sopra con `tick(14000)` → non chiamato.
  - `non riduce sotto i 20 m`: `tick(15000)`, ultimo punto `point(19, 2)` → non chiamato.
  - `non riduce entro l'accuratezza del punto`: `tick(15000)`, ultimo punto `point(25, 2, 30)` →
    non chiamato; con `point(35, 3, 30)` → chiamato.
  - `ignora il valore iniziale`: `setup(true, [point(0, 1), point(500, 2)])`, `tick(60000)`, nessuna
    emissione → non chiamato; poi emetti `[…, point(521, 3)]` → chiamato (la partenza era a 500).
  - `ignora la riemissione dello stesso ultimo punto`: partenza a `point(0, 1)`, `tick(15000)`,
    con `minimized = true` emetti `[p0, point(21, 2)]` (non chiamato, punto registrato come visto);
    rimetti `minimized = false` e ri-emetti un array con lo stesso ultimo punto → non chiamato.
  - `ignora l'elenco vuoto`: emetti `[]` → nessun errore, non chiamato.
  - `non riduce se già ridotta o senza registrazione`: `minimized = true` → non chiamato;
    `setup(false)` → non chiamato.

- [ ] **Passo 3: verificare che falliscano.** Da `core/`: `npx ng test --watch=false
  --include='src/app/components/track-recorder-component/**/*.spec.ts'` → i nuovi test FAIL.

- [ ] **Passo 4: implementare.** Costanti `AUTO_MINIMIZE_MS` e `AUTO_MINIMIZE_M` con JSDoc. In
  `ngOnInit`, prima dell'iscrizione: `this._resetAutoMinimize()` e
  `_lastKeptTime` = `time` dell'ultimo elemento del valore corrente (o `null`); poi
  `recordedKeptLocations$.pipe(takeUntil(this._destroy$)).subscribe(k => this._onKeptLocations(k))`.
  `_onKeptLocations`, in quest'ordine:
  1. elenco vuoto → esci;
  2. ultimo punto con `time === _lastKeptTime` → esci; altrimenti aggiorna `_lastKeptTime`;
  3. `_autoAnchor.location` nullo → assegna l'ultimo punto ed esci;
  4. esci se `!this._onRecord || this.isPaused || this.minimized`;
  5. `d = distanceBetweenPoints(_autoAnchor.location, last)`; riduci se
     `Date.now() - _autoAnchor.time >= AUTO_MINIMIZE_MS && d >= AUTO_MINIMIZE_M &&
     d > (last.accuracy ?? 0)` → `this.minimize()`.

- [ ] **Passo 5: verificare che passino.** Stesso comando del passo 3 → PASS, compresi i test
  esistenti dello spec.

- [ ] **Commit (solo dopo il via libera del dev)**
  ```bash
  git add core/src/app/components/track-recorder-component/track-recorder.component.ts core/src/app/components/track-recorder-component/track-recorder.component.spec.ts
  git commit -m "feat(oc:8798): riduzione automatica della plancia quando l'utente cammina"
  ```

### Task 2: ripartenza del conteggio e pausa

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-2-riapertura-ordine-e-test)

**File:**
- Modifica: `track-recorder.component.ts`, `track-recorder.component.html`
- Test: `track-recorder.component.spec.ts`

**Interfacce:**
- Usa: `_resetAutoMinimize()`, `_onKeptLocations()` del Task 1.
- Produce: `onPanelPointerDown(): void` (pubblico, per il template).

- [ ] **Passo 1: scrivere i test (falliscono)**, nello stesso `describe`:
  - `un tocco sulla plancia fa ripartire il conteggio`: partenza a `point(0,1)`, `tick(10000)`,
    `cmp.panel.nativeElement.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}))`,
    `tick(10000)`, emetti `point(21, 2)` → non chiamato (solo 10 s dal tocco); `tick(5000)`, emetti
    `point(42, 3)` → chiamato.
  - `dopo la riapertura riparte e riduce di nuovo`: `minimized = true`, `await cmp.expand()`,
    `tick(15000)`, emetti un punto a 21 m dall'ultimo → chiamato.
  - `in pausa non riduce`: `await cmp.pause()`, `tick(15000)`, emetti `point(50, 2)` → non chiamato.
  - `alla ripresa riparte da zero`: dopo la pausa con punti emessi, `await cmp.resume()`,
    `tick(10000)`, emetti un punto a 21 m → non chiamato; `tick(5000)`, punto a 42 m → chiamato.
  - `all'avvio riparte da zero`: `cmp.recordStart(true)` azzera la partenza (spia su
    `_resetAutoMinimize` o verifica comportamentale come sopra).

- [ ] **Passo 2: verificare che falliscano.** Comando del Task 1, passo 3 → FAIL.

- [ ] **Passo 3: implementare.**
  - `_resetAutoMinimize()` in coda a `expand()` (dopo `_toggle`), in `resume()`, in
    `recordStart()`.
  - `onPanelPointerDown(): void` → `this._resetAutoMinimize()`; nel template, sull'elemento
    `#panel`: `(pointerdown)="onPanelPointerDown()"`. Il `pointerdown` dei bottoni interni risale
    fino alla plancia.
  - La pausa è già esclusa dal punto 4 del Task 1 (`isPaused`): i punti continuano ad arrivare in
    pausa, quindi il controllo deve restare lì e non va spostato.

- [ ] **Passo 4: verificare che passino.** Comando del Task 1, passo 3 → PASS.

- [ ] **Commit (solo dopo il via libera del dev)**
  ```bash
  git add core/src/app/components/track-recorder-component/
  git commit -m "feat(oc:8798): il conteggio riparte a tocco, riapertura, ripresa e avvio"
  ```

### Task 3: verifica finale

- [ ] **Passo 1: suite completa.** Da `core/`: `npm run test -- --watch=false`. Il totale dei test
  deve crescere esattamente del numero di test aggiunti (trappola in `.claude/rules/test-unitari.md`;
  lo spec è in una cartella già inclusa, quindi non servono modifiche a `tsconfig.spec.json` o
  `angular.json`). Con Node 22.
- [ ] **Passo 2: lint.** `npm run lint` → nessun errore nuovo sui file toccati.
- [ ] **Passo 3: prova manuale.** `npm start`, registrazione con posizione simulata (DevTools →
  Sensors): da fermi la plancia resta aperta; spostando la posizione di 25 m dopo 15 s si riduce;
  toccando la linguetta si riapre e si riduce di nuovo dopo altri 15 s e 20 m; in pausa resta
  aperta.
