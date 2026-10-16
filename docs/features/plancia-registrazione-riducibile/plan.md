# Plancia di registrazione riducibile — piano di implementazione

> **Per chi esegue:** sub-skill richiesta: superpowers:subagent-driven-development (consigliata) o
> superpowers:executing-plans, task per task. I passi usano le checkbox (`- [ ]`).

**Obiettivo:** durante la registrazione la plancia si riduce a un elemento agganciato al bordo destro
(tempo, distanza, stato), l'avviso GPS scende sotto la plancia quando è aperta, e la plancia aperta
viene ridisegnata.

**Architettura:** lo stato ridotto/aperto è un campo di `TrackRecorderComponent`, come il resto dello
stato della registrazione. La plancia misura con un `ResizeObserver` l'elemento visibile — la
`ion-card` aperta o la linguetta — e pubblica in un servizio nuovo dell'app
(`RecorderPanelLayoutService`) dove finisce in verticale, `null` senza registrazione attiva.
`GpsAlertComponent` legge il servizio e imposta una variabile CSS sul proprio host; lo SCSS usa come
`top` della scheda il massimo fra quella variabile e la posizione di oggi.

Forma ridotta: **linguetta B**; plancia aperta: **variante 3, compatta con avanzamento**; transizione
approvata — dettagli in [notes.md](notes.md#decisioni) e nell'artifact
<https://claude.ai/artifact/MFPew2zpR88JJSbHPnJeDm>.

**Stack:** Angular 20, Ionic 8, NgRx 20, Karma + Jasmine.

**Spec:** [overview.md](overview.md)

## Vincoli globali

- Tutto nel repo dell'app (`webmapp-app`): nessun file nei submodule.
- Branch `feature/plancia-registrazione-riducibile` creato da `origin/Passaporto` in app, `wm-core`,
  `map-core`, `wm-types`.
- Quattro commit distinti, in quest'ordine: Task 1, Task 2 + Task 3 + Task 4, Task 5, Task 6. Il
  redesign e la linguetta a scelta devono potersi annullare da soli con `git revert`.
- I commit sono istruzioni per il dev: niente `git commit`, `git push` o branch senza il suo ok.
- Scope dei commit: `plancia-registrazione-riducibile` (nessun ticket), es.
  `feat(plancia-registrazione-riducibile): …`.
- Testi nuovi: chiave = testo italiano, in `core/src/assets/i18n/{it,en,fr,de,es,pr,sq}.ts`.
- Naming dell'app: membri privati con `_`, JSDoc su funzioni e metodi, niente prefisso `I` sulle
  interfacce.
- Bersagli toccabili ≥ 44×44px; contrasto testi ≥ 4.5:1; `prefers-reduced-motion` rispettato
  (`src/app/functions/prefers-reduced-motion.ts`).
- Trappole in `.claude/rules/avvisi-gps.md`: l'host dell'avviso è un livello assoluto nello slot
  `fixed`; le animazioni con `fill: 'forwards'` prevalgono sugli stili inline.
- Test di un singolo spec, da `core/`:
  `npx ng test --watch=false --browsers=ChromeHeadless --include='<percorso>'`.

## Da verificare in review

1. **Avviso visibile mentre si riduce o si riapre la plancia**: la scheda deve spostarsi subito, senza
   aspettare un nuovo avviso. Coperto dal test `si sposta quando cambia la plancia` (Task 3).
2. **Avviso di segnale debole che vola mentre la plancia cambia**: il volo usa coordinate in linea
   (`gps-alert.component.ts:164`) e non segue la variabile. Atteso: il volo finisce sul badge, e la
   posizione nuova vale dall'avviso successivo. Coperto dal test `il volo parte dalla scheda sotto la
   plancia` (Task 3).
3. **Plancia montata ma trasparente, prima dello slider**: non conta come aperta. Coperto dal test
   `non pubblica nulla prima della registrazione` (Task 2).
4. **Fine della registrazione con la plancia ridotta**: elemento ridotto e plancia spariscono, il
   servizio torna a `null`. Coperto dal test `reset azzera ridotto e posizione` (Task 2).
5. **Distanza dall'arrivo che diventa `null`** mentre la plancia è ridotta: l'elemento passa ai km
   percorsi cambiando icona. Coperto dal test `passa ai km percorsi senza traccia` (Task 4).

---

### Task 1: Bottone «indietro» fuori dal DOM durante la registrazione

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-1-bottone-indietro)

**File:**
- Modifica: `core/src/app/components/track-recorder-component/track-recorder.component.html:1-11`
- Test: `core/src/app/components/track-recorder-component/track-recorder.component.spec.ts` (nuovo)

**Interfacce:**
- Produce: lo spec di `TrackRecorderComponent`, con un `TestBed` riusabile da Task 2 e Task 4:
  `provideMockStore` (`@ngrx/store/testing`) con i selettori `onRecord`, `trackLiveDistanceVm`,
  `confTRACKFORMS` sovrascritti; `GeolocationService`, `UgcTrackStatsService`, `ModalController`,
  `NavController`, `GeoutilsService` come `jasmine.createSpyObj`; schema `CUSTOM_ELEMENTS_SCHEMA`
  per `wm-btn-rec` e `wm-track-live-distance-badge`; il pipe `wmtrans` sostituito come in
  `gps-alert.component.spec.ts:9-20`.

- [ ] **Passo 1: test che falliscono**

  - `nasconde il bottone indietro durante la registrazione`: con `onRecord` = `true`,
    `query('.wm-track-recorder-close-btn')` è `null`.
  - `mostra il bottone indietro prima della registrazione`: con `onRecord` = `false`, il bottone c'è.

- [ ] **Passo 2: verifica che falliscano**

  Atteso: FAIL sul primo test (il bottone oggi è solo trasparente).

- [ ] **Passo 3: implementazione**

  Aggiungi `*ngIf="!(onRecord$|async)"` all'`ion-fab-button` `wm-track-recorder-close-btn`. Lo stile
  `opacity: 1 - opacity` resta: prima della registrazione sfuma ancora con lo slider.

- [ ] **Passo 4: verifica che passino**

- [ ] **Passo 5: commit (istruzione per il dev)**

  `fix(plancia-registrazione-riducibile): toglie il bottone indietro durante la registrazione`

---

### Task 2: Plancia riducibile e posizione pubblicata

**File:**
- Crea: `core/src/app/services/recorder-panel-layout.service.ts` e `.spec.ts`
- Modifica: `core/src/app/components/track-recorder-component/track-recorder.component.{ts,html,scss}`
- Modifica: `core/src/assets/i18n/{it,en,fr,de,es,pr,sq}.ts`
- Test: `track-recorder.component.spec.ts`, `recorder-panel-layout.service.spec.ts`

**Interfacce:**
- Produce, in `recorder-panel-layout.service.ts`:
  - `@Injectable({providedIn: 'root'}) export class RecorderPanelLayoutService`
  - `readonly panelBottom$: Observable<number | null>` — bordo inferiore dell'elemento visibile
    (plancia aperta o linguetta) in px, coordinate del viewport (`getBoundingClientRect().bottom`);
    `null` senza registrazione attiva.
    Emette solo quando il valore cambia (`distinctUntilChanged`), valore iniziale `null`.
  - `setPanelBottom(bottom: number | null): void`
- Produce, in `TrackRecorderComponent`:
  - `minimized = false`
  - `minimize(): void` e `expand(): void`
  - in `reset()`: `minimized = false` e `setPanelBottom(null)`; in `ngOnDestroy()`: `setPanelBottom(null)`.

- [ ] **Passo 1: test del servizio che falliscono**

  - `parte da null`; `emette il valore impostato`; `non riemette lo stesso valore`.

- [ ] **Passo 2: verifica che falliscano, implementa il servizio, verifica che passino**

  `BehaviorSubject<number | null>(null)` privato, esposto con `distinctUntilChanged()`.

- [ ] **Passo 3: test della plancia che falliscono**

  Nel test il `ResizeObserver` si sostituisce con uno finto (`window.ResizeObserver` salvato e
  ripristinato in `afterEach`) che espone la callback, e `getBoundingClientRect` della card con
  `spyOn` (`bottom: 180`).
  - `pubblica il bordo della plancia aperta`: `onRecord` = `true`, callback chiamata →
    `setPanelBottom(180)`.
  - `non pubblica nulla prima della registrazione`: `onRecord` = `false` → `setPanelBottom(null)`.
  - `ridotta pubblica il bordo della linguetta`: dopo `minimize()`, con `getBoundingClientRect` della
    linguetta a `bottom: 115` → `setPanelBottom(115)`; `.wm-recorder-mini` presente, `ion-card` con
    classe `wm-recorder-card-hidden`.
  - `riaperta torna a pubblicare il bordo`: `minimize()` poi `expand()` → `setPanelBottom(180)`.
  - `reset azzera ridotto e posizione`: `minimize()` poi `reset()` → `minimized === false`, ultimo
    `setPanelBottom(null)`.
  - `il tempo continua da ridotta`: con `minimized = true` e `time` `{hours: 0, minutes: 1, seconds:
    54}`, `.wm-recorder-mini` contiene `00:01:54`.

- [ ] **Passo 4: verifica che falliscano**

- [ ] **Passo 5: implementazione nella plancia**

  - `ion-card` con `#panel` e `[class.wm-recorder-card-hidden]="minimized"` (`display: none`): la
    card resta nel DOM, quindi `@ViewChild('panel', {read: ElementRef})` resta valido.
  - Un solo `ResizeObserver`, creato in `ngAfterViewInit` e scollegato in `ngOnDestroy`, osserva la
    card e la linguetta. La linguetta è sotto `*ngIf`: si osserva da un `@ViewChild('mini', {read:
    ElementRef})` con setter, che fa `observe` quando compare. Una funzione privata
    `_publishPanelBottom()` pubblica, se `onRecord` è vero, il `bottom` della linguetta se `minimized`,
    altrimenti quello della card; `null` se `onRecord` è falso. Va chiamata dalla callback
    dell'observer, a fine transizione (Task 4), e a ogni emissione di `onRecord$` (sottoscrizione con
    `takeUntil(this._destroy$)`).
  - Comando di riduzione sulla plancia: `ion-button` `wm-recorder-minimize-btn`, attributo
    `e2e-recorder-minimize-btn`, `aria-label` `'Riduci la plancia di registrazione' | wmtrans`. La
    posizione definitiva la decide il Task 5; qui va accanto ai tre comandi.
  - Elemento ridotto: `<button type="button" class="wm-recorder-mini" *ngIf="minimized && (onRecord$|async)"
    (click)="expand()" e2e-recorder-expand-btn>`, `aria-label` statico
    `'Apri la plancia di registrazione' | wmtrans`, nessun `aria-live`. Contiene il tempo nello stesso
    formato della plancia. Il contenuto di distanza e pausa arriva col Task 4.
  - SCSS dell'elemento ridotto, posizione provvisoria fino al Task 5: `position: absolute`,
    `top: calc(6px + env(safe-area-inset-top, 30px))`, `right: calc(8px + env(safe-area-inset-right,
    0px))`, `min-height: 48px`, `max-width: 60vw`, `white-space: nowrap`, `z-index` uguale alla card.

- [ ] **Passo 6: i18n**

  Aggiungi `'Riduci la plancia di registrazione'` e `'Apri la plancia di registrazione'` in tutti e
  sette i file, vicino alle chiavi di oc:8766 (`it.ts:628-658`).

- [ ] **Passo 7: verifica che passino** (spec della plancia e del servizio).

---

### Task 3: Avviso GPS sotto la plancia aperta

**File:**
- Modifica: `core/src/app/components/shared/gps-alert/gps-alert.component.{ts,scss}`
- Test: `core/src/app/components/shared/gps-alert/gps-alert.component.spec.ts`

**Interfacce:**
- Consuma: `RecorderPanelLayoutService.panelBottom$` (Task 2).
- Produce: variabile CSS `--wm-gps-alert-top` sull'host di `webmapp-gps-alert`; costante esportata
  `GPS_ALERT_PANEL_GAP = 8` (px fra plancia e scheda).

- [ ] **Passo 1: test che falliscono**

  Nel `TestBed` esistente, aggiungi un `RecorderPanelLayoutService` vero (o con un `BehaviorSubject`
  finto).
  - `senza plancia resta in alto`: `panelBottom$` = `null` → l'host non ha `--wm-gps-alert-top`.
  - `con la plancia aperta scende sotto`: `panelBottom$` = `180`, host in cima al viewport →
    `--wm-gps-alert-top` = `188px` (`180 - hostTop + 8`).
  - `con la linguetta resta alla posizione di oggi`: `panelBottom$` = `115`, `env(safe-area-inset-top)`
    = 0 nel browser di test → `--wm-gps-alert-top` = `123px` e il `top` calcolato della scheda è
    `123px` (il massimo fra `123px` e `72px`). Con `panelBottom$` = `40` il `top` resta `72px`.
  - `si sposta quando cambia la plancia`: con l'avviso `searching` visibile, `panelBottom$` passa da
    `180` a `null` → la variabile viene rimossa senza che l'avviso cambi.
  - `il volo parte dalla scheda sotto la plancia`: `panelBottom$` = `180`, avviso `poor`, dopo
    `GPS_POOR_ALERT_READ_MS` la prima posizione in linea della scheda ha `top` ≥ `188px`.

- [ ] **Passo 2: verifica che falliscano**

- [ ] **Passo 3: implementazione**

  - In `ngAfterViewInit` sottoscrivi `panelBottom$`, aggiunto a `_sub` o con una seconda
    `Subscription`, chiusa in `ngOnDestroy`. Su `null` → `this._host.style.removeProperty('--wm-gps-alert-top')`;
    su un numero → `setProperty('--wm-gps-alert-top', \`${bottom - hostTop + GPS_ALERT_PANEL_GAP}px\`)`,
    con `hostTop = this._host.getBoundingClientRect().top`.
  - La variabile va sull'**host**, non sulla scheda: `_stop()` cancella lo `style` della scheda
    (`gps-alert.component.ts:284-291`), e le animazioni `forwards` non toccano l'host.
  - SCSS, `gps-alert.component.scss:16`:
    `top: max(calc(env(safe-area-inset-top, 0px) + 72px), var(--wm-gps-alert-top, 0px));` — il
    massimo tiene l'avviso dove sta oggi quando la linguetta finisce più in alto.
  - Aggiorna il commento in testa allo SCSS con una riga sul perché della variabile.

- [ ] **Passo 4: verifica che passino**, poi l'intero spec dell'avviso (nessuna regressione nei test
  di oc:8766).

---

### Task 4: Contenuto dell'elemento ridotto

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-4-contenuto-della-linguetta)

**File:**
- Modifica: `track-recorder.component.{html,scss}`, `core/src/assets/i18n/*.ts`
- Test: `track-recorder.component.spec.ts`

**Interfacce:**
- Consuma: `trackLiveDistanceVm$` già presente; `wm-track-live-distance-badge` di wm-core
  (`[distanceMeters]`, `[stale]`, `[showSuffix]`).

- [ ] **Passo 1: test che falliscono**

  - `mostra la distanza dall'arrivo con una traccia`: `remainingDistance: 7100` →
    `.wm-recorder-mini` contiene `wm-track-live-distance-badge` con `distanceMeters` = `7100`, e
    l'indicatore `.wm-recorder-mini-to`.
  - `passa ai km percorsi senza traccia`: `remainingDistance: null`, `length: 6.3` → nessun badge,
    testo `6.30`, indicatore `.wm-recorder-mini-odo`.
  - `segnala la posizione vecchia`: `stale: true` → il badge riceve `stale` = `true`.
  - `in pausa cambia aspetto`: `isPaused = true` → `.wm-recorder-mini` ha classe
    `wm-recorder-mini-paused` e contiene il testo `In pausa`.

- [ ] **Passo 2: verifica che falliscano**

- [ ] **Passo 3: implementazione**

  Markup con le classi dei test. Indicatore di stato: punto rosso che pulsa in registrazione, icona
  `pause` in pausa (pulsazione spenta con `prefers-reduced-motion`). In pausa «In pausa» sostituisce
  la distanza. Forma, colori e icone definitivi vengono dalla variante scelta nell'artifact, che va
  registrata in `notes.md` prima di questo task.

- [ ] **Passo 4: i18n** — `'In pausa'` nei sette file.

- [ ] **Passo 5: verifica che passino**, poi tutti gli spec toccati.

- [ ] **Passo 6: verifica su device o emulatore** (`npm start`, registrazione su uno shard qualsiasi
  e su camminiditalia): riduci e riapri, avviso `searching` con plancia aperta e ridotta, pausa da
  ridotta, salvataggio. Riporta l'esito in `notes.md`.

- [ ] **Passo 7: commit (istruzione per il dev)** — Task 2, 3 e 4 insieme:

  `feat(plancia-registrazione-riducibile): plancia riducibile e avviso GPS sotto la plancia aperta`

---

### Task 5: Redesign della plancia aperta

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-5-redesign)

**File:**
- Modifica: `track-recorder.component.{html,scss}`; eventuali chiavi i18n nuove nei sette file.
- Test: `track-recorder.component.spec.ts`

**Prerequisito:** la variante scelta nell'artifact di design, registrata in `notes.md` con un link
all'artifact. Questo task la implementa: non decide l'aspetto.

- [ ] **Passo 1: test che fissano ciò che il redesign deve conservare**

  - `conserva i tre comandi`: presenti `e2e-recorder-pause-btn` (o `e2e-recorder-resume-btn` in
    pausa), `e2e-recorder-stop-btn`, `e2e-recorder-waypoint-btn`, `e2e-recorder-minimize-btn`.
  - `mostra partenza e arrivo con una traccia`: `distanceCovered: 1200`, `remainingDistance: 7100` →
    due `wm-track-live-distance-badge`.
  - `tempo centrato senza traccia`: con le distanze `null`, le due colonne laterali sono comunque nel
    DOM (la «flex sandwich» o l'equivalente scelto).

  Questi test devono passare **prima** del redesign, sul markup del Task 4: sono la rete di
  sicurezza.

- [ ] **Passo 2: implementazione** della variante scelta, con pochi colori, contrasto ≥ 4.5:1 e
  bersagli ≥ 44px.

- [ ] **Passo 3: verifica che i test passino**, poi verifica su device: avviso sotto la plancia
  ridisegnata (l'altezza cambia, il `ResizeObserver` la segue).

- [ ] **Passo 4: aggiorna `docs/knowledge/registrazione-traccia.md`** («Cosa è stato provato e
  ritirato» si arricchisce con ciò che il redesign supera, con il motivo).

- [ ] **Passo 5: commit (istruzione per il dev)**

  `feat(plancia-registrazione-riducibile): nuovo design della plancia di registrazione`

---

### Task 6: Linguetta con l'informazione a scelta

Aggiunto dopo la prova su dispositivo: variante **D** della tavola «Linguetta: scegli
l'informazione scorrendo» dell'artifact. Requisiti in
[overview.md](overview.md#linguetta-informazione-a-scelta-aggiunto-dopo-la-prova-su-dispositivo).

**File:**
- Modifica: `track-recorder.component.{html,scss,ts}`
- Test: `track-recorder.component.spec.ts`

**Interfacce:**
- Consuma: `trackLiveDistanceVm$`, `length`, `actualSpeed`, `averageSpeed`, `isPaused`, `expand()`;
  chiavi i18n esistenti `to`, `from`, `pages.register.odo`, `pages.register.currentspeed`,
  `pages.register.averagespeed`.
- Produce, in `track-recorder.component.ts`:
  - `export type RecorderMiniInfo = 'to' | 'from' | 'odo' | 'speed' | 'average';`
  - `miniInfo: RecorderMiniInfo` — l'informazione scelta;
  - `miniInfos(hasTrack: boolean): RecorderMiniInfo[]` — `['to','from','odo','speed','average']`
    con una traccia, `['odo','speed','average']` senza;
  - `onMiniPointerDown(event: PointerEvent): void`, `onMiniPointerUp(event: PointerEvent): void`,
    `onMiniClick(): void` — il click riapre la plancia solo se non c'è stato uno scorrimento.

- [ ] **Passo 1: test che falliscono**

  - `con una traccia parte da Arrivo`: `remainingDistance: 7100` → `miniInfo` = `'to'`, cinque
    puntini `.wm-recorder-mini-dot-step`.
  - `senza traccia parte dai km percorsi`: `remainingDistance: null` → `'odo'`, tre puntini.
  - `scorrere verso l'alto passa alla successiva`: pointerdown a y=100 e pointerup a y=70 → `'from'`.
  - `scorrere verso il basso torna alla precedente` e `si ferma alla prima e all'ultima`.
  - `uno scorrimento non riapre la plancia`: dopo lo scorrimento il click non chiama `expand()`.
  - `un tocco riapre la plancia`: spostamento sotto gli 8px → il click chiama `expand()`.
  - `la scelta sopravvive a riduci e riapri`, `una nuova registrazione riparte dalla predefinita`
    (dopo `reset()`).
  - `selezionare una traccia porta ad Arrivo`, e `togliere la traccia da Partenza porta ai km
    percorsi`, mentre `Velocità resta Velocità quando la traccia viene tolta`.
  - `in pausa lo scorrimento non cambia l'informazione`.
  - `mostra velocità e media con «—» se mancano`.
  - `con il testo ingrandito si accorcia l'etichetta, non il valore`.
  - `niente barretta di presa`: `.wm-recorder-mini-grip` assente (sostituisce il test della
    barretta).

- [ ] **Passo 2: verifica che falliscano**

- [ ] **Passo 3: implementazione**
  - Riga in una finestra alta quanto una voce: la colonna delle voci scorre con `transform`
    (220ms, `cubic-bezier(.4,0,.2,1)`), senza transizione con `prefers-reduced-motion`.
  - `touch-action: none` sulla linguetta, così il trascinamento non sposta la mappa.
  - Soglie: 16px per cambiare, 8px per il tocco.
  - Il cambio della traccia si legge dal passaggio `remainingDistance` nullo ↔ non nullo.

- [ ] **Passo 4: verifica che passino**, poi la suite completa (`npm run test`) e la build.

- [ ] **Passo 5: verifica su dispositivo**: scorrimento con il pollice, tocco che riapre, nessun
  gesto «indietro» del sistema, pausa.

- [ ] **Passo 6: commit (istruzione per il dev)** — quarto commit, dopo il redesign:

  `feat(plancia-registrazione-riducibile): informazione a scelta sulla linguetta`
