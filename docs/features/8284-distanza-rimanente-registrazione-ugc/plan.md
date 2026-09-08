> Ticket: oc:8284

# Distanza rimanente durante la registrazione traccia UGC (repo principale) Implementation Plan

**Goal:** Mostrare nel box di registrazione traccia (`wm-track-recorder`) la distanza dal punto di inizio e dal punto di fine della traccia ufficiale selezionata, riusando dati e componenti già esistenti (oc:8177) senza introdurre nuovo stato.

**Architecture:** `track-recorder.component.ts` si abbona a un nuovo `Observable` che combina i selettori NgRx già pubblici di wm-core (`trackDistanceCovered`, `trackRemainingDistance`, `trackPositionStale`, `confOPTIONSShowTrackRemainingDistance`) — nessuna modifica allo store. `track-recorder.component.html` aggiunge due colonne laterali sempre presenti (tecnica "flex sandwich": entrambe `flex:1`, il centro a larghezza intrinseca resta centrato indipendentemente dal contenuto delle colonne) che mostrano `<wm-track-live-distance-badge>` (già esistente) quando il rispettivo valore non è `null`.

**Tech Stack:** Angular 20, Ionic 8, NgRx 20, RxJS. Nessun test automatico esiste oggi per questo componente (nessun `.spec.ts`) — verifica di questo ciclo è manuale su device/simulatore, stesso approccio già usato in oc:8177 (nessuna rete di test automatici da rompere, ma nessuna rete di sicurezza nemmeno: ogni step di verifica va eseguito con attenzione).

## Global Constraints

- Nessuna modifica allo store NgRx né a wm-core in questo piano (tutti i selettori usati esistono già da oc:8177) — l'unica modifica a wm-core è nel piano separato `core/src/app/shared/wm-core/docs/features/8284-distanza-rimanente-registrazione-ugc/plan.md` (bump costante, indipendente da questo piano).
- Nessuna nuova chiave i18n: riuso di `from`/`to` (chiavi flat già definite in wm-core, verificato non in conflitto con `detail.from`/`detail.to` del repo principale in Fase: challenge).
- Il layout deve rispettare il gate `confOPTIONSShowTrackRemainingDistance` (stesso flag usato da `tab-detail.component.ts` per la visualizzazione) — se `false`, i due badge non vanno mai mostrati, indipendentemente dal dato GPS disponibile.
- Verifica visiva richiesta su viewport 412×832 (target Cypress CI del progetto) oltre a uno schermo più grande.
- Commit convention: `feat(oc:8284): ...`.
- **Non eseguire commit/push/creazione branch** — il branch `feature/oc-8284-distanza-rimanente-registrazione-ugc` esiste già in questo repo; i commit dei singoli task restano istruzioni testuali per lo sviluppatore, da eseguire solo dopo la sua approvazione esplicita di ogni task.

---

### Task 1: Nuovo view-model osservabile in `track-recorder.component.ts`

**Files:**
- Modify: `core/src/app/components/track-recorder-component/track-recorder.component.ts`

**Interfaces:**
- Consumes: selettori pubblici esistenti — `trackDistanceCovered`, `trackRemainingDistance`, `trackPositionStale` da `@wm-core/store/user-activity/user-activity.selector`; `confOPTIONSShowTrackRemainingDistance` da `@wm-core/store/conf/conf.selector` (verificato in `tab-detail.component.ts:16-19`, stesso import path)
- Produces: `trackLiveDistanceVm$: Observable<{distanceCovered: number | null; remainingDistance: number | null; stale: boolean}>` — consumato da Task 2 nel template

- [ ] **Step 1: Verifica gli import esatti nel componente sorella `tab-detail.component.ts`**

```bash
cd /Users/peco/Documents/Apps/webmapp-app
sed -n '12,19p' core/src/app/shared/wm-core/projects/wm-core/src/tab-detail/tab-detail.component.ts
```

Expected output (conferma i path di import da riusare identici):
```typescript
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {confOPTIONS, confOPTIONSShowTrackRemainingDistance} from '@wm-core/store/conf/conf.selector';
import {
  trackDistanceCovered,
  trackPositionStale,
  trackRemainingDistance,
} from '@wm-core/store/user-activity/user-activity.selector';
```

- [ ] **Step 2: Aggiungi gli import necessari in `track-recorder.component.ts`**

In `core/src/app/components/track-recorder-component/track-recorder.component.ts`, sostituisci il blocco import (righe 1-25) aggiungendo le righe mancanti. Stato dopo la modifica:

```typescript
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {GeoutilsService} from '@wm-core/services/geoutils.service';
import {Store} from '@ngrx/store';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {ModalSaveComponent} from '../shared/modal-save/modal-save.component';
import {ModalController, NavController} from '@ionic/angular';
import {confOPTIONSShowTrackRemainingDistance, confTRACKFORMS} from '@wm-core/store/conf/conf.selector';
import {
  onRecord,
  trackDistanceCovered,
  trackPositionStale,
  trackRemainingDistance,
} from '@wm-core/store/user-activity/user-activity.selector';
import {map, take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {
  setEnablePoiRecorderPanel,
  setEnableTrackRecorderPanel,
  setOnRecord,
} from '@wm-core/store/user-activity/user-activity.action';
import {WmFeature} from '@wm-types/feature';
import {LineString} from 'geojson';
```

(`BehaviorSubject, combineLatest, Observable` unificati in un solo import da `rxjs`; `map` aggiunto all'import da `rxjs/operators` già esistente; `confOPTIONSShowTrackRemainingDistance` aggiunto all'import già esistente da `conf.selector`; `trackDistanceCovered`, `trackPositionStale`, `trackRemainingDistance` aggiunti all'import già esistente da `user-activity.selector`.)

- [ ] **Step 3: Aggiungi la property `trackLiveDistanceVm$`**

Nella classe `TrackRecorderComponent`, subito dopo la riga `onRecord$: Observable<boolean> = this._store.select(onRecord);` (riga 49 originale):

```typescript
  trackLiveDistanceVm$: Observable<{
    distanceCovered: number | null;
    remainingDistance: number | null;
    stale: boolean;
  }> = combineLatest([
    this._store.select(trackDistanceCovered),
    this._store.select(trackRemainingDistance),
    this._store.select(trackPositionStale),
    this._store.select(confOPTIONSShowTrackRemainingDistance),
  ]).pipe(
    map(([distanceCovered, remainingDistance, stale, enabled]) => ({
      distanceCovered: enabled !== false ? distanceCovered : null,
      remainingDistance: enabled !== false ? remainingDistance : null,
      stale,
    })),
  );
```

Stesso pattern gate (`enabled !== false`, non `enabled === true`) di `tab-detail.component.ts` — coerente col fatto che il default client-side del flag è `true` ma il valore potrebbe arrivare come `undefined` prima del caricamento della config: trattare `undefined` come "abilitato" replica esattamente il comportamento esistente in visualizzazione.

- [ ] **Step 4: Verifica la compilazione**

```bash
cd /Users/peco/Documents/Apps/webmapp-app/core
npx tsc --noEmit -p tsconfig.app.json
```

Expected: nessun errore di tipo su `track-recorder.component.ts`. Se compaiono errori su altri file preesistenti scollegati da questa modifica, ignorali (non introdotti da questo task); se l'errore è su `track-recorder.component.ts`, fermarsi e correggere prima di procedere.

- [ ] **Step 5: Commit**

```bash
cd /Users/peco/Documents/Apps/webmapp-app
git add core/src/app/components/track-recorder-component/track-recorder.component.ts
git commit -m "feat(oc:8284): aggiungi view-model distanza inizio/fine traccia nel recorder"
```

---

### Task 2: Markup e stile delle due colonne laterali

**Files:**
- Modify: `core/src/app/components/track-recorder-component/track-recorder.component.html`
- Modify: `core/src/app/components/track-recorder-component/track-recorder.component.scss`

**Interfaces:**
- Consumes: `trackLiveDistanceVm$` (prodotto da Task 1) — campi `distanceCovered`, `remainingDistance`, `stale`
- Produces: nessuna nuova interfaccia — solo markup/stile, nessun nuovo `@Input()`/`@Output()`

- [ ] **Step 1: Sostituisci il blocco `.wm-recorder-infopanel-top` in `track-recorder.component.html`**

Blocco attuale (righe 34-44):
```html
  <div class="wm-recorder-infopanel-top">
    <div class="wm-recorder-infopanel-top-center">
      <div class="wm-recorder-infopanel-top-title">
        {{'pages.register.time' | wmtrans}}
      </div>
      <div class="wm-recorder-infopanel-top-data">
        {{time?.hours | number : '2.0-0'}}:{{time?.minutes| number : '2.0-0'}}:{{time?.seconds|
          number : '2.0-0'}}
      </div>
    </div>
  </div>
```

Sostituiscilo con (nuovo blocco, `ng-container` con `*ngIf...as` per evitare tre subscribe separate al medesimo observable):

```html
  <div class="wm-recorder-infopanel-top" *ngIf="trackLiveDistanceVm$|async as liveDistance">
    <div class="wm-recorder-infopanel-top-side">
      <ng-container *ngIf="liveDistance.distanceCovered != null">
        <div class="wm-recorder-infopanel-top-side-title">{{'from' | wmtrans}}</div>
        <wm-track-live-distance-badge
          [distanceMeters]="liveDistance.distanceCovered"
          [stale]="liveDistance.stale"
        ></wm-track-live-distance-badge>
      </ng-container>
    </div>
    <div class="wm-recorder-infopanel-top-center">
      <div class="wm-recorder-infopanel-top-title">
        {{'pages.register.time' | wmtrans}}
      </div>
      <div class="wm-recorder-infopanel-top-data">
        {{time?.hours | number : '2.0-0'}}:{{time?.minutes| number : '2.0-0'}}:{{time?.seconds|
          number : '2.0-0'}}
      </div>
    </div>
    <div class="wm-recorder-infopanel-top-side">
      <ng-container *ngIf="liveDistance.remainingDistance != null">
        <div class="wm-recorder-infopanel-top-side-title">{{'to' | wmtrans}}</div>
        <wm-track-live-distance-badge
          [distanceMeters]="liveDistance.remainingDistance"
          [stale]="liveDistance.stale"
        ></wm-track-live-distance-badge>
      </ng-container>
    </div>
  </div>
```

Nota: `*ngIf="trackLiveDistanceVm$|async as liveDistance"` sul contenitore esterno significa che l'intero blocco `.wm-recorder-infopanel-top` (incluso il timer centrale) non si renderizza fino alla prima emissione dell'observable. Essendo un `combineLatest` di 4 selettori NgRx (tutti con uno stato iniziale sincrono nel reducer, nessuno `undefined` all'avvio), la prima emissione avviene in modo sincrono/immediato al bootstrap del componente — nessun flash vuoto percepibile. Se in Step 3 (verifica manuale) si osserva un flash, sostituire con `*ngIf="(trackLiveDistanceVm$|async) ?? {distanceCovered: null, remainingDistance: null, stale: false} as liveDistance"` per garantire un valore di fallback sincrono — annotare la deviazione in `notes.md` se applicata.

- [ ] **Step 2: Aggiorna `track-recorder.component.scss`**

Nel blocco `.wm-recorder-infopanel-top` (righe 46-74), rimuovi `justify-content: center;` (riga 48) e aggiungi le due nuove classi. Stato del blocco dopo la modifica:

```scss
    .wm-recorder-infopanel-top {
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--wm-color-lightgray);
      text-align: center;
      padding: 10px;

      .wm-recorder-infopanel-top-side {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;

        .wm-recorder-infopanel-top-side-title {
          text-transform: uppercase;
          color: var(--wm-color-darkgrey);
          font-weight: var(--wm-font-weight-normal);
          font-size: var(--wm-font-xsm);
        }
      }

      .wm-recorder-infopanel-top-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .wm-recorder-infopanel-top-title {
          text-transform: uppercase;
          color: var(--wm-color-darkgrey);
          font-weight: var(--wm-font-weight-normal);
          font-size: var(--wm-font-xsm);
        }

        .wm-recorder-infopanel-top-data {
          color: var(--wm-color-dark);
          font-weight: var(--wm-font-weight-xbold);
          font-size: var(--wm-font-xxlg);
          padding: 4px;
        }
      }
    }
```

(`justify-content:center` rimosso dal contenitore: con entrambe le colonne laterali a `flex:1` e il centro a larghezza intrinseca — "flex sandwich" — il centro resta centrato automaticamente, con o senza contenuto nelle colonne laterali. `.wm-recorder-infopanel-top-center` invariata.)

- [ ] **Step 3: Verifica manuale — nessuna traccia selezionata (caso più comune, nessuna regressione)**

```bash
cd /Users/peco/Documents/Apps/webmapp-app/core
npm start
```

Apri l'app nel browser, avvia una registrazione traccia (`wm-btn-rec`) SENZA aver selezionato nessuna traccia (`ec.currentEcTrack` nullo — non navigare su nessuna pagina traccia prima di registrare). Verifica visivamente:
- Il blocco "IN MOVIMENTO" + timer resta centrato esattamente come prima della modifica (confronta con uno screenshot/branch precedente se in dubbio).
- Nessun testo/etichetta orfana ai lati.
- Restringi la finestra del browser a 412×832 (DevTools → device toolbar) e ripeti la verifica.

Se il centro appare disallineato o compaiono elementi vuoti visibili (bordi, ombre, padding percepibile dei div vuoti), annotare in `notes.md` e correggere prima di procedere.

- [ ] **Step 4: Verifica manuale — traccia selezionata, entrambe le distanze disponibili**

Naviga sulla pagina di una traccia esistente (`ec.currentEcTrack` popolato) mentre ti trovi (posizione GPS reale o simulata via DevTools/Xcode GPX simulation) entro 100m dalla traccia stessa. Avvia la registrazione. Verifica:
- Comparsa dei due badge "INIZIO"/"FINE" ai lati di "IN MOVIMENTO", stessa altezza del box di prima (nessuna crescita verticale).
- I valori numerici sono plausibili (in km, formattati dal pipe `distance` interno al badge) e coerenti con la posizione.
- "KM PERCORSI" (riga sotto) resta a 0 all'avvio e cresce indipendentemente dai due nuovi badge (verifica l'invarianza documentata in `overview.md`).
- Ripeti a 412×832.

- [ ] **Step 5: Verifica manuale — flag disattivato**

Se hai accesso a un `config.json` locale con `OPTIONS.showTrackRemainingDistance: false` (o modifica temporaneamente il default in `conf.reducer.ts` per il test, **senza commetterlo**), verifica che i due badge non appaiano mai, anche con traccia selezionata e GPS entro 100m. Ripristina il default originale prima di continuare.

- [ ] **Step 6: Commit**

```bash
cd /Users/peco/Documents/Apps/webmapp-app
git add core/src/app/components/track-recorder-component/track-recorder.component.html core/src/app/components/track-recorder-component/track-recorder.component.scss
git commit -m "feat(oc:8284): mostra distanza inizio/fine traccia nel box di registrazione"
```

---

## Self-review

- **Copertura overview**: "Cosa cambia"/Requisiti di `overview.md` coperti da Task 1 (view-model) e Task 2 (UI); il gate `confOPTIONSShowTrackRemainingDistance` (aggiunto in Fase: write-plan) è in Task 1 Step 3 e verificato in Task 2 Step 5; nessuna nuova chiave i18n (riuso `from`/`to`, Task 2 Step 1); nessuna modifica a wm-core in questo piano (vedi piano separato).
- **Type consistency**: il tipo del view-model (`{distanceCovered, remainingDistance, stale}`) è definito una sola volta in Task 1 e riusato identico in Task 2 — stessi nomi di campo in entrambi i task.
- **Placeholder scan**: nessun placeholder — ogni step contiene comandi/codice completi.
