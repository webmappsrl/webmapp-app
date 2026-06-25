> Ticket: oc:7294

# Plan — Modificare il gulp — Permessi Android

## Task 1 — Sostituisci `addPermissionsIfNotPresent()` con `manageAndroidPermissions(hasUgc)`

Rimuovi integralmente la funzione `addPermissionsIfNotPresent()` (righe ~2216-2240 del gulpfile attuale) e sostituiscila con:

```js
function manageAndroidPermissions(hasUgc) {
  const alwaysRemove = [
    'android.permission.READ_MEDIA_IMAGES',
  ];

  const ugcPermissions = [
    {
      name: 'android.permission.READ_EXTERNAL_STORAGE',
      tag: '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>',
    },
    {
      name: 'android.permission.WRITE_EXTERNAL_STORAGE',
      tag: '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>',
    },
  ];

  const removePermission = (content, permissionName) =>
    content.replace(
      new RegExp(`\\s*<uses-permission[^>]*android:name="${permissionName.replace(/\./g, '\\.')}"[^>]*/>`, 'g'),
      '',
    );

  return through.obj(function (file, encoding, callback) {
    let content = file.contents.toString();

    alwaysRemove.forEach(permission => {
      content = removePermission(content, permission);
    });

    ugcPermissions.forEach(p => {
      content = removePermission(content, p.name);
    });

    if (hasUgc) {
      const toAdd = ugcPermissions.map(p => p.tag).join('\n    ');
      content = content.replace(/<\/manifest>/, `    ${toAdd}\n</manifest>`);
    }

    file.contents = Buffer.from(content, encoding);
    this.push(file);
    callback();
  });
}
```

## Task 2 — Aggiorna `_updateAndroidFiles()` per leggere `MAP.record_track_show` e usare la nuova funzione

In `_updateAndroidFiles(instanceName, appId, appName, resolve, reject)`:

**2a — Leggi `MAP.record_track_show` da disco** (aggiungi all'inizio della funzione, prima dei `promises`):

```js
let hasUgc = false;
const instanceConfigPath = instancesDir + instanceName + '/config.json';
try {
  const instanceConfig = JSON.parse(fs.readFileSync(instanceConfigPath, 'utf8'));
  hasUgc = instanceConfig?.MAP?.record_track_show === true;
  if (verbose) debug('UGC enabled: ' + hasUgc);
} catch (err) {
  warn('Could not read ' + instanceConfigPath + ' to determine UGC status — defaulting to no UGC permissions');
}
```

**2b — Sostituisci la chiamata** `addPermissionsIfNotPresent()` con `manageAndroidPermissions(hasUgc)` nel gulp stream del manifest (nel blocco AndroidManifest.xml all'interno di `_updateAndroidFiles`).

## Task 3 — Verifica manuale

Testa con un'istanza UGC (`MAP.record_track_show: true`, es. `pnfc`) e una senza (es. `intelvi`):

```bash
# Build istanza UGC
gulp build-android -i pnfc -g 49 --verbose

# Controlla il manifest risultante
grep -i "READ_MEDIA_IMAGES\|READ_EXTERNAL_STORAGE\|WRITE_EXTERNAL_STORAGE" \
  instances/pnfc/android/app/src/main/AndroidManifest.xml
```

Risultato atteso per istanza UGC:
- `READ_MEDIA_IMAGES` → assente
- `READ_EXTERNAL_STORAGE` → presente senza attributi extra
- `WRITE_EXTERNAL_STORAGE` → presente

Risultato atteso per istanza non-UGC:
- Tutti e tre → assenti

## Task 4 — Commit

```bash
git add gulpfile.js docs/features/7294-modificare-gulp-permessi-android/
git commit -m "feat(oc:7294): manage android permissions based on UGC config"
```
