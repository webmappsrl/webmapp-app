> Ticket: oc:8181

# Schermata cammino con blocchi informativi configurabili — Implementation Plan (webmapp-app)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiornare il riferimento del submodule wm-core (che nel suo piano introduce `ConfigDetailComponent`), collegarlo nel dettaglio EcPoi (`poi-properties.component.html`), e aggiungere un test Cypress E2E dedicato che copra Layer/EcTrack/EcPoi.

**Architecture:** Nessun componente nuovo in questo repo — solo (1) bump del pin submodule, (2) un binding nel template EcPoi identico a quello già fatto in wm-core per Layer/EcTrack, (3) un file di test Cypress E2E con fixture inline (`cy.intercept()`), (4) una verifica manuale di interazione con `map-details.component.ts` (oc:8313).

**Tech Stack:** Angular 20, Cypress 14 (pattern `cy.intercept()` + fixture, mai API reali per logica UI — vedi `wm-core/CLAUDE.md`).

## Global Constraints

- **Precondizione:** il piano `docs/features/8181-.../plan.md` del repo `wm-core` deve essere già stato eseguito e approvato (fornisce `ConfigDetailComponent`/selector `wm-config-detail`) prima di iniziare il Task 2 di questo piano.
- Nessun test Karma/TestBed da scrivere per `poi-properties.component` in questo ciclo — coerente con l'esclusione esistente dei componenti dalla discovery CI (`angular.json`/`tsconfig.spec.json`, bug noto `NG0201`, CLAUDE.md → oc:8023). La copertura automatica di questa feature è interamente nel test Cypress E2E del Task 3.
- Nessun commit o branch va eseguito automaticamente durante l'esecuzione di questo piano: i comandi `git commit`/`git checkout -b` riportati in ogni task sono istruzioni testuali per lo sviluppatore, da eseguire solo dopo la sua approvazione esplicita.
- Percorso base per tutti i path relativi di questo piano: `core/` (repo principale `webmapp-app`).

---

## File Structure

| File | Responsabilità |
|---|---|
| `core/src/app/shared/wm-core` (submodule, **bump pin**) | Punta al commit del piano wm-core che introduce `ConfigDetailComponent` |
| `core/src/app/components/poi-properties/poi-properties.component.html` (**modifica**) | Wiring `wm-config-detail` dopo `wm-tab-description` |
| `core/cypress/e2e/app_52/config-detail-boxes.cy.ts` (**nuovo**) | Test E2E: Layer, EcTrack, EcPoi con `config_detail` popolato |

---

## Task 1: Aggiornare il riferimento del submodule wm-core

**Files:**
- Modify: `core/src/app/shared/wm-core` (submodule pin)

**Interfaces:**
- Consumes: commit finale del piano `wm-core` (Task 1-5 di quel piano, deve essere già mergiato/disponibile sul branch del submodule usato da questo repo)

- [ ] **Step 1: Aggiornare il submodule al commit più recente del branch wm-core in uso**

```bash
cd core/src/app/shared/wm-core
git fetch origin
git checkout <branch-o-commit-del-piano-wm-core>
cd ../../../../../..
```

- [ ] **Step 2: Verificare che il repo principale riconosca il nuovo SHA**

Run: `git -C /Users/rubensgarofalo/Sites/Webmapp/webmapp-app status --short -- core/src/app/shared/wm-core`

Expected: una riga che mostra il submodule come modificato (nuovo SHA), es. `M core/src/app/shared/wm-core`.

- [ ] **Step 3: Verificare che il progetto compili con il nuovo pin**

Run: `cd core && npx tsc -p tsconfig.json --noEmit`

Expected: nessun errore. Se `wm-config-detail`/`ConfigDetailComponent` non risultano ancora disponibili, il pin non punta al commit corretto del piano wm-core.

- [ ] **Step 4: Commit**

Stesso messaggio mnemonico già in uso nella storia del repo per questo tipo di aggiornamento (verificato via `git log --oneline -- core/src/app/shared/wm-core`, es. commit `50e6effa`/`d931f609`):

```bash
git add core/src/app/shared/wm-core
git commit -m "Updated submodule core/src/app/shared/wm-core"
```

---

## Task 2: Wiring in `poi-properties.component.html` (EcPoi)

**Files:**
- Modify: `core/src/app/components/poi-properties/poi-properties.component.html:24-28`

**Interfaces:**
- Consumes: `wm-config-detail` (Task 1, esportato da `wm-core.module.ts`), variabile di template `properties` (da `currentPoiProperties$|async`, tipo `PointProperties`/`WmProperties` — indice aperto `[key: string]: any`, nessuna estensione di tipo necessaria)

- [ ] **Step 1: Aggiungere il binding dopo `wm-tab-description`**

Il blocco attuale (righe 24-28):

```html
    <wm-tab-description
      *ngIf="properties?.description as description"
      [description]="description"
    ></wm-tab-description>
    <wm-poi-types-badges
      *ngIf="properties?.taxonomy?.poi_types as poiTypes"
      [poiTypes]="poiTypes"
    ></wm-poi-types-badges>
```

diventa:

```html
    <wm-tab-description
      *ngIf="properties?.description as description"
      [description]="description"
    ></wm-tab-description>

    <wm-config-detail [groups]="properties?.config_detail"></wm-config-detail>

    <wm-poi-types-badges
      *ngIf="properties?.taxonomy?.poi_types as poiTypes"
      [poiTypes]="poiTypes"
    ></wm-poi-types-badges>
```

- [ ] **Step 2: Verificare che il progetto compili**

Run: `cd core && npx tsc -p tsconfig.json --noEmit`

Expected: nessun errore (indice aperto su `PointProperties`, nessun tipo da estendere).

- [ ] **Step 3: Verifica visiva manuale**

Run: `cd core && npm start`, apri un POI (EcPoi) con `config_detail` popolato (o intercettato temporaneamente via devtools/proxy). Verifica posizionamento dopo la descrizione, stato chiuso di default, toggle chevron — stesse verifiche già fatte nel piano wm-core per Layer/EcTrack.

- [ ] **Step 4: Commit**

```bash
git add core/src/app/components/poi-properties/poi-properties.component.html
git commit -m "feat(oc:8181): render config_detail boxes in poi-properties"
```

---

## Task 3: Test Cypress E2E su Layer, EcTrack, EcPoi

**Files:**
- Create: `core/cypress/e2e/app_52/config-detail-boxes.cy.ts`

**Interfaces:**
- Consumes: `mockGetTrack(id, mockPropertiesRes)`, `mockGetPoi(mockFeatures)`, `clearTestState()`, `data`, `openLayer(title)`, `openPoi(title)`, `openTrack(title)`, `confURL` (tutti da `cypress/utils/test-utils.ts`)

**Nota sulla provenienza dei dati per risorsa** (verificato leggendo il codice, non assunto):
- **EcTrack**: `properties.config_detail` va dentro il secondo argomento di `mockGetTrack(id, {...})` — stesso meccanismo già usato da `ec-track-details.cy.ts` per `description`/`image_gallery` (merge dentro `properties` della risposta `tracks/{id}.json`).
- **EcPoi**: `properties.config_detail` va dentro l'oggetto `Feature` passato a `mockGetPoi(feature)` — stesso meccanismo di `ec-poi-details.cy.ts`.
- **Layer**: **non** ha un `properties` wrapper e **non** viene risolto via un endpoint per-id come tracks/pois. `ecLayer` (store `userActivity`) viene popolato dall'effect `updateLayer$` (`wm-core/projects/wm-core/src/store/conf/conf.effects.ts:44-61`) che legge l'oggetto Layer già presente in `MAP.layers[]` dentro il `config.json` intercettato su `confURL` (`**/config.json`) — **non** dalla lista `HOME[]` (che contiene solo `{box_type:'layer', layer: <id numerico>, title}`). Il campo `config_detail` per un Layer va quindi iniettato come proprietà diretta sull'oggetto in `MAP.layers[]` (stesso livello di `description`/`feature_image`), tramite un `cy.intercept()` dedicato su `confURL` che modifica la risposta reale (pattern identico a `confWithAuthEnabled()`/`confWithReleaseUpdateEnabled()` già in `test-utils.ts`), non tramite una nuova fixture statica separata (evita di duplicare l'intero `config.json`).

- [ ] **Step 1: Scrivere il test completo**

> **Nota:** il codice sotto è lo stato **finale** (aggiornato dopo due passate di `wm-skills:wm-review-ticket` — id layer 55→504, `taxonomyIdentifiers` completo, ancoraggi positivi, quinto test per il fallback lingua, rinomina del terzo test). Il dettaglio di ogni evoluzione è in `notes.md`, non ripetuto qui.

```typescript
import {
  clearTestState,
  confURL,
  data,
  mockGetPoi,
  mockGetTrack,
  openLayer,
  openPoi,
  openTrack,
} from 'cypress/utils/test-utils';
import {ILAYER} from '@wm-core/types/config';

// Stesso layer id già usato per `data.layers.ecTrack` ("Tracks test e2e") in
// map-overlay-feature-collection.cy.ts (`E2E_FC_LAYER_ID`) e not-accessible-track.cy.ts — se la
// fixture conf.json venisse riseedata con un id diverso, aggiornare qui insieme a quei due file.
const E2E_TRACKS_TEST_LAYER_ID = 504;

const configDetailGroups = [
  {
    box_type: 'info',
    items: [
      {
        title: {en: 'Water', it: 'Acqua'},
        content: {
          en: '<p>Scarce water along the way.</p>',
          it: '<p>Scarsità di acqua lungo il percorso.</p>',
        },
      },
      {
        title: {en: 'History', it: 'Storia'},
        content: {en: '<p>Historical background.</p>', it: '<p>Cenni storici.</p>'},
      },
    ],
  },
];

const ec_poi_with_config_detail = {
  type: 'Feature',
  properties: {
    id: 99998,
    name: {en: 'Mocked Poi With Config Detail'},
    description: {en: 'Poi used to test config_detail rendering'},
    config_detail: configDetailGroups,
    searchable: '{it:Mocked Poi With Config Detail}',
    related: false,
    // Elenco completo copiato da ec-poi-details.cy.ts (stesso layer "Poi test e2e"): il filtro
    // taxonomy del layer richiede TUTTI questi identificatori (isArrayContained), non solo un
    // sottoinsieme — un elenco incompleto fa scartare il POI mockato dal filtro e openPoi()
    // va in timeout (bug reale, trovato e corretto in wm-skills:wm-review-ticket).
    taxonomyIdentifiers: [
      'poi-test-e2e',
      'end2end-pois',
      'where_marche',
      'where_ascoli-piceno',
      'where_044023',
      'poi_type_poi',
    ],
  },
  geometry: {
    type: 'Point',
    coordinates: [13.870561123, 42.994791786],
  },
};

const ec_track_properties_with_config_detail = {
  name: {en: 'Track example one MOD'},
  description: {en: 'Track example one MOD description'},
  config_detail: configDetailGroups,
};

// Un solo item, solo con `it` (nessun `en`): la lingua corrente nei test è `en` (lingua del
// browser Cypress), quindi questo item esercita davvero il fallback a cascata (corrente assente
// → lingua di default del shard, `it` per camminiditalia) invece di limitarsi a leggere `en`
// come fanno tutti gli altri item di questo file.
const partiallyTranslatedGroups = [
  {
    box_type: 'info',
    items: [
      {
        title: {it: 'Solo italiano'},
        content: {it: '<p>Contenuto disponibile solo in italiano.</p>'},
      },
    ],
  },
];

const ec_track_properties_with_partial_translation = {
  name: {en: 'Track example one MOD'},
  description: {en: 'Track example one MOD description'},
  config_detail: partiallyTranslatedGroups,
};

describe('config_detail boxes are rendered on Layer, EcTrack and EcPoi details (oc:8181)', () => {
  it('renders config_detail as a closed-by-default accordion on the EcTrack detail', () => {
    clearTestState();
    mockGetTrack('86095', ec_track_properties_with_config_detail).as('getApiTrack');
    cy.visit('/');

    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);
    cy.wait('@getApiTrack');

    cy.get('wm-config-detail .wm-config-detail-item').should(
      'have.length',
      configDetailGroups[0].items.length,
    );
    cy.get('wm-config-detail .wm-config-detail-content').should('not.exist');

    cy.get('wm-config-detail .wm-config-detail-item')
      .first()
      .find('.wm-config-detail-header')
      .click();
    cy.get('wm-config-detail .wm-config-detail-content')
      .should('have.length', 1)
      .and('contain.html', configDetailGroups[0].items[0].content.en);
  });

  it('renders config_detail as a closed-by-default accordion on the EcPoi detail', () => {
    clearTestState();
    mockGetPoi(ec_poi_with_config_detail).as('getPoi');
    cy.visit('/');
    cy.wait('@getPoi');

    openLayer(data.layers.ecPoi);
    openPoi(ec_poi_with_config_detail.properties.name.en);

    cy.get('wm-config-detail .wm-config-detail-item').should(
      'have.length',
      configDetailGroups[0].items.length,
    );
    cy.get('wm-config-detail .wm-config-detail-content').should('not.exist');

    cy.get('wm-config-detail .wm-config-detail-item')
      .eq(1)
      .find('.wm-config-detail-header')
      .click();
    cy.get('wm-config-detail .wm-config-detail-content')
      .should('have.length', 1)
      .and('contain.html', configDetailGroups[0].items[1].content.en);
  });

  it('renders config_detail on the Layer detail', () => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const layers = res.body.MAP.layers.map((layer: ILAYER) =>
          String(layer.id) === String(E2E_TRACKS_TEST_LAYER_ID)
            ? {...layer, config_detail: configDetailGroups}
            : layer,
        );
        res.send({...res.body, MAP: {...res.body.MAP, layers}});
      });
    }).as('confWithLayerConfigDetail');
    cy.visit('/');
    cy.wait('@confWithLayerConfigDetail');

    openLayer(data.layers.ecTrack);

    cy.get('wm-map-details .wm-box-title').should('contain', data.layers.ecTrack);
    cy.get('wm-config-detail .wm-config-detail-item').should(
      'have.length',
      configDetailGroups[0].items.length,
    );
    cy.get('wm-config-detail .wm-config-detail-content').should('not.exist');
  });

  it('renders nothing when config_detail is absent on a Layer', () => {
    clearTestState();
    cy.visit('/');

    openLayer(data.layers.ecTrack);

    cy.get('wm-map-details .wm-box-title').should('contain', data.layers.ecTrack);
    cy.get('wm-config-detail .wm-config-detail-item').should('not.exist');
  });

  it('falls back to the default language when the current language is missing for a row', () => {
    clearTestState();
    mockGetTrack('86095', ec_track_properties_with_partial_translation).as('getApiTrack');
    cy.visit('/');

    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);
    cy.wait('@getApiTrack');

    cy.get('wm-config-detail .wm-config-detail-item').should('have.length', 1);
    cy.get('wm-config-detail .wm-config-detail-header').click();
    cy.get('wm-config-detail .wm-config-detail-content')
      .should('have.length', 1)
      .and('contain.html', partiallyTranslatedGroups[0].items[0].content.it);
  });
});
```

Nota implementativa sui selettori usati nei test: `data.layers.ecTrack` (id `504` nel `config.json` reale, confermato incrociando `map-overlay-feature-collection.cy.ts`/`not-accessible-track.cy.ts`), `data.layers.ecPoi` per aprire il layer che contiene il POI mockato. `ILAYER.id` è tipizzato `string` ma il payload reale è un numero JSON puro (debito tecnico pre-esistente, non introdotto da questa feature) — il confronto usa `String(layer.id) === String(E2E_TRACKS_TEST_LAYER_ID)` per essere type-safe senza cambiare comportamento a runtime.

- [ ] **Step 2: Eseguire il test in locale**

Run: `cd core && npx cypress run --spec "cypress/e2e/app_52/config-detail-boxes.cy.ts"`

Expected: 5 test verdi.

- [ ] **Step 3: Commit**

```bash
git add core/cypress/e2e/app_52/config-detail-boxes.cy.ts
git commit -m "test(oc:8181): add e2e coverage for config_detail boxes on layer, ec_track and ec_poi"
```

---

## Task 4: Verifica manuale — interazione con `map-details.component.ts` (oc:8313)

Questo task non produce codice: è una verifica manuale esplicita richiesta dall'overview (emersa in Fase: challenge), perché non esiste oggi un test automatico su questa interazione.

- [ ] **Step 1: Avviare l'app e aprire un dettaglio con `config_detail` popolato**

Run: `cd core && npm start`, apri (via devtools/proxy con dati di test, o con lo stesso `config.json`/fixture del Task 3) un Layer, un EcTrack o un EcPoi con `config_detail` popolato con almeno 2-3 item.

- [ ] **Step 2: Verificare l'interazione con il calcolo dinamico dell'altezza del pannello**

Nel pannello di dettaglio (`map-details.component.ts`, oc:8313, `computeTargetHeight()`/`ResizeObserver`):
1. Apri un item dell'accordion `wm-config-detail` → verifica che l'altezza del pannello si aggiorni senza scatti visibili, senza overshoot oltre il contenuto reale, senza contenuto tagliato in basso.
2. Chiudi lo stesso item → verifica che l'altezza torni a restringersi in modo fluido.
3. Apri ed espandi rapidamente più item in sequenza → verifica che non ci sia "spazio bianco residuo" (lo stesso bug che oc:8313 ha corretto) quando l'ultimo item viene chiuso.

- [ ] **Step 3: Registrare l'esito in `notes.md`**

Se il comportamento è corretto: annotare in `docs/features/8181-.../notes.md` (sezione "Decisioni") che la verifica è stata eseguita con esito positivo, con la data.
Se emergono problemi: NON procedere al commit del Task 4 (non ce n'è uno) — tornare al piano wm-core Task 2 e correggere l'animazione/markup del componente `ConfigDetailComponent` prima di proseguire, poi ripetere questa verifica.

---

## Self-Review

**Spec coverage** (contro `overview.md` di questo repo):
- Bump submodule wm-core → Task 1 (nota di coordinamento già presente anche nel piano wm-core).
- Wiring EcPoi dopo la descrizione → Task 2.
- Test Cypress E2E su tutte e tre le risorse (non solo una) → Task 3, tre `it()` distinti + un quarto che verifica l'assenza di rendering quando `config_detail` è assente.
- Iniezione dato via `mockGetPoi()`/`mockGetTrack()`, non `conf-camminiditalia-1.json` → Task 3 (per EcTrack/EcPoi). Per Layer, correttamente NON tramite `mockGetPoi`/`mockGetTrack` (non applicabile a quella risorsa) ma tramite intercept dedicato su `confURL` — deviazione giustificata e documentata esplicitamente nella nota "provenienza dei dati per risorsa" del Task 3, non un uso implicito della fixture globale come genericamente vietato dall'overview.
- Verifica manuale oc:8313 → Task 4.

**Placeholder scan:** nessun "TBD"/"implement later"; il solo punto esplicitamente lasciato aperto (id esatto del layer 55 da verificare in CI) è dichiarato come tale con istruzione concreta su cosa fare se sbagliato, non un placeholder silenzioso.

**Type consistency:** `wm-config-detail`/`[groups]` usati in Task 2 sono lo stesso selector/input definiti nel piano wm-core (Task 2-3 di quel piano). Struttura `configDetailGroups` in Task 3 rispecchia esattamente `IConfigDetailBox`/`IConfigDetailInfoBoxItem` definiti in quel piano (Task 1).
