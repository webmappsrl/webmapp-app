> Ticket: oc:8892

# R8 nella build Android di release — piano di implementazione

> **Per chi esegue:** sotto-skill richiesta: `superpowers:executing-plans` (o
> `superpowers:subagent-driven-development`). I passi usano le checkbox (`- [ ]`).
> **Nessun commit automatico:** i passi «Commit» sono istruzioni per il dev, da eseguire solo dopo
> la sua approvazione esplicita.

**Obiettivo:** la release Android di ogni app passa da R8 in modalità compatibile, con
`--skip-r8` come uscita di emergenza, e i task di release falliscono in modo esplicito quando
Gradle o R8 non hanno davvero prodotto l'output.

**Architettura:** le trasformazioni di testo su `build.gradle` e `gradle.properties` diventano
funzioni pure in un modulo nuovo, `scripts/android-r8.js` nella root, testate con `node:test`. Il
gulpfile le chiama da `_updateAndroidFiles()`, copia un `proguard-rules.pro` versionato, e nei task
di release pulisce l'output, controlla il codice di uscita di `./gradlew` e la presenza di
`mapping.txt`.

**Stack:** Node (gulp 4, gulp-replace, shelljs, yargs 16), `node:test` + `node:assert/strict`
(già in Node ≥ 18, nessuna dipendenza nuova), Android Gradle Plugin 8.10.0.

**Spec:** [overview.md](overview.md)

## Vincoli globali

- Repo: solo `webmapp-app`, nessun submodule.
- `minifyEnabled true` + `getDefaultProguardFile('proguard-android-optimize.txt')` nella release;
  con `--skip-r8`: `minifyEnabled false` + `getDefaultProguardFile('proguard-android.txt')`.
- `gradle.properties`: esattamente una riga `android.enableR8.fullMode=false`, scritta da
  `_updateAndroidFiles()`, non da `configureGradleJdk()`.
- `shrinkResources` non si attiva.
- Il blocco `debug` del `build.gradle` non si tocca.
- Opzione yargs `skipR8` (`--skip-r8`): `type: 'boolean'`, `default: false`, `demandOption: false`,
  sul modello di `skipResourceValidation`.
- Regole ProGuard versionate in `resources/android/proguard-rules.pro`, copiate in
  `instances/<app>/android/app/proguard-rules.pro`.
- Commenti e messaggi in italiano, JSDoc su ogni funzione nuova.

## Da tenere d'occhio in review

1. **Un `build.gradle` senza il testo atteso** (template Capacitor cambiato, Kotlin DSL): deve
   fallire con un errore esplicito, non proseguire senza R8. Test in Task 1.
2. **Un `mapping.txt` rimasto da una build precedente**: non deve far passare il controllo su una
   build in cui R8 non ha girato. Il Task 3 cancella anche `outputs/mapping/release` prima di Gradle.
3. **`gradle.properties` con `fullMode=true` già presente, o senza a-capo finale**: deve uscirne una
   sola riga `=false` e nessuna riga incollata alla precedente. Test in Task 1.
4. **`--skip-r8` su una cartella già portata a R8**: deve tornare indietro, e la build non deve
   pretendere `mapping.txt`. Test in Task 1, verifica in Task 2 e Task 3.
5. **Build di debug** (`build-android-apk-debug`): niente pulizia dell'output di release e niente
   controllo su `mapping.txt`. Verifica in Task 3.

---

### Task 1: funzioni pure per `build.gradle` e `gradle.properties`

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-1-comando-dei-test)

**File:**
- Crea: `scripts/android-r8.js`
- Crea: `scripts/android-r8.test.js`
- Modifica: `package.json` (root) — script `"test:gulp": "node --test scripts/"`

**Interfacce:**
- Produce:
  - `applyR8ToBuildGradle(content: string, enabled: boolean): string`
  - `ensureR8CompatMode(content: string): string`
  - esportate con `module.exports = {applyR8ToBuildGradle, ensureR8CompatMode}` (CommonJS, come il
    gulpfile)

- [ ] **Passo 1: scrivere i test che falliscono** in `scripts/android-r8.test.js`, con
  `const test = require('node:test')` e `const assert = require('node:assert/strict')`. Il
  fixture è il blocco reale del template:

  ```js
  const TEMPLATE = `android {
      buildTypes {
          release {
              minifyEnabled false
              proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
          }
      }
  }`;
  ```

  Test:
  - `attiva R8 nella release`: `applyR8ToBuildGradle(TEMPLATE, true)` contiene
    `minifyEnabled true` e `getDefaultProguardFile('proguard-android-optimize.txt')`, e non contiene
    `'proguard-android.txt'`
  - `è idempotente`: applicata due volte con `true` dà lo stesso risultato di una volta
  - `--skip-r8 torna indietro`: `applyR8ToBuildGradle(applyR8ToBuildGradle(TEMPLATE, true), false)`
    è uguale a `TEMPLATE`
  - `non tocca il blocco debug`: con un fixture che ha anche
    `debug { minifyEnabled false }` dopo `release`, il blocco `debug` resta identico
  - `fallisce senza il blocco release`: `assert.throws(() => applyR8ToBuildGradle('android {}', true), /minifyEnabled/)`
  - `fallisce senza proguardFiles di default`: con un release che ha `minifyEnabled false` ma niente
    `getDefaultProguardFile(...)`, `assert.throws(..., /proguard-android/)`
  - `fullMode: aggiunge la riga`: `ensureR8CompatMode('android.useAndroidX=true\n')` è
    `'android.useAndroidX=true\nandroid.enableR8.fullMode=false\n'`
  - `fullMode: senza a-capo finale`: `ensureR8CompatMode('android.useAndroidX=true')` dà lo stesso
    risultato del test precedente
  - `fullMode: sostituisce un valore true`: da
    `'android.enableR8.fullMode=true\nandroid.useAndroidX=true\n'` esce un testo con una sola
    occorrenza di `android.enableR8.fullMode` e valore `false`
  - `fullMode: idempotente`: applicata due volte = applicata una volta

- [ ] **Passo 2: eseguire i test e verificare che falliscano**

  Comando: `node --test scripts/` (dalla root)
  Atteso: FAIL con `Cannot find module './android-r8'`

- [ ] **Passo 3: implementare le due funzioni in `scripts/android-r8.js`**

  - `applyR8ToBuildGradle`: lavora **solo dentro il blocco `release { … }`** (regex che cattura
    `release\s*\{[^}]*\}`); dentro sostituisce `minifyEnabled (true|false)` e
    `getDefaultProguardFile\('proguard-android(-optimize)?\.txt'\)`. Se il blocco o uno dei due
    testi non c'è, lancia `Error` con un messaggio in italiano che nomina il testo mancante
    (`minifyEnabled` o `proguard-android`).
  - `ensureR8CompatMode`: toglie ogni riga `android.enableR8.fullMode=…`, normalizza la fine del
    testo con un solo `\n`, aggiunge `android.enableR8.fullMode=false\n`.

- [ ] **Passo 4: eseguire i test e verificare che passino**

  Comando: `node --test scripts/`
  Atteso: tutti i test PASS

- [ ] **Passo 5: commit (solo dopo l'ok del dev)**

  ```bash
  git add scripts/android-r8.js scripts/android-r8.test.js package.json
  git commit -m "fix(oc:8892): funzioni per attivare R8 nel build.gradle e in gradle.properties"
  ```

---

### Task 2: R8 applicato dal gulpfile, regole ProGuard e opzione `--skip-r8`

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-2-r8-fuori-dalla-pipeline-gulp)

**File:**
- Crea: `resources/android/proguard-rules.pro`
- Modifica: `gulpfile.js` — `require` in testa (righe 2-14), opzioni yargs (~168-183),
  `_updateAndroidFiles()` (~1112-1150)

**Interfacce:**
- Consuma: `applyR8ToBuildGradle`, `ensureR8CompatMode` dal Task 1
  (`require('./scripts/android-r8')`)
- Produce: `argv.skipR8` (boolean), usato anche nel Task 3

- [ ] **Passo 1: creare `resources/android/proguard-rules.pro`** con un commento in italiano che
  spiega che il file è copiato dal gulpfile a ogni build (non modificarlo dentro `instances/`) e
  che le regole `-keep` vanno aggiunte solo per una libreria rotta in release, e la riga:

  ```
  -keepattributes SourceFile,LineNumberTable,Signature,*Annotation*
  ```

- [ ] **Passo 2: aggiungere l'opzione yargs `skipR8`** accanto a `skipResourceValidation`, con
  `describe: 'Compila la release Android senza R8 (minify/offuscamento). Solo in emergenza'`.

- [ ] **Passo 3: applicare R8 al `build.gradle`** nella promise esistente di `_updateAndroidFiles()`:
  dopo i due `replace` di `versionCode`/`versionName`, il contenuto passa da
  `applyR8ToBuildGradle(content, !argv.skipR8)`. Un errore lanciato deve arrivare al `reject` della
  promise (non perdersi nello stream). Con `argv.skipR8` stampa
  `warn('R8 disattivato per questa build (--skip-r8)')`.

- [ ] **Passo 4: scrivere `fullMode=false`** con una nuova promise in `_updateAndroidFiles()`, sullo
  stesso schema della promise del `build.gradle` (`fs.existsSync`, altrimenti `resolve()` con
  `debug`): legge `instances/<app>/android/gradle.properties`, scrive `ensureR8CompatMode(content)`.

- [ ] **Passo 5: copiare il `proguard-rules.pro`** con una nuova promise in `_updateAndroidFiles()`:
  `fs.copyFileSync('resources/android/proguard-rules.pro', instancesDir + instanceName + '/android/app/proguard-rules.pro')`,
  errori in `reject`.

- [ ] **Passo 6: verifica in tre giri** (`gulp build-android` prepara senza compilare). Dalla root,
  con l'id Geohub di camminiditalia:

  1. `npx gulp build-android --instance=camminiditalia --geohubInstanceId=<id>`
     → `grep -n "minifyEnabled\|getDefaultProguardFile" instances/camminiditalia/android/app/build.gradle`
     mostra `minifyEnabled true` e `proguard-android-optimize.txt` nel blocco release;
     `grep -c "android.enableR8.fullMode=false" instances/camminiditalia/android/gradle.properties`
     stampa `1`; `diff resources/android/proguard-rules.pro instances/camminiditalia/android/app/proguard-rules.pro`
     non stampa nulla
  2. stesso comando con `--skip-r8` → avviso in console, `minifyEnabled false` e
     `proguard-android.txt`
  3. di nuovo senza opzione → come al giro 1, e `grep -c` di `fullMode` stampa ancora `1`

- [ ] **Passo 7: commit (solo dopo l'ok del dev)**

  ```bash
  git add resources/android/proguard-rules.pro gulpfile.js
  git commit -m "fix(oc:8892): attiva R8 nella release Android, con opzione --skip-r8"
  ```

---

### Task 3: i task di release falliscono se Gradle o R8 non hanno prodotto l'output

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-3-tolto)

**File:**
- Modifica: `gulpfile.js` — `buildAndroidApk()` (~1485-1522), `buildAndroidBundle()` (~1622-1657)

**Interfacce:**
- Consuma: `argv.skipR8` dal Task 2

- [ ] **Passo 1: pulizia prima di Gradle**, solo con `type === 'Release'`: cancellare
  `instances/<app>/android/app/build/outputs/<bundle|apk>/release` e
  `instances/<app>/android/app/build/outputs/mapping/release` (`sh.rm('-rf', …)`).

- [ ] **Passo 2: codice di uscita di Gradle**: tenere il risultato di `sh.exec(gradlecom + type + outputRedirect, …)`;
  se `result.code !== 0`, `error(...)` e `reject('Build Gradle fallita (exit code ' + result.code + '). Rilancia con --verbose per vedere l\'output')`,
  senza stampare il messaggio di successo. Vale anche per `Debug`.

- [ ] **Passo 3: controllo di `mapping.txt`**, solo con `type === 'Release'` e `!argv.skipR8`: se
  `instances/<app>/android/app/build/outputs/mapping/release/mapping.txt` non esiste,
  `reject('R8 non ha prodotto mapping.txt: la release non è stata offuscata')`.

- [ ] **Passo 4: verifica della build vera**

  Comando: `npx gulp build-android-bundle --instance=camminiditalia --geohubInstanceId=<id>`
  Atteso: termina senza errori; esistono
  `instances/camminiditalia/android/app/build/outputs/mapping/release/mapping.txt` e
  `builds/camminiditalia/android/camminiditalia_<versione>.aab` con data di adesso.

  Se R8 fallisce per classi mancanti: rilanciare con `--verbose`, leggere le classi segnalate,
  aggiungere in `resources/android/proguard-rules.pro` il `-dontwarn`/`-keep` mirato sul pacchetto,
  annotare la regola e il motivo in `notes.md`.

- [ ] **Passo 5: verifica del ramo di errore**: rilanciare con `--skip-r8` → la build termina senza
  pretendere `mapping.txt`. Poi `npx gulp build-android-apk-debug --instance=camminiditalia --geohubInstanceId=<id>`
  → termina senza errori (nessun controllo su `mapping.txt` in debug).

- [ ] **Passo 6: commit (solo dopo l'ok del dev)**

  ```bash
  git add gulpfile.js
  git commit -m "fix(oc:8892): i task di release Android falliscono se Gradle o R8 non producono l'output"
  ```

---

### Task 4: test su device della release di camminiditalia (dev, prima della pubblicazione)

Manuale, a cura del dev. Installare la build di **release** (non debug) e verificare:

- [ ] login, mappa, download offline, condivisione, notifiche, deep link
- [ ] registrazione di almeno 15-20 minuti con schermo spento e app in background: traccia salvata
      completa alla fine
- [ ] gli eventi PostHog della sessione arrivano nella dashboard di PostHog
- [ ] il controllo aggiornamenti non dà errori

Se qualcosa si rompe: regola `-keep` mirata in `resources/android/proguard-rules.pro`, nuova build
(Task 3, passo 4), nuovo test; annotare in `notes.md`.

---

### Task 5: documentazione

Si fa nella fase `update-context` di `wm-plan`, dopo la review:

- `docs/knowledge/gulp-e-build-native.md`: perché R8 in modalità compatibile e senza
  `shrinkResources`, `--skip-r8` e il ritorno indietro con una patch release, come rifare la build
  per ritrovare il `mapping.txt` (tag della release, submodule allineati, `npm ci`, stesso JDK).
- `.claude/rules/gulp-e-risorse.md`: le regole ProGuard si modificano in
  `resources/android/proguard-rules.pro`, mai dentro `instances/`; un problema che compare solo in
  release va cercato prima in R8.
