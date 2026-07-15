> Ticket: oc:8246

# Piano — Validazione dimensioni splash/icon prima di cordova-res

> Nota: `superpowers:writing-plans` non è disponibile come skill in questa sessione (non presente nell'elenco skill invocabili), così come `wm-skills:our-code-style`. Il piano è stato scritto direttamente seguendo le convenzioni di `CLAUDE.md` (JSDoc obbligatorio, naming, `sh.exec`/`sharp` come nel resto del file) e la struttura di `updateResources()`/`update()` già esistente in `gulpfile.js`.

**Repo:** `webmapp-app` (root, nessun submodule coinvolto). **File:** `gulpfile.js`.

**Commit convention:** `fix(oc:8246): <descrizione>` per ogni commit (istruzioni testuali — nessun commit automatico durante l'esecuzione).

---

## Task 1 — Flag CLI `--skip-splash-validation`

Aggiungere una nuova opzione booleana nel blocco `yargs` (righe 126-176), accanto a `force`:

```js
skipSplashValidation: {
  demandOption: false,
  default: false,
  describe: 'Bypassa la validazione dimensioni dello splash screen (usare solo in emergenza)',
  type: 'boolean',
},
```

Non serve alias breve (coerente con `force`, che non ne ha).

## Task 2 — Helper di lettura/validazione immagine

Aggiungere, vicino a `downloadProfileImage()` (dopo riga 267), tre funzioni di supporto:

```js
/**
 * Legge le dimensioni di un'immagine con sharp, distinguendo un file corrotto/non-immagine
 * (es. pagina di errore HTML scaricata al posto del PNG atteso) da un file valido.
 */
function readImageMetadata(filePath, label) {
  const sharp = require('sharp');
  return sharp(filePath)
    .metadata()
    .catch(err => {
      throw new Error(
        `${label}: il file scaricato non è un'immagine valida (possibile errore backend/404) — ${filePath}: ${err.message}`,
      );
    });
}

/**
 * Valida le dimensioni minime di un'icona (icon.png / notification_icon.png).
 * Blocca sempre la build (throw) se il file è sotto soglia — stesso pattern di validatePosthogConfig().
 */
function validateIconDimensions(filePath, label, minSize) {
  return readImageMetadata(filePath, label).then(({width, height}) => {
    if (!width || !height || width < minSize || height < minSize) {
      error(`Validazione ${label} fallita: richiesto almeno ${minSize}x${minSize}px (trovato ${width}x${height})`);
      error(ABORTING_BANNER);
      throw new Error(`${label} sotto le dimensioni minime richieste`);
    }
    if (verbose) success(`${label} validato: ${width}x${height}px`);
  });
}

/**
 * Valida le dimensioni minime dello splash screen. Non blocca mai in automatico:
 * sotto soglia -> chiede conferma interattiva; aspect ratio non 1:1 (ma sopra soglia) -> solo warning.
 * Restituisce true se la build deve proseguire, false se deve abortire.
 */
function validateSplashDimensions(filePath, minSize) {
  if (argv.skipSplashValidation) {
    warn('Validazione splash saltata (--skip-splash-validation)');
    return Promise.resolve(true);
  }
  return readImageMetadata(filePath, 'splash.png').then(({width, height}) => {
    const belowThreshold = !width || !height || width < minSize || height < minSize;
    const aspectMismatch = !!width && !!height && width !== height;

    if (aspectMismatch && !belowThreshold) {
      warn(`splash.png non ha aspect ratio 1:1 (${width}x${height}) — proseguo, cordova-res non lo richiede`);
    }

    if (!belowThreshold) return true;

    warn(`splash.png sotto le dimensioni minime richieste: ${minSize}x${minSize}px (trovato ${width}x${height})`);
    return promptContinueWithoutSplash();
  });
}
```

## Task 3 — Prompt interattivo `promptContinueWithoutSplash()`

Aggiungere una funzione dedicata che usa il modulo nativo `readline` (nessuna nuova dipendenza):

```js
/**
 * Chiede conferma da terminale se continuare la build senza uno splash screen valido.
 * In assenza di un terminale interattivo (stdin non TTY, es. contesto headless) abortisce
 * automaticamente per sicurezza, senza attendere input.
 */
function promptContinueWithoutSplash() {
  if (!process.stdin.isTTY) {
    warn('Nessun terminale interattivo disponibile: interrompo la build (splash non valido)');
    return Promise.resolve(false);
  }

  const readline = require('readline');
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});

  return new Promise(resolve => {
    rl.question('Continuare la build senza uno splash screen valido? (y/N) ', answer => {
      rl.close();
      const proceed = /^y(es)?$/i.test(answer.trim());
      if (proceed) warn('Prosegue la build senza splash screen valido (scelta esplicita)');
      resolve(proceed);
    });
  });
}
```

## Task 4 — Integrare la validazione in `updateResources()`

Modificare `updateResources(instanceName, platform)` (righe 608-687) perché:
1. diventi asincrona (return `Promise`)
2. determini le soglie in base a `platform` prima di ogni chiamata `cordova-res`:
   - `android`: icon/notification_icon ≥1024×1024px, splash ≥1920×1920px
   - `ios`: icon ≥1024×1024px, splash ≥2732×2732px
3. per il blocco Android (righe 612-670): validare `resources/notification_icon.png` (hard block) prima del primo `cordova-res`
4. prima della chiamata `cordova-res` comune (riga 672-683): validare `resources/icon.png` (hard block) e `resources/splash.png` (soft/prompt) — quest'ultima decide se continuare
5. se la validazione splash restituisce `false` (utente ha risposto no, o non-TTY), la Promise deve rigettare per interrompere la build

Struttura indicativa (semplificata, mantenendo gli `sh.exec` esistenti invariati):

```js
function updateResources(instanceName, platform) {
  return new Promise((resolve, reject) => {
    if (platform !== 'ios' && platform !== 'android') {
      warn('No platform specified for resource regeneration, skipping');
      resolve();
      return;
    }

    info('Generating splash screen and icon for platform ' + platform);
    const dir = instancesDir + instanceName;
    const iconMinSize = 1024;
    const splashMinSize = platform === 'android' ? 1920 : 2732;

    let chain = Promise.resolve();

    if (platform === 'android') {
      chain = chain.then(() => validateIconDimensions(dir + '/resources/notification_icon.png', 'notification_icon.png', iconMinSize));
    }
    chain = chain.then(() => validateIconDimensions(dir + '/resources/icon.png', 'icon.png', iconMinSize));
    chain = chain.then(() => validateSplashDimensions(dir + '/resources/splash.png', splashMinSize));

    chain.then(proceed => {
      if (proceed === false) {
        reject(new Error('Build interrotta: splash screen non valido'));
        return;
      }

      if (platform === 'android') {
        sh.exec(/* ...cordova-res notification_icon... invariato, righe 613-624... */);
        // ...ciclo mv/cp mipmap invariato, righe 626-669...
      }

      sh.exec(/* ...cordova-res icon+splash... invariato, righe 672-683... */);

      info('Splash screen and icon generation completed');
      resolve();
    }, reject);
  });
}
```

**Nota implementativa:** mantenere identico il corpo degli `sh.exec` e del ciclo `for (let size of sizes)` esistenti (righe 613-669) — vanno solo spostati dentro il `.then()` del chain di validazione, non riscritti.

## Task 5 — Aggiornare i call site di `updateResources()`

`updateResources()` ora ritorna una Promise: i due punti che la invocano senza attenderla vanno aggiornati.

**`buildAndroid()` (righe 1080-1126), blocco righe 1094-1114:**

```js
updateAndroidPlatform(instanceName, result.id, result.name).then(
  () => {
    updateResources(instanceName, 'android').then(
      () => {
        updateGradleVersion(instanceName, '8.10.0')
          .then(() => updateGradleWrapperVersion(instanceName, '8.11.1'))
          .then(() => configureGradleJdk(instanceName))
          .then(() => resolve())
          .catch(err => {
            abort(err);
            reject(err); // era `done()`, non definito in questo scope — bug preesistente, vedi notes.md
          });
      },
      err => reject(err),
    );
  },
  err => reject(err),
);
```

**`buildIos()` (righe 1683-1713), riga 1697-1705:**

```js
updateIosPlatform(instanceName, result.id, result.name).then(
  () => {
    updateResources(instanceName, 'ios').then(
      () => resolve(result),
      err => reject(err),
    );
  },
  err => reject(err),
);
```

## Task 6 — Fix bug `done()` non definito in `buildAndroid()`

Già incluso nel diff del Task 5: sostituire `done()` (riga 1112, `ReferenceError` mascherato) con `reject(err)`, coerente con il resto della funzione che usa `resolve`/`reject` (non riceve `done` come parametro).

## Task 7 — Allineare il task `build-android` a `build-ios`

In `gulp.task('build-android', ...)` (righe 1927-1952), branch di errore (righe 1948-1950):

```js
buildAndroid(instanceName, geohubInstanceId, shardName).then(
  () => {
    done();
  },
  err => {
    abort(err);
    done();
  },
);
```

(oggi: `err => { done(); }`, nessun log — stesso pattern già presente in `build-ios`, riga 2138-2141)

## Task 8 — JSDoc

Aggiungere JSDoc a tutte le nuove funzioni (`readImageMetadata`, `validateIconDimensions`, `validateSplashDimensions`, `promptContinueWithoutSplash`) — obbligatorio da `CLAUDE.md` → Code Conventions. Le bozze nei task precedenti includono già il commento JSDoc da rifinire in fase di scrittura.

## Task 9 — Verifica manuale (nessun test automatico esistente per `gulpfile.js`)

Non esiste una suite di test per `gulpfile.js` (è un tool di build, fuori dal perimetro di Karma/Cypress). Verificare manualmente, per l'istanza `carg` (quella del ticket) o un'istanza di test:

1. `npx gulp build-android -i carg -g <id> -s <shard>` con uno `splash.png` reale sotto 1920×1920 sul backend (o un'istanza di test con immagine intenzionalmente piccola) → deve comparire il warning + prompt; rispondendo "n" la build deve interrompersi con errore visibile
2. Stessa build rispondendo "y" al prompt → la build deve proseguire e completarsi
3. Stessa build con `--skip-splash-validation` → nessun prompt, solo warning, build completata
4. Build con `icon.png` sotto 1024×1024 → la build deve interrompersi subito, senza prompt (hard block)
5. Build con stdin non-TTY (es. `npx gulp build-android -i carg ... < /dev/null`) e splash sotto soglia → deve abortire automaticamente senza attendere input
6. Build con splash valido in dimensioni ma non quadrato (es. 2000x2500) → solo warning, nessun prompt, build completata
7. Ripetere almeno il caso 1 anche per `build-ios` (soglia 2732×2732) per confermare che la validazione platform-specific funzioni su entrambe le piattaforme

## Task 10 — `notes.md`

Documentare in `notes.md` (Fase: notes, dopo l'approvazione del codice):
- Punto 2 del ticket (dependency `notification_icon.png`/`icon.png` per carg) come debito tecnico annotato, non implementato
- La correzione di soglia (1920×1920 Android / 2732×2732 iOS, non 2732 universale) e il percorso di verifica nel sorgente `cordova-res`
- Lo spostamento della validazione da `update()` a `updateResources()` rispetto a quanto inizialmente scritto in overview
- Il bug preesistente `done()` non definito, corretto nel Task 6
- L'assenza di test automatici per `gulpfile.js` e la verifica manuale eseguita (Task 9)
