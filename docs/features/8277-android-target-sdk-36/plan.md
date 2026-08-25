> Ticket: oc:8277

# [android] api target — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Commit convention:** `feat(oc:8277): ...` — i commit sono istruzioni testuali per il developer, non vanno eseguiti automaticamente durante l'esecuzione del piano.

**Goal:** Aggiornare `compileSdkVersion` e `targetSdkVersion` da 35 a 36 nel gulpfile, per soddisfare il requisito Google Play (targetSdk ≥ API 36 dal 31/08/2026), senza toccare Capacitor né aggiungere fix comportamentali.

**Architecture:** Modifica puntuale di due regex di sostituzione in `_updateAndroidFiles()` (`gulpfile.js`), la funzione Android-only che scrive `variables.gradle` per ogni istanza ad ogni build. Nessun nuovo file, nessuna nuova funzione.

**Tech Stack:** Gulp 4, Node.js, Android Gradle Plugin 8.10.0, Gradle 8.11.1, Capacitor 7.4.5 (invariato).

## Global Constraints

- `minSdkVersion` resta 28 — non toccare la riga 985 di `gulpfile.js`
- Capacitor resta alla v7.4.5 — nessuna modifica a `package.json`/`@capacitor/*`
- Nessuno smoke test manuale, nessun fix difensivo (es. `android:enableOnBackInvokedCallback`), nessun upload su Play Console — tutto out of scope per questo ciclo (vedi `docs/features/8277-android-target-sdk-36/overview.md`)
- Unica istanza su cui verificare la build: `camminiditalia`
- `instances/` è interamente gitignored — le modifiche vanno solo in `gulpfile.js`, mai nei file generati sotto `instances/<name>/android/`

---

### Task 1: Verificare/installare Android SDK Platform 36 e Build-Tools 36

**Files:**
- Nessun file di repo modificato — solo verifica ambiente locale

**Interfaces:**
- Nessuna (task di setup ambiente, propedeutico al Task 3)

- [ ] **Step 1: Verificare le piattaforme SDK installate**

```bash
ls ~/Library/Android/sdk/platforms/
```

Expected (prima del fix): solo `android-33 android-34 android-35` — **manca `android-36`**. Se `android-36` è già presente, salta al Task 2.

- [ ] **Step 2: Verificare se `sdkmanager` (cmdline-tools) è disponibile**

```bash
which sdkmanager || find ~/Library/Android/sdk/cmdline-tools -maxdepth 2 -iname "sdkmanager" 2>/dev/null
```

Expected: nessun output (né `sdkmanager` in PATH, né una directory `cmdline-tools` sotto l'SDK) — in questo repo `cmdline-tools` non risulta installato, quindi l'installazione della piattaforma 36 va fatta da GUI, non da CLI.

- [ ] **Step 3: Installare Android SDK Platform 36 e Build-Tools 36 da Android Studio**

Apri Android Studio → **Settings/Preferences → Languages & Frameworks → Android SDK**:
- Tab "SDK Platforms": seleziona **Android 16.0 ("Baklava") / API 36** → Apply
- Tab "SDK Tools": seleziona **Android SDK Build-Tools 36** → Apply

(Se preferisci CLI e vuoi installare prima `cmdline-tools`, questo è fuori scope di questo task — usa la GUI.)

- [ ] **Step 4: Verificare l'installazione**

```bash
ls ~/Library/Android/sdk/platforms/
ls ~/Library/Android/sdk/build-tools/
```

Expected: `android-36` presente nella prima lista, una directory `36.x.x` presente nella seconda.

---

### Task 2: Aggiornare `compileSdkVersion` e `targetSdkVersion` in `gulpfile.js`

**Files:**
- Modify: `gulpfile.js:985-987` (funzione `_updateAndroidFiles`)

**Interfaces:**
- Consumes: nessuna (modifica di due stringhe letterali all'interno di una pipeline `gulp-replace` già esistente)
- Produces: nessuna nuova interfaccia — il comportamento osservabile è il contenuto generato in `instances/<name>/android/variables.gradle` ad ogni build (`compileSdkVersion = 36`, `targetSdkVersion = 36`)

- [ ] **Step 1: Leggere il codice attuale per conferma**

```bash
sed -n '983,995p' gulpfile.js
```

Expected output:
```js
        gulp
          .src(variablesGradlePath)
          .pipe(replace(/minSdkVersion = ([0-9]{2})/g, 'minSdkVersion = 28'))
          .pipe(replace(/compileSdkVersion = ([0-9]{2})/g, 'compileSdkVersion = 35'))
          .pipe(replace(/targetSdkVersion = ([0-9]{2})/g, 'targetSdkVersion = 35'))
          .pipe(gulp.dest(instancesDir + instanceName + '/android/'))
```

- [ ] **Step 2: Applicare la modifica**

In `gulpfile.js`, sostituisci le righe 986-987:

```js
          .pipe(replace(/compileSdkVersion = ([0-9]{2})/g, 'compileSdkVersion = 35'))
          .pipe(replace(/targetSdkVersion = ([0-9]{2})/g, 'targetSdkVersion = 35'))
```

con:

```js
          .pipe(replace(/compileSdkVersion = ([0-9]{2})/g, 'compileSdkVersion = 36'))
          .pipe(replace(/targetSdkVersion = ([0-9]{2})/g, 'targetSdkVersion = 36'))
```

La riga 985 (`minSdkVersion = 28`) resta invariata.

- [ ] **Step 3: Verificare che la modifica sia l'unica diff nel file**

```bash
git diff gulpfile.js
```

Expected: solo 2 righe modificate (`35` → `36` su `compileSdkVersion` e `targetSdkVersion`), nessun'altra differenza. Se compare altro, rivedi lo Step 2.

- [ ] **Step 4: Commit**

```bash
git add gulpfile.js
git commit -m "feat(oc:8277): bump compileSdkVersion e targetSdkVersion android a 36"
```

---

### Task 3: Build Android locale dell'istanza `camminiditalia` e verifica assenza errori

**Files:**
- Nessun file modificato — solo esecuzione ed osservazione dell'output di build

**Interfaces:**
- Consumes: il valore `36` scritto da `gulpfile.js` (Task 2) in `instances/camminiditalia/android/variables.gradle` alla prossima generazione della piattaforma Android

- [ ] **Step 1: Eseguire la build Android per l'istanza `camminiditalia`**

```bash
npx gulp build-android -i camminiditalia -g <GEOHUB_INSTANCE_ID> --verbose
```

Sostituisci `<GEOHUB_INSTANCE_ID>` con l'ID reale dell'istanza `camminiditalia` su Geohub (non presente nel repo, va fornito dal developer che esegue il task — richiede credenziali/accesso al backend live, coerente con quanto già annotato in `docs/features/8246-validazione-dimensioni-splash-icon-cordova-res/notes.md` per lo stesso task di build). Se le credenziali/backend non sono disponibili in questo momento, esegui questo step manualmente prima del merge e riporta l'esito in `docs/features/8277-android-target-sdk-36/notes.md`.

Expected: il comando termina con `Finished 'build-android'` (o messaggio equivalente di successo di Gulp) e **senza** eccezioni non gestite, senza `Error` da Gradle relativi a `compileSdkVersion`/`targetSdkVersion` (es. `Failed to find target with hash string 'android-36'`, che indicherebbe che il Task 1 non è stato completato correttamente).

- [ ] **Step 2: Verificare il valore scritto in `variables.gradle`**

```bash
cat instances/camminiditalia/android/variables.gradle
```

Expected:
```
ext {
    minSdkVersion = 28
    compileSdkVersion = 36
    targetSdkVersion = 36
    ...
}
```

- [ ] **Step 3: Se la build fallisce per un errore Gradle non riconducibile al Task 1**

Non applicare fix difensivi non previsti dall'overview (out of scope: nessuna modifica ad AndroidX, cordova-android, o manifest). Registra l'errore esatto in `docs/features/8277-android-target-sdk-36/notes.md` (sezione "Bug trovati") e valuta con il developer se serve una re-stima (vedi `Fase: execution: re-estimation` nel workflow `wm-plan`) prima di proseguire.

- [ ] **Step 4: Registrare l'esito in notes.md**

Aggiungi a `docs/features/8277-android-target-sdk-36/notes.md` una riga che conferma build riuscita (o l'errore riscontrato) per `camminiditalia`, con timestamp e comando esatto eseguito.

---

## Self-Review

**Spec coverage:**
- Verifica/installazione Android SDK Platform 36 → Task 1 ✓
- `compileSdkVersion` 35→36 → Task 2 ✓
- `targetSdkVersion` 35→36 → Task 2 ✓
- `minSdkVersion` invariato → Global Constraints + Task 2 Step 2 (non toccato) ✓
- Capacitor invariato → Global Constraints ✓
- Build locale `camminiditalia` senza errori → Task 3 ✓
- Nessuno smoke test → non presente in nessun task, esplicitamente escluso in Global Constraints ✓
- Nessun upload Play Console → non presente in nessun task ✓

**Placeholder scan:** nessun placeholder salvo `<GEOHUB_INSTANCE_ID>`, intenzionale (valore non presente nel repo, va fornito dal developer — coerente con il precedente in `8246`).

**Type consistency:** non applicabile (nessuna nuova funzione/interfaccia introdotta).
