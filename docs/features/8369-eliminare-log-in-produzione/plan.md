> Ticket: oc:8369

# Eliminare log in produzione — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **⚠️ Vincolo Webmapp:** nessun `git commit`, `git add` o `git push` va eseguito autonomamente durante l'esecuzione di questo piano. Ogni task termina con un messaggio di commit suggerito (testo, non comando da eseguire) — il commit reale è un'azione manuale del developer dopo il review-gate.

**Goal:** Applicare la policy aziendale "niente log in produzione" tramite triage manuale di ogni chiamata `console.log/warn/error/debug/info` nei 3 repository coinvolti (webmapp-app, wm-core, map-core), classificandola in cancella / commenta con marker `// DEBUG:` / lascia intatta, secondo il criterio approvato in Fase: challenge.

**Architecture:** Nessuna modifica architetturale — solo modifiche line-level a chiamate `console.*` esistenti. Nessuna dipendenza funzionale tra i 3 repo per questo ticket: i task sono raggruppati per repo e possono essere eseguiti in qualsiasi ordine relativo tra repo diversi, ma sequenzialmente all'interno dello stesso repo (branch dedicato prima di ogni modifica).

**Tech Stack:** TypeScript, Angular 20, Karma/Jasmine (wm-core, map-core), Ionic build (webmapp-app).

**Spec:**
- `/Users/peco/Documents/Apps/webmapp-app/docs/features/8369-eliminare-log-in-produzione/overview.md` (repo principale)
- `/Users/peco/Documents/Apps/webmapp-app/core/src/app/shared/wm-core/docs/features/8369-eliminare-log-in-produzione/overview.md` (wm-core)
- `/Users/peco/Documents/Apps/webmapp-app/core/src/app/shared/map-core/docs/features/8369-eliminare-log-in-produzione/overview.md` (map-core)

## Global Constraints

- **Criterio di classificazione unico**, applicato a ogni singola occorrenza `console.*` nei 3 repo, in quest'ordine:
  1. Se la chiamata è dentro un blocco `catch`, un handler di rejection (`.then(ok, onRejected)`), o comunque un percorso di gestione errore → **LASCIA INTATTA**, qualsiasi sia il metodo (`log` incluso).
  2. Altrimenti, se il metodo è `console.error` o `console.warn` → **LASCIA INTATTA** (restano visibili anche in produzione).
  3. Altrimenti (`console.log`/`debug`/`info` fuori da catch): se è un dump di variabile senza etichetta (es. `console.log(data)`, `console.log(e)`), un separatore (`console.log('---------')`), o un pattern di trace IDE (`'------- ~ Component ~ metodo ~ var'`) → **CANCELLA** la riga.
  4. Altrimenti (ha un'etichetta testuale descrittiva, es. `console.log('label', value)` o `console.log('[Tag] messaggio')`) → **COMMENTA** con marker `// DEBUG: <riga originale esatta>`.
- **Eccezione che sovrascrive tutto**: se la riga è asserita da un test (`expect(console.X).toHaveBeenCalledWith(...)` o `spyOn(console, 'X')` sullo stesso metodo, nello `.spec.ts` corrispondente) → **NON TOCCARE**.
- **Normalizzazione**: i commenti pre-esistenti che disattivano già un `console.log` senza marker vengono riscritti con `// DEBUG: <contenuto>`.
- **Non toccare**: `core/src/main.ts:9-15` (mecanismo di override), `wm-core/utils/console-override.ts` (intero file, codice morto fuori scope).
- **Commit convention** (manuale, dopo review-gate): `fix(oc:8369): <descrizione task>` in ciascun repo coinvolto dal task.
- **Verifica finale per repo**: webmapp-app → `ionic build --configuration production` (da `core/`); wm-core → `npm run test`; map-core → `CI=true npx ng test map-core --configuration=ci` (o `nvm use 22 && npx ng test map-core` in locale se serve copertura completa).

---

## MAP-CORE

### Task 1: Setup branch map-core

**Files:** nessuno (solo comando git)

- [ ] **Step 1:** Verifica lo stato corrente del submodule
```bash
git -C core/src/app/shared/map-core status
```
- [ ] **Step 2:** Crea il branch dedicato (azione manuale del developer, non eseguire autonomamente senza conferma)
```bash
git -C core/src/app/shared/map-core checkout -b feature/oc-8369-eliminare-log-in-produzione
```

### Task 2: Direttive di interazione/disegno — position, pois, draw-ugc-poi, custom-tracks

**Files:**
- Modify: `core/src/app/shared/map-core/src/directives/position.directive.ts:297`
- Modify: `core/src/app/shared/map-core/src/directives/pois.directive.ts:123,442`
- Modify: `core/src/app/shared/map-core/src/directives/draw-ugc-poi.directive.ts:60`
- Modify: `core/src/app/shared/map-core/src/directives/custom-tracks.draw.directive.ts:236,257`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `position.directive.ts:297` | `console.log('position error', e);` (dentro `catch`) | LASCIA INTATTA |
| `pois.directive.ts:123` | `console.log('click');` (etichetta, fuori catch) | COMMENTA → `// DEBUG: console.log('click');` |
| `pois.directive.ts:442` | `console.log(currentPoi);` (dump variabile, fuori catch) | CANCELLA |
| `draw-ugc-poi.directive.ts:60` | `console.error(e);` | LASCIA INTATTA |
| `custom-tracks.draw.directive.ts:236` | `console.warn(err);` | LASCIA INTATTA |
| `custom-tracks.draw.directive.ts:257` | `console.error(err);` | LASCIA INTATTA |

- [ ] **Step 1:** Apri `pois.directive.ts`, commenta la riga 123 con marker `// DEBUG:`, cancella interamente la riga 442
- [ ] **Step 2:** Verifica che gli altri 4 file (position/draw-ugc-poi/custom-tracks) non necessitino modifiche (`LASCIA INTATTA` per tutte le loro occorrenze) — nessuna azione su questi file
- [ ] **Step 3:** Compila per verificare che non ci siano errori TS
```bash
cd core && npx tsc --noEmit -p src/app/shared/map-core/tsconfig.lib.json 2>&1 | head -50
```
Se il progetto non ha un `tsconfig.lib.json` dedicato o il comando fallisce per motivi di path, verifica invece con `npx ng build map-core` o, in mancanza, procedi al task successivo e lascia la verifica completa al build finale del submodule (Task 7).
- [ ] **Step 4 (commit manuale, dopo review):** `fix(oc:8369): triage console log su direttive interazione map-core`

### Task 3: Direttive feature/layer — feature-collection, hit-map, layer

**Files:**
- Modify: `core/src/app/shared/map-core/src/directives/feature-collection.directive.ts:452`
- Modify: `core/src/app/shared/map-core/src/directives/hit-map.directive.ts:75,121`
- Modify: `core/src/app/shared/map-core/src/directives/layer.directive.ts:486`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `feature-collection.directive.ts:452` | `console.log(error);` (dentro `catch`) | LASCIA INTATTA |
| `hit-map.directive.ts:75` | `console.error(e);` | LASCIA INTATTA |
| `hit-map.directive.ts:121` | `console.error('Failed to render hit map from geojson', e);` | LASCIA INTATTA |
| `layer.directive.ts:486` | `console.warn(e);` (dentro `catch`, guardia su `mapCmp.map` null) | LASCIA INTATTA |

- [ ] **Step 1:** Nessuna modifica richiesta in questo task — tutte le occorrenze restano intatte per regola 1/2 (catch o error/warn). Verifica con grep che non ne siano comparse altre non censite
```bash
grep -n "console\.\(log\|warn\|error\|debug\|info\)" \
  core/src/app/shared/map-core/src/directives/feature-collection.directive.ts \
  core/src/app/shared/map-core/src/directives/hit-map.directive.ts \
  core/src/app/shared/map-core/src/directives/layer.directive.ts
```
Se l'output corrisponde esattamente alle 4 righe della tabella, il task è chiuso senza modifiche al codice.
- [ ] **Step 2 (commit manuale, solo se qualcosa è stato effettivamente modificato):** `fix(oc:8369): verifica console log su direttive feature/layer map-core (nessuna modifica necessaria)`

### Task 4: Componenti mappa — controls.map.ts, map.component.ts

**Files:**
- Modify: `core/src/app/shared/map-core/src/components/controls/controls.map.ts:103`
- Modify: `core/src/app/shared/map-core/src/components/map/map.component.ts:455,466,469`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `controls.map.ts:103` | `console.log('toggleControls', this.toggle$.value);` (etichetta, fuori catch) | COMMENTA → `// DEBUG: console.log('toggleControls', this.toggle$.value);` |
| `map.component.ts:455` | `console.warn('No directive or onClick method found for layer:', topLayer.olUID);` | LASCIA INTATTA |
| `map.component.ts:466` | `console.log(_);` (dentro `catch` del click handler mappa) | LASCIA INTATTA |
| `map.component.ts:469` | `console.log(_);` (dentro `catch` del click handler mappa) | LASCIA INTATTA |

- [ ] **Step 1:** Apri `controls.map.ts`, commenta la riga 103 con marker `// DEBUG:`
- [ ] **Step 2:** Nessuna modifica su `map.component.ts` — tutte le 3 occorrenze restano intatte
- [ ] **Step 3 (commit manuale):** `fix(oc:8369): triage console log su componenti mappa map-core`

### Task 5: Utils generiche — cacheFallback, httpRequest, ol, styles

**Files:**
- Modify: `core/src/app/shared/map-core/src/utils/cacheFallback.ts:21,28`
- Modify: `core/src/app/shared/map-core/src/utils/httpRequest.ts:12,22,28,37,98,108,123,129`
- Modify: `core/src/app/shared/map-core/src/utils/ol.ts:1014`
- Modify: `core/src/app/shared/map-core/src/utils/styles.ts:93,189`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `cacheFallback.ts:21` | `console.error(`${logLabel}: invalid payload received, falling back to cache`, value);` | LASCIA INTATTA |
| `cacheFallback.ts:28` | `console.error(`${logLabel}: request failed, falling back to cache`, error);` | LASCIA INTATTA |
| `httpRequest.ts:12` | `console.warn(e);` | LASCIA INTATTA |
| `httpRequest.ts:22` | `console.warn(`Invalid URL: ${url}`);` | LASCIA INTATTA |
| `httpRequest.ts:28` | `console.warn(`Failed to fetch ${url}`);` | LASCIA INTATTA |
| `httpRequest.ts:37` | `console.warn(`Failed to fetch ${url}`);` | LASCIA INTATTA |
| `httpRequest.ts:75-76` | `console.log`/`console.error` dentro un blocco `/** ... */` di esempio JSDoc | NESSUNA AZIONE — non è codice eseguito, è testo di un commento di documentazione |
| `httpRequest.ts:98` | `// console.log('restored by cache: ', url);` (già commentato, stile vecchio) | NORMALIZZA → `// DEBUG: console.log('restored by cache: ', url);` |
| `httpRequest.ts:108` | `console.log(e);` — verificare se dentro `catch` prima di agire (vedi Step 1) | Da confermare in Step 1 |
| `httpRequest.ts:123` | `console.log(e);` — verificare se dentro `catch` prima di agire (vedi Step 1) | Da confermare in Step 1 |
| `httpRequest.ts:129` | `console.warn(e);` | LASCIA INTATTA |
| `ol.ts:939` | `console.log(intersection); // Output: [3, 4]` dentro un commento JSDoc di esempio | NESSUNA AZIONE — è testo di commento, non codice |
| `ol.ts:1014` | `console.warn(e);` | LASCIA INTATTA |
| `styles.ts:93` | `console.warn('WARNING: wrong geometry in feature ' + properties);` | LASCIA INTATTA |
| `styles.ts:189` | `console.warn('WARNING: wrong geometry in feature ' + properties);` | LASCIA INTATTA |

- [ ] **Step 1:** Apri `httpRequest.ts` e leggi il contesto delle righe 105-130 per confermare se le righe 108 e 123 (`console.log(e)`) sono dentro un `catch`:
```bash
sed -n '95,130p' core/src/app/shared/map-core/src/utils/httpRequest.ts
```
Se entrambe risultano dentro un `catch (e)` → LASCIA INTATTE per regola 1. Se una delle due non è in un `catch`, classificala come dump di variabile senza etichetta → CANCELLA.
- [ ] **Step 2:** Applica la normalizzazione alla riga 98 (marker `// DEBUG:`)
- [ ] **Step 3:** Nessuna modifica su `cacheFallback.ts`, `ol.ts:1014`, `styles.ts` (restano intatti)
- [ ] **Step 4 (commit manuale):** `fix(oc:8369): triage console log su utils generiche map-core`

### Task 6: Utils download offline — localForage.ts (eccezione performance.ts)

**Files:**
- Modify: `core/src/app/shared/map-core/src/utils/localForage.ts:65,417` (uniche righe con azione — tutte le altre occorrenze del file sono `console.error` e restano intatte)
- No-op: `core/src/app/shared/map-core/src/utils/performance.ts` (eccezione test)

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `localForage.ts:36,61,88,97,109,121,134,156,198,208,305,313,333,339,349,364,370,378,390,405,426,435,449,459` | vari `console.error(...)` (download/salvataggio tile, feature collection, hit map, icon blob) | LASCIA INTATTE (tutte, per regola 2) |
| `localForage.ts:65` | `console.log('Failed to download from Webmapp API', tilesId);` — verificato dentro `catch (err)` (righe 58-66) | LASCIA INTATTA (per regola 1, nonostante il metodo `log`) |
| `localForage.ts:417` | `console.log('Status update:', status);` in `updateStatus()`, unico segnale di avanzamento per i download tile/hitmap offline (area fragile CARG, vedi CLAUDE.md map-core oc:8219) | COMMENTA → `// DEBUG: console.log('Status update:', status);` |
| `performance.ts` (intero file, `startTime`/`endTime`) | asserito da `performance.spec.ts:19-23` (`spyOn(console, 'warn')`) | NON TOCCARE — eccezione test |

- [ ] **Step 1:** Conferma con grep che tutte le occorrenze `console.error` in `localForage.ts` elencate sopra restino intatte (nessuna modifica)
```bash
grep -n "console\.\(log\|warn\|error\|debug\|info\)" core/src/app/shared/map-core/src/utils/localForage.ts
```
- [ ] **Step 2:** Apri `localForage.ts` riga 417 (funzione `updateStatus`), commenta con marker `// DEBUG:`
- [ ] **Step 3:** Non toccare `performance.ts` — verifica solo che il test non venga rotto eseguendolo isolatamente
```bash
CI=true npx ng test map-core --configuration=ci --include='**/performance.spec.ts' 2>&1 | tail -30
```
- [ ] **Step 4 (commit manuale):** `fix(oc:8369): triage console log su localForage.ts map-core (performance.ts escluso, eccezione test)`

### Task 7: Verifica finale map-core

**Files:** nessuno

- [ ] **Step 1:** Esegui i test in configurazione CI (copre almeno gli utils, incluso `performance.spec.ts`)
```bash
cd core && CI=true npx ng test map-core --configuration=ci 2>&1 | tail -60
```
Expected: tutti i test passano (nessuna regressione rispetto allo stato pre-modifica).
- [ ] **Step 2:** Se disponibile un ambiente con GPU, esegui la suite completa per coprire anche i directive/component spec
```bash
nvm use 22 && npx ng test map-core 2>&1 | tail -80
```
- [ ] **Step 3:** Grep finale di controllo — nessun `console.*` deve essere rimasto non classificato
```bash
grep -rn "console\.\(log\|warn\|error\|debug\|info\)" core/src/app/shared/map-core/src --include="*.ts" | grep -v "\.spec\.ts"
```
Confronta l'output con le tabelle dei Task 2-6: ogni riga residua deve corrispondere a una voce "LASCIA INTATTA" o all'eccezione `performance.ts`.

---

## WM-CORE

### Task 8: Setup branch wm-core

**Files:** nessuno

- [ ] **Step 1:** Verifica lo stato corrente del submodule
```bash
git -C core/src/app/shared/wm-core status
```
- [ ] **Step 2:** Crea il branch dedicato
```bash
git -C core/src/app/shared/wm-core checkout -b feature/oc-8369-eliminare-log-in-produzione
```

### Task 9: wm-core.module.ts

**Files:**
- Modify: `core/src/app/shared/wm-core/projects/wm-core/src/wm-core.module.ts:210,218,289,290,306-311,317,328,331`
- No-op: stesse righe file, occorrenze `error`/`warn`: 231,234,237,240,243,253,260,267,274,286,319,323-325,333

**Classificazione:**

| Riga | Contenuto | Azione |
|---|---|---|
| 210 | `console.log('[WM_CORE_INITIALIZER] Starting initialization...');` | COMMENTA |
| 218 | `console.log('[WM_CORE_INITIALIZER] EnvironmentService initialized');` | COMMENTA |
| 231,234,237,240,243 | `console.error('[PostHog] ... is undefined/null!', ...)` (validazione, fuori catch) | LASCIA INTATTE (regola 2) |
| 253,260,267,274,286 | `console.warn('[PostHog] ... is invalid, skipping:', ...)` | LASCIA INTATTE (regola 2) |
| 289 | `console.log('[PostHog] Registering properties with values:', posthogProps);` | COMMENTA |
| 290 | `console.log('[PostHog] Number of valid properties:', ...);` | COMMENTA |
| 306-311 | `console.log('[PostHog] Config loaded, initializing PostHog with enabled:', ...)` (multilinea, dentro `try`, non `catch`) | COMMENTA (tutte le righe del blocco) |
| 317 | `console.log('[PostHog] PostHog initialized successfully via observable');` | COMMENTA |
| 319 | `console.error('[PostHog] Failed to initialize PostHog via observable:', error);` (dentro `catch`) | LASCIA INTATTA |
| 323-325 | `console.warn('[PostHog] No valid properties to register, skipping initAndRegister call');` (multilinea) | LASCIA INTATTE (regola 2) |
| 328 | `console.log('[WM_CORE_INITIALIZER] PostHog not configured, skipping initialization');` | COMMENTA |
| 331 | `console.log('[WM_CORE_INITIALIZER] Initialization completed successfully');` | COMMENTA |
| 333 | `console.error('[WM_CORE_INITIALIZER] Initialization failed:', error);` (dentro `catch`) | LASCIA INTATTA |

- [ ] **Step 1:** Apri il file, commenta con marker `// DEBUG:` le righe 210, 218, 289, 290, 317, 328, 331 (ciascuna su una riga singola)
- [ ] **Step 2:** Commenta il blocco multilinea 306-311 (`// DEBUG:` sulla prima riga del blocco, `//` semplice sulle righe di continuazione dello stesso statement)
- [ ] **Step 3:** Non toccare nessuna riga `console.error`/`console.warn` (231-286, 319, 323-325, 333)
- [ ] **Step 4 (commit manuale):** `fix(oc:8369): triage console log su wm-core.module.ts`

### Task 10: Services — camera, geolocation, storage, posthog-capacitor (eccezione)

**Files:**
- Modify: `core/src/app/shared/wm-core/projects/wm-core/src/services/storage.service.ts:57,95,115,346`
- No-op: `services/camera.service.ts:247`, `services/geolocation.service.ts:256,381,401,423`, `services/storage.service.ts:51,236,251,266,272,357`
- No-op (eccezione test): `services/posthog-capacitor.client.ts` (intero file)

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `camera.service.ts:247` | `console.log('Error setting photo blob', e);` (dentro `catch`) | LASCIA INTATTA |
| `geolocation.service.ts:256` | `console.warn('WebGeolocation: invalid position data');` | LASCIA INTATTA |
| `geolocation.service.ts:381` | `console.error('Error creating empty WmFeature:', error);` | LASCIA INTATTA |
| `geolocation.service.ts:401` | `console.warn('_createRecordedFeatureFromLocations: No locations provided');` | LASCIA INTATTA |
| `geolocation.service.ts:423` | `console.error('Error creating recorded feature from locations:', error);` | LASCIA INTATTA |
| `storage.service.ts:51,251,266,272,357` | `console.warn(err);` (varie) | LASCIA INTATTE |
| `storage.service.ts:57` | `// console.log('------- ~ file: storage.service.ts ~ line 92 ~ ... key', key);` (già commentato, stile vecchio) | NORMALIZZA → `// DEBUG: console.log('------- ~ file: storage.service.ts ~ line 92 ~ StorageService ~ getByKey ~ key', key);` |
| `storage.service.ts:95` | `console.log('------- ~ StorageService ~ getMBTiles ~ path', path);` (trace IDE) | CANCELLA |
| `storage.service.ts:115` | `console.log('------- ~ StorageService ~ init ~ init');` (trace IDE) | CANCELLA |
| `storage.service.ts:236` | `console.error('Unable to write file', e);` | LASCIA INTATTA |
| `storage.service.ts:346` | `// console.log('------- ~ file: storage.service.ts ~ line 150 ~ ... value', value);` (già commentato, stile vecchio) | NORMALIZZA → `// DEBUG: console.log(...)` (stesso contenuto, solo marker aggiunto) |
| `posthog-capacitor.client.ts` (tutte le occorrenze) | asserite da `posthog-capacitor.client.spec.ts:135,167,184,205,226` | NON TOCCARE — eccezione test |

- [ ] **Step 1:** Nessuna modifica su `camera.service.ts` e `geolocation.service.ts` — verifica con grep che restino solo le occorrenze della tabella
- [ ] **Step 2:** Apri `storage.service.ts`: cancella riga 95 e riga 115; normalizza righe 57 e 346 aggiungendo `// DEBUG:` davanti al contenuto già commentato (senza rimuovere il doppio slash esistente, sostituendolo con il marker)
- [ ] **Step 3:** Non toccare `posthog-capacitor.client.ts` — verifica il test correlato prima di chiudere il task
```bash
npx ng test wm-core --include='**/posthog-capacitor.client.spec.ts' 2>&1 | tail -30
```
- [ ] **Step 4 (commit manuale):** `fix(oc:8369): triage console log su services wm-core (camera, geolocation, storage)`

### Task 11: Store — auth.effects.ts, conf.reducer.ts

**Files:**
- No-op: `store/auth/auth.effects.ts:49`, `store/conf/conf.reducer.ts:198`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `auth.effects.ts:49` | `console.log('error', error);` dentro `catchError` dell'effetto di login | LASCIA INTATTA (regola 1) |
| `conf.reducer.ts:198` | `console.log('error');` dentro `catch (_)` | LASCIA INTATTA (regola 1) |

- [ ] **Step 1:** Verifica con grep che non ci siano altre occorrenze `console.*` in questi 2 file oltre a quelle censite
```bash
grep -n "console\.\(log\|warn\|error\|debug\|info\)" \
  core/src/app/shared/wm-core/projects/wm-core/src/store/auth/auth.effects.ts \
  core/src/app/shared/wm-core/projects/wm-core/src/store/conf/conf.reducer.ts
```
- [ ] **Step 2:** Nessuna modifica al codice — task di sola verifica
- [ ] **Step 3 (commit manuale, solo se emergono modifiche):** `fix(oc:8369): verifica console log su auth.effects.ts e conf.reducer.ts (nessuna modifica necessaria)`

### Task 12: Store features/ec — ec.selector.ts, ec.service.ts (eccezione utils.ts)

**Files:**
- Modify: `store/features/ec/ec.service.ts:91,150`
- No-op: `store/features/ec/ec.selector.ts:111`, `ec.service.ts:80,123`
- No-op (eccezione test): `store/features/ec/utils.ts` (intero file)

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `ec.selector.ts:111` | `console.warn(...)` | LASCIA INTATTA |
| `ec.service.ts:80` | `console.warn('getEcTrack: Failed to update localForage cache', err)` | LASCIA INTATTA |
| `ec.service.ts:91` | `console.log(\`No changes detected for track ${id}, using cached data.\`);` — diagnostica del bug cache oc:8374 | COMMENTA → `// DEBUG: console.log(...)` |
| `ec.service.ts:123` | `console.warn('Error parsing cached data. Ignoring cached data.', e);` | LASCIA INTATTA |
| `ec.service.ts:150` | `console.log('No changes detected for pois, using cached data.');` — stessa diagnostica oc:8374 | COMMENTA → `// DEBUG: console.log(...)` |
| `store/features/ec/utils.ts` (tutte le occorrenze) | asserite da `ec/utils.spec.ts:82,101` | NON TOCCARE — eccezione test |

- [ ] **Step 1:** Nessuna modifica su `ec.selector.ts`
- [ ] **Step 2:** Apri `ec.service.ts`, commenta le righe 91 e 150 con marker `// DEBUG:`; lascia intatte le righe 80 e 123
- [ ] **Step 3:** Non toccare `utils.ts` — verifica il test correlato
```bash
npx ng test wm-core --include='**/ec/utils.spec.ts' 2>&1 | tail -30
```
- [ ] **Step 4 (commit manuale):** `fix(oc:8369): triage console log su store/features/ec wm-core (utils.ts escluso, eccezione test)`

### Task 13: Store features/ugc — ugc.effects.ts, ugc.service.ts

**Files:**
- Modify: `store/features/ugc/ugc.service.ts:94,97,117,120,187,192,210,228,233,251,306-308`
- No-op: `ugc.service.ts:99,122,160,199-201,204-207,212,240-242,245-248,253,324,344,362`, `ugc.effects.ts:203,213`

**Classificazione:**

| Riga | Contenuto | Azione |
|---|---|---|
| 94 | `// console.log(\`fetchUgcPois sync: ...\`);` (già commentato, stile vecchio) | NORMALIZZA → `// DEBUG: ...` |
| 97 | `// console.log('fetchUgcPois: Synchronization completed successfully');` (già commentato) | NORMALIZZA |
| 99 | `console.error('fetchUgcPois: Error during synchronization:', error);` (catch) | LASCIA INTATTA |
| 117 | `// console.log(\`fetchUgcTracks sync: ...\`);` (già commentato) | NORMALIZZA |
| 120 | `// console.log('fetchUgcTracks: Synchronization completed successfully');` (già commentato) | NORMALIZZA |
| 122 | `console.error('fetchUgcTracks: Error during synchronization:', error);` (catch) | LASCIA INTATTA |
| 160 | `console.error('getPoi:', error);` (catch) | LASCIA INTATTA |
| 187 | `// console.log(\`POI with UUID ... Skipping save.\`);` (già commentato) | NORMALIZZA |
| 192 | `console.log(\`🔄 Syncing POI ${uuid} (privacy agree is active)\`);` (fuori catch, etichettato) | COMMENTA |
| 199-201 | `console.log(\`✅ POI with UUID ${uuid} synchronized and removed.\`);` (multilinea, dentro `try` non `catch`) | COMMENTA (tutte le righe del blocco) |
| 204-207 | `console.error(\`Error during synchronization of POI ${uuid}:\`, poiError);` (dentro `catch (poiError)`) | LASCIA INTATTA |
| 210 | `console.log('✅ POI synchronization completed successfully');` | COMMENTA |
| 212 | `console.error('Error during POI synchronization:', error);` (catch) | LASCIA INTATTA |
| 228 | `// console.log(\`Track with UUID ... Skipping save.\`);` (già commentato) | NORMALIZZA |
| 233 | `console.log(\`🔄 Syncing Track ${uuid} (privacy agree is active)\`);` | COMMENTA |
| 240-242 | `console.log(\`✅ Track with UUID ${uuid} synchronized and removed.\`);` (multilinea) | COMMENTA (tutte le righe del blocco) |
| 245-248 | `console.error(\`Error during synchronization of track ${uuid}:\`, trackError);` (catch) | LASCIA INTATTA |
| 251 | `console.log('✅ Track synchronization completed successfully');` | COMMENTA |
| 253 | `console.error('Error during track synchronization:', error);` (catch) | LASCIA INTATTA |
| 306-308 | `console.log('🔒 User not logged in or privacy agree not given, skipping UGC POI fetch from API');` (multilinea, fuori catch) | COMMENTA (tutte le righe del blocco) |
| 324 | `console.error('syncUgc: Error during synchronization:', error);` (catch) | LASCIA INTATTA |
| 344 | `console.error('syncUgcPois: Error during synchronization:', error);` (catch) | LASCIA INTATTA |
| 362 | `console.error('syncUgcTracks: Error during synchronization:', error);` (catch) | LASCIA INTATTA |
| `ugc.effects.ts:203` | `console.error('Error loading UGC pois:', error);` (catch) | LASCIA INTATTA |
| `ugc.effects.ts:213` | `console.error('Error loading UGC tracks:', error);` (catch) | LASCIA INTATTA |

- [ ] **Step 1:** Apri `ugc.service.ts`, normalizza le righe 94, 97, 117, 120, 187, 228 aggiungendo il marker `// DEBUG:` al contenuto già commentato
- [ ] **Step 2:** Commenta con `// DEBUG:` le righe 192, 210, 233, 251 e i blocchi multilinea 199-201, 240-242, 306-308
- [ ] **Step 3:** Non toccare nessuna riga `console.error` (99,122,160,204-207,212,245-248,253,324,344,362) né `ugc.effects.ts`
- [ ] **Step 4 (commit manuale):** `fix(oc:8369): triage console log su store/features/ugc wm-core`

### Task 14: Componenti/servizi minori — export-to, feature-useful-urls, lang.service, search-bar, swiper

**Files:**
- Modify: `buttons/export-to/export-to.component.ts:68,103,151`, `localization/lang.service.ts:83`, `search-bar/search-bar.component.ts:66`
- No-op: `export-to.component.ts:67,102,131`, `feature-useful-urls/feature-useful-urls.component.ts:83`, `lang.service.ts:136`, `swiper/swiper.component.ts:83`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `export-to.component.ts:67` | `console.error(e);` (catch) | LASCIA INTATTA |
| `export-to.component.ts:68` | `console.log('---------');` (separatore, stesso catch) | CANCELLA |
| `export-to.component.ts:102` | `console.error(e);` (catch) | LASCIA INTATTA |
| `export-to.component.ts:103` | `console.log('---------');` (separatore, stesso catch) | CANCELLA |
| `export-to.component.ts:131` | `console.error("Errore durante l'esportazione e la condivisione:", e);` (catch) | LASCIA INTATTA |
| `export-to.component.ts:151` | `console.log('Condivisione annullata');` (handler bottone "No" di un alert, non catch, etichettato) | COMMENTA |
| `feature-useful-urls.component.ts:83` | `console.error("Errore durante l'esportazione e la condivisione:", e);` (catch, stesso messaggio duplicato di export-to) | LASCIA INTATTA |
| `lang.service.ts:83` | `console.log('use device lang', deviceLang);` (etichettato, fuori catch) | COMMENTA |
| `lang.service.ts:136` | `console.error(e);` | LASCIA INTATTA |
| `search-bar.component.ts:66` | `console.log(search);` (dump variabile senza etichetta) | CANCELLA |
| `swiper.component.ts:83` | `console.error('Error initializing Swiper:', error);` | LASCIA INTATTA |

- [ ] **Step 1:** Apri `export-to.component.ts`: cancella righe 68 e 103 (i separatori `'---------'`, lasciando intatti i `console.error` adiacenti); commenta la riga 151 con `// DEBUG:`
- [ ] **Step 2:** Apri `lang.service.ts`, commenta la riga 83 con `// DEBUG:`; lascia intatta la riga 136
- [ ] **Step 3:** Apri `search-bar.component.ts`, cancella la riga 66
- [ ] **Step 4:** Nessuna modifica su `feature-useful-urls.component.ts` e `swiper.component.ts`
- [ ] **Step 5 (commit manuale):** `fix(oc:8369): triage console log su componenti minori wm-core`

### Task 15: Utils — api-cache-handler.ts, localForage.ts, demo/main.ts

**Files:**
- Modify: `utils/api-cache-handler.ts:57`, `utils/localForage.ts:583`
- No-op: `api-cache-handler.ts:23,52`, `localForage.ts:40,46,51,164,181,255,285,290,316,323,466`, `demo/src/main.ts:6`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `api-cache-handler.ts:23` | `console.warn('Error parsing cached data. Ignoring cache.', e);` | LASCIA INTATTA |
| `api-cache-handler.ts:52` | `console.warn('Error writing cache. Skipping last-modified update.', e);` | LASCIA INTATTA |
| `api-cache-handler.ts:57` | `console.log('No changes detected, using cached data.');` — diagnostica bug cache oc:8374 | COMMENTA → `// DEBUG: console.log('No changes detected, using cached data.');` |
| `localForage.ts:40,46,51` | `console.warn(\`downloadFile: ...\`);` | LASCIA INTATTE |
| `localForage.ts:164,181` | `console.error('getLastSynchronizedUgc.../Track: ...', error);` | LASCIA INTATTE |
| `localForage.ts:255` | `console.error(errorMsg, error);` | LASCIA INTATTA |
| `localForage.ts:285,290` | `console.warn(\`downloadBlobUrl: ...\`);` | LASCIA INTATTE |
| `localForage.ts:316` | `console.warn(\`saveDeviceImg: Failed to download ${url}\`);` | LASCIA INTATTA |
| `localForage.ts:323` | `console.error(\`saveDeviceImg: Failed to save ${url} to deviceImg\`, error);` | LASCIA INTATTA |
| `localForage.ts:466` | `console.warn(\`saveImg: Failed to download ${url}\`);` | LASCIA INTATTA |
| `localForage.ts:583` | `console.log('Status update:', status);` in `updateStatus()` — unico segnale di avanzamento download offline (area fragile, CLAUDE.md oc:8190) | COMMENTA → `// DEBUG: console.log('Status update:', status);` |
| `demo/src/main.ts:6` | `.catch(err => console.error(err));` | LASCIA INTATTA (app demo, catch) |

- [ ] **Step 1:** Apri `api-cache-handler.ts`, commenta la riga 57 con `// DEBUG:`; lascia intatte le righe 23 e 52
- [ ] **Step 2:** Apri `localForage.ts`, commenta la riga 583 con `// DEBUG:`; lascia intatte tutte le altre occorrenze (tutte `error`/`warn`)
- [ ] **Step 3:** Nessuna modifica su `demo/src/main.ts`
- [ ] **Step 4 (commit manuale):** `fix(oc:8369): triage console log su utils wm-core (api-cache-handler, localForage)`

### Task 16: Verifica finale wm-core

**Files:** nessuno

- [ ] **Step 1:** Esegui la suite di test completa
```bash
cd core/src/app/shared/wm-core && npm run test 2>&1 | tail -80
```
Expected: tutti i test passano, inclusi `posthog-capacitor.client.spec.ts` ed `ec/utils.spec.ts` (eccezioni non modificate).
- [ ] **Step 2:** Grep finale di controllo su tutti i 20 file dell'overview
```bash
grep -rn "console\.\(log\|warn\|error\|debug\|info\)" core/src/app/shared/wm-core/projects --include="*.ts" | grep -v "\.spec\.ts"
```
Confronta con le tabelle dei Task 9-15: ogni riga residua deve corrispondere a una voce "LASCIA INTATTA" o all'eccezione `posthog-capacitor.client.ts`/`utils.ts` (ec).

---

## REPO PRINCIPALE (webmapp-app)

### Task 17: Setup branch repo principale

**Files:** nessuno

- [ ] **Step 1:** Verifica lo stato corrente
```bash
git status
```
- [ ] **Step 2:** Crea il branch dedicato
```bash
git checkout -b feature/oc-8369-eliminare-log-in-produzione
```

### Task 18: main.ts

**Files:**
- Modify: `core/src/main.ts:17,20`
- No-op: `core/src/main.ts:9-15,22,23`

**Classificazione:**

| Riga | Contenuto | Azione |
|---|---|---|
| 9-15 | meccanismo di override (`if (environment.production) { console.log = ... }`) | NON TOCCARE — meccanismo esistente, fuori scope |
| 17 | `console.log('🚀 Starting Angular app...');` (fuori catch, etichettato) | COMMENTA → `// DEBUG: console.log('🚀 Starting Angular app...');` |
| 20 | `console.log('✅ Angular app bootstrapped successfully')` (fuori catch, etichettato, dentro `.then()`) | COMMENTA → `// DEBUG: console.log('✅ Angular app bootstrapped successfully')` (attenzione: fa parte di un'espressione `.then(() => console.log(...))` — commentare l'intera riga richiede riscrivere la callback come `.then(() => {})` o spostare il log su riga propria commentata; vedi Step 1) |
| 22 | `console.error('❌ Error bootstrapping Angular app:', err);` (dentro `.catch()`) | LASCIA INTATTA |
| 23 | `console.log(err);` (stesso `.catch()` della riga 22) | LASCIA INTATTA (regola 1: dentro un percorso di gestione errore, anche se ridondante con la riga 22) |

- [ ] **Step 1:** Apri `core/src/main.ts`. La riga 20 è una arrow function inline (`.then(() => console.log('✅ Angular app bootstrapped successfully'))`) — per commentarla senza rompere la sintassi, riscrivi come:
```typescript
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => {
    // DEBUG: console.log('✅ Angular app bootstrapped successfully');
  })
  .catch(err => {
    console.error('❌ Error bootstrapping Angular app:', err);
    console.log(err);
  });
```
E la riga 17 diventa:
```typescript
// DEBUG: console.log('🚀 Starting Angular app...');
```
- [ ] **Step 2:** Non toccare le righe 9-15 (override) né 22-23 (dentro il `.catch()`)
- [ ] **Step 3 (commit manuale):** `fix(oc:8369): triage console log su main.ts`

### Task 19: settings.component.ts

**Files:**
- Modify: `core/src/app/components/settings/settings.component.ts:105,109,116,125,134,137`
- No-op: `settings.component.ts:96,139,172`

**Classificazione:**

| Riga | Contenuto | Azione |
|---|---|---|
| 96 | `console.warn(alertError);` (handler di rejection di un `alert.present().then(...)`) | LASCIA INTATTA (regola 2) |
| 105 | `console.log('Local storage cleared');` | COMMENTA |
| 109 | `console.log('Session storage cleared');` | COMMENTA |
| 116 | `console.log(\`IndexedDB ${db.name} deleted\`);` | COMMENTA |
| 125 | `console.log(\`Cache ${key} deleted\`);` | COMMENTA |
| 134 | `console.log(\`Cookie ${name} deleted\`);` | COMMENTA |
| 137 | `console.log('WebView data cleared');` | COMMENTA |
| 139 | `console.error('Error clearing WebView data', error);` (catch) | LASCIA INTATTA |
| 172 | `console.warn(alertError);` (stesso pattern di riga 96, altro alert) | LASCIA INTATTA (regola 2) |

- [ ] **Step 1:** Apri il file, commenta con marker `// DEBUG:` le righe 105, 109, 116, 125, 134, 137 — sono l'unico feedback disponibile per l'azione distruttiva `clearWebViewData()`, quindi commenta (non cancellare) per regola "unico segnale diagnostico di area critica"
- [ ] **Step 2:** Non toccare le righe 96, 139, 172
- [ ] **Step 3 (commit manuale):** `fix(oc:8369): triage console log su settings.component.ts`

### Task 20: intro.component.ts, store.service.ts, base-save.component.ts

**Files:**
- Modify: `core/src/app/pages/home/intro/intro.component.ts:24`, `core/src/app/services/store.service.ts:35`
- No-op: `core/src/app/components/base-save.component.ts/base-save.component.ts:37`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `intro.component.ts:24` | `console.log('------- ~ IntroComponent ~ goTo ~ pageName', pageName);` (trace IDE) | CANCELLA |
| `store.service.ts:35` | `console.log("------- ~ StoreService ~ buy ~ coinQuantity", coinQuantity);` (trace IDE) | CANCELLA |
| `base-save.component.ts/base-save.component.ts:37` | `console.log('Form completely visible');` — verificato: è dentro un blocco `/** ... */` di esempio JSDoc, non codice eseguito | NESSUNA AZIONE |

- [ ] **Step 1:** Apri `intro.component.ts`, cancella interamente la riga 24
- [ ] **Step 2:** Apri `store.service.ts`, cancella interamente la riga 35
- [ ] **Step 3:** Confermare che `base-save.component.ts/base-save.component.ts:37` sia dentro un commento (già verificato in fase di pianificazione) — nessuna modifica
```bash
sed -n '20,40p' "core/src/app/components/base-save.component.ts/base-save.component.ts"
```
- [ ] **Step 4 (commit manuale):** `fix(oc:8369): rimuovi trace di debug in intro.component.ts e store.service.ts`

### Task 21: download-panel.component.ts, map.page.ts

**Files:**
- Modify: `core/src/app/pages/map/map.page.ts:337,383`
- No-op: `core/src/app/pages/map/download-panel/download-panel.component.ts:118,126,154`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `download-panel.component.ts:118` | `console.error('downloadPanel: confMAP.tiles[0] is "satellite", ...');` | LASCIA INTATTA |
| `download-panel.component.ts:126` | `console.error('downloadPanel: confMAP.tiles[0] is missing, aborting track download');` | LASCIA INTATTA |
| `download-panel.component.ts:154` | `console.error('downloadPanel: confMAP.tiles[0] is missing, aborting bounding box tiles download');` | LASCIA INTATTA |
| `map.page.ts:337` | `console.log('downloadOverlay');` — disambigua i due metodi omonimi `downloadOverlay()` documentati in CLAUDE.md | COMMENTA → `// DEBUG: console.log('downloadOverlay');` |
| `map.page.ts:383` | `console.log(data);` in `toggleDirective()`, dump variabile senza etichetta, fuori catch | CANCELLA |

- [ ] **Step 1:** Nessuna modifica su `download-panel.component.ts`
- [ ] **Step 2:** Apri `map.page.ts`: commenta la riga 337 con marker `// DEBUG:`; cancella interamente la riga 383
- [ ] **Step 3 (commit manuale):** `fix(oc:8369): triage console log su map.page.ts (download-panel.component.ts invariato)`

### Task 22: share.service.ts, communication.service.ts

**Files:**
- Modify: `core/src/app/services/share.service.ts:54-57`
- No-op: `core/src/app/services/base/communication.service.ts:55`

**Classificazione:**

| File:Riga | Contenuto | Azione |
|---|---|---|
| `share.service.ts:54-57` | `console.log('------- ~ file: share.service.ts ~ line 20 ~ ShareService ~ share ~ shareRet', shareRet);` (multilinea, trace IDE) | CANCELLA (tutte le righe del blocco) |
| `communication.service.ts:55` | `console.warn(err);` | LASCIA INTATTA |

- [ ] **Step 1:** Apri `share.service.ts`, cancella l'intero blocco multilinea (righe 54-57, lo statement `console.log(...)` completo)
- [ ] **Step 2:** Nessuna modifica su `communication.service.ts`
- [ ] **Step 3 (commit manuale):** `fix(oc:8369): rimuovi trace di debug in share.service.ts`

### Task 23: Verifica finale repo principale

**Files:** nessuno

- [ ] **Step 1:** Esegui il build di produzione (deve continuare a funzionare, vedi CLAUDE.md oc:8382 sul fix già applicato a questo build)
```bash
cd core && ionic build --configuration production 2>&1 | tail -80
```
Expected: build completato senza errori TS/Angular.
- [ ] **Step 2:** Esegui i test Karma
```bash
cd core && npm run test 2>&1 | tail -60
```
- [ ] **Step 3:** Grep finale di controllo sui 9 file dell'overview
```bash
grep -rn "console\.\(log\|warn\|error\|debug\|info\)" core/src --include="*.ts" | grep -v "/shared/wm-core/\|/shared/map-core/\|/shared/wm-types/"
```
Confronta con le tabelle dei Task 18-22: ogni riga residua deve corrispondere a una voce "LASCIA INTATTA".

---

## Self-Review

**1. Coverage overview → piano:**
- Repo principale: tutti i 9 file dell'overview coperti (Task 18-22) ✓
- wm-core: tutti i 20 file dell'overview coperti (Task 9-15) ✓
- map-core: tutti i 15 file dell'overview coperti (Task 2-6) ✓
- Eccezioni test (posthog-capacitor.client.ts, ec/utils.ts, performance.ts) esplicitamente marcate NON TOCCARE con verifica del test correlato ✓
- Regola "console.log in catch resta intatto" applicata coerentemente a tutte le occorrenze trovate nei 3 repo (position.directive.ts, map.component.ts, feature-collection.directive.ts, auth.effects.ts, conf.reducer.ts, camera.service.ts, main.ts:23, localForage.ts:65 map-core) ✓
- Casi "unico segnale diagnostico area fragile" tutti presenti: settings.component.ts, map.page.ts:337, localForage.ts (wm-core:583, map-core:417), api-cache-handler.ts:57, ec.service.ts:91/150 ✓
- Normalizzazione marker su commenti pre-esistenti: storage.service.ts (57,346), ugc.service.ts (94,97,117,120,187,228), httpRequest.ts (98) ✓

**2. Placeholder scan:** nessuna istruzione generica del tipo "gestisci opportunamente" — ogni riga ha un'azione concreta (CANCELLA/COMMENTA/LASCIA INTATTA) con il contenuto esatto della riga.

**3. Type/coerenza:** non applicabile (nessuna interfaccia/tipo introdotto — solo modifiche a statement `console.*` esistenti).
