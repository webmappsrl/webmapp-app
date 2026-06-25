> Ticket: oc:7480

# Plan — [wm-package][app] inserire foto

## ✅ Task 1 — Rimuovi file legacy (completato)

Elimina dal repo i due file non più referenziati:

```bash
git rm core/src/assets/images/profile/cammini-my-path.webp
git rm core/src/assets/images/profile/cammini-downloads.webp
```

## ✅ Task 2 — Aggiungi `downloadProfileImage()` (completato) in `gulpfile.js`

Aggiungi una nuova funzione helper subito dopo `getUrlFile()` (riga ~239):

```js
function downloadProfileImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (verbose) debug('Downloading profile image from ' + url + ' to ' + destPath);
    const chunks = [];
    request({ url, headers: { 'User-Agent': 'request' } })
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => {
        const buffer = Buffer.concat(chunks);
        const sharp = require('sharp');
        sharp(buffer)
          .webp()
          .toFile(destPath)
          .then(() => {
            if (verbose) success('Profile image saved to ' + destPath);
            resolve();
          })
          .catch(err => {
            warn('Failed to convert profile image to WebP: ' + err.message + ' — keeping default');
            resolve();
          });
      })
      .on('error', err => {
        warn('Failed to download profile image from ' + url + ': ' + err.message + ' — keeping default');
        resolve();
      });
  });
}
```

**Note:**
- `require('sharp')` lazy (dentro la funzione) — non rompe se sharp non è disponibile in un futuro aggiornamento: fallisce solo quando la chiave è presente nel config
- Warn + resolve su download error e su conversione error — il build non si blocca mai
- `request` è già usato nel gulpfile, nessuna nuova dipendenza

## ✅ Task 3 — Aggiorna `update()` (completato) per usare `downloadProfileImage()`

Nella funzione `update()`, all'interno del blocco `streamify(jeditor(...))`, dopo la definizione dell'array `promises` e prima di `Promise.all(promises)`, aggiungi i due download condizionali:

```js
if (configJson.APP.myPaths) {
  promises.push(
    downloadProfileImage(
      configJson.APP.myPaths,
      dir + '/src/assets/images/profile/my-path.webp',
    ),
  );
}

if (configJson.APP.myDownloads) {
  promises.push(
    downloadProfileImage(
      configJson.APP.myDownloads,
      dir + '/src/assets/images/profile/downloads.webp',
    ),
  );
}
```

Posizione esatta: subito prima di `Promise.all(promises).then(...)` nella funzione `update()` (riga ~471).

## ✅ Task 4 — Verifica manuale (completato)

## Task 5 — Web: aggiorna `ugc-box` in wm-core

**Branch già creato nel submodule wm-core.**

In `projects/wm-core/src/box/ugc-box/ugc-box.component.ts`:

```typescript
import {confAPP} from '@wm-core/store/conf/conf.selector';

// Sostituisci defaultPhotoPath con:
myPathsImage$: Observable<string> = this._store.select(confAPP).pipe(
  map(app => app?.myPaths ?? 'assets/images/profile/my-path.webp'),
);
```

In `projects/wm-core/src/box/ugc-box/ugc-box.component.html`:

```html
<!-- Sostituisci [src]="defaultPhotoPath" con: -->
[src]="myPathsImage$ | async"
```

Importare `map` da `rxjs/operators` se non già presente.

## Task 6 — Commit in wm-core

```bash
git commit -m "feat(oc:7480): use APP.myPaths from config in ugc-box for web"
```

## Task 7 — Aggiorna il puntatore del submodule in webmapp-app

Dopo il commit in wm-core:

```bash
# In webmapp-app root
git add core/src/app/shared/wm-core
git commit -m "chore(oc:7480): update wm-core submodule pointer"
```

Testa il build di un'istanza che ha le chiavi nel config (es. camminiditalia se disponibile) e una che non le ha:

```bash
# Con chiavi presenti — deve scaricare e convertire
gulp build -i camminiditalia -g <ID> --verbose

# Senza chiavi — deve proseguire senza errori
gulp build -i <altra_istanza> -g <ID> --verbose
```

Verifica:
- `[SUCCESS] Profile image saved to ...my-path.webp` nel log (caso con chiave)
- `[WARN] Failed to download...` gestito senza abort (caso di URL errato)
- I file `.webp` salvati sono effettivamente WebP: `file instances/<name>/src/assets/images/profile/my-path.webp`

## ✅ Task 5 (ex) — Commit mobile (completato)

```bash
git add gulpfile.js
git rm core/src/assets/images/profile/cammini-my-path.webp
git rm core/src/assets/images/profile/cammini-downloads.webp
git commit -m "feat(oc:7480): download and convert my_paths/my_downloads profile images in gulp"
```

## Task 8 — PR verso develop

```bash
gh pr create --base develop --title "feat(oc:7480): profile images my_paths/my_downloads in gulp" \
  --body "..."
```
