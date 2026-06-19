> Ticket: oc:8105

# Piano — Gulp: validazione posthog.json prima della build

## Task 1 — Aggiungere `validatePosthogConfig()` in `gulpfile.js`

**File:** `gulpfile.js`

Aggiungere, dopo la funzione `abort()` esistente (riga ~244), la nuova funzione:

```js
function validatePosthogConfig() {
  const posthogPath = instancesDir + 'posthog.json';

  if (!fs.existsSync(posthogPath)) {
    error('PostHog validation failed: file not found at ' + posthogPath);
    error('Fix: create instances/posthog.json with POSTHOG_KEY and POSTHOG_HOST');
    error('------------------------- Aborting -------------------------');
    process.exit(1);
  }

  let posthogConfig;
  try {
    posthogConfig = JSON.parse(fs.readFileSync(posthogPath, 'utf8'));
  } catch (e) {
    error('PostHog validation failed: invalid JSON in ' + posthogPath);
    error('Parse error: ' + e.message);
    error('Fix: ensure instances/posthog.json contains valid JSON');
    error('------------------------- Aborting -------------------------');
    process.exit(1);
  }

  const requiredKeys = ['POSTHOG_KEY', 'POSTHOG_HOST'];
  for (const key of requiredKeys) {
    if (!posthogConfig[key] || !posthogConfig[key].trim()) {
      error('PostHog validation failed: ' + key + ' is missing or empty in ' + posthogPath);
      error('Fix: add a valid value for ' + key + ' in instances/posthog.json');
      error('------------------------- Aborting -------------------------');
      process.exit(1);
    }
  }

  if (verbose) success('PostHog config validated successfully');
}
```

**Note:**
- Usa `process.exit(1)` per interrompere immediatamente il processo gulp (non `reject()`, perché questa funzione è sincrona e viene chiamata prima della Promise chain)
- Usa le funzioni `error()` e `success()` già presenti nel gulpfile per coerenza visiva con il resto dei log

---

## Task 2 — Chiamare `validatePosthogConfig()` all'inizio di `build()`

**File:** `gulpfile.js`

Nella funzione `build()` (riga ~933), aggiungere la chiamata come primissima istruzione dopo i check su `instanceName` e `geohubInstanceId`:

```js
function build(instanceName, geohubInstanceId, shardName = 'geohub') {
  return new Promise((resolve, reject) => {
    if (!instanceName) { ... }
    if (!geohubInstanceId) { ... }

    // AGGIUNGERE QUI:
    validatePosthogConfig();

    if (verbose) debug('Starting `build(...)');
    // ... resto della funzione invariato
  });
}
```

La chiamata deve stare dopo i guard su `instanceName` / `geohubInstanceId` (così gli errori di argomenti mancanti vengono ancora gestiti per primi) ma prima di qualsiasi operazione su filesystem.

---

## Task 3 — Copiare `posthog.json` nell'istanza dopo `create()`

**File:** `gulpfile.js`

Nella funzione `build()`, dentro il `.then()` di `create()`, copiare `instances/posthog.json` in `instances/<instanceName>/posthog.json` prima di chiamare `update()`:

```js
create(instanceName, force).then(
  function () {
    if (verbose) debug('`build()` - create completed');

    // AGGIUNGERE QUI:
    fs.copyFileSync(instancesDir + 'posthog.json', instancesDir + instanceName + '/posthog.json');
    if (verbose) debug('posthog.json copied to instance');

    if (verbose) debug('`build()`- running `update()`');
    update(instanceName, geohubInstanceId, shardName).then( ... );
  },
  ...
);
```

**Perché dopo `create()` e non prima:** `create()` crea la cartella `instances/<instanceName>/`. Se la copia avviene prima, la destinazione non esiste.

---

## Task 4 — Commit

```
feat(oc:8105): validate posthog.json before gulp build
```

Staged files: `gulpfile.js`, `docs/features/8105-gulp-validazione-posthog-json/`
