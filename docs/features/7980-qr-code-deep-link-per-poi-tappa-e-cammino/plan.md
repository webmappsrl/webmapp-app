> Ticket: oc:7980

# Piano implementativo — QR code deep link per poi, tappa e cammino (repo principale)

## Repo coinvolti

| Repo | Percorso locale |
|------|----------------|
| `webmapp-app` (principale) | `.` |
| `wm-core` (submodule) | `core/src/app/shared/wm-core/` — vedi `plan.md` dedicato in quel repo |

Nessuna modifica richiesta in `wm-webapp` (repo separato): i file `.well-known` vengono deployati sul suo dominio pubblico ma da questa pipeline (stesso server, credenziali SSH già condivise).

---

## Task 1 — Listener `appUrlOpen` in `app.component.ts`

**File:** `core/src/app/app.component.ts`

### 1a — Import

Aggiungere dopo l'import di `SplashScreen` (riga 6):

```typescript
import {App, URLOpenListenerEvent} from '@capacitor/app';
```

Aggiungere l'import di `UrlHandlerService` insieme agli altri import da `@wm-core` (dopo riga 19):

```typescript
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
```

### 1b — Iniezione nel costruttore

Aggiungere `_urlHandlerSvc` alla lista dei parametri del costruttore (dopo `_storeNetwork`, riga 58):

```typescript
    private _storeNetwork: Store<INetworkRootState>,
    private _urlHandlerSvc: UrlHandlerService,
    @Inject(DOCUMENT) private _document: Document,
```

### 1c — Registrazione del listener

Aggiungere nel costruttore, subito dopo il blocco che verifica la versione app (dopo riga 89, prima di `this._platform.ready()`):

```typescript
    // Deep link nativo (Universal Links iOS / App Links Android) — oc:7980
    App.addListener('appUrlOpen', (data: URLOpenListenerEvent) => {
      this._handleDeepLinkUrl(data.url);
    });
```

### 1d — Metodo privato con guard di cold-start

Aggiungere come metodo privato della classe (vicino a `_setGlobalCSS`):

```typescript
  /**
   * Inoltra l'URL di un deep link nativo a UrlHandlerService, aspettando che la
   * configurazione sia caricata (copre sia cold start che warm start: se isConfLoaded$
   * è già true, il subscribe emette immediatamente).
   */
  private _handleDeepLinkUrl(url: string): void {
    this.isConfLoaded$
      .pipe(
        filter(loaded => loaded === true),
        take(1),
      )
      .subscribe(() => {
        this._urlHandlerSvc.handleDeepLink(url);
      });
  }
```

**Nota di design (sostituisce l'ipotesi iniziale in overview.md):** non serve attendere una prima `NavigationEnd` — `isConfLoaded$` da solo copre sia cold start (aspetta) sia warm start (emette subito, essendo un selettore NgRx con valore corrente sempre disponibile). `UrlHandlerService.handleDeepLink()` chiama `this._router.navigate()` internamente, e il `Router` è disponibile fin dal bootstrap di Angular — non serve aspettare che una navigazione sia già avvenuta. Aggiornare il requisito in `overview.md` di conseguenza (rimuovere il riferimento a `NavigationEnd`).

**Commit:** `feat(oc:7980): add appUrlOpen listener to AppComponent`

---

## Task 2 — Helper `resolveInstanceDomain()` in `gulpfile.js`

**File:** `gulpfile.js`

Aggiungere dopo `getJsonEnvironment()` (dopo riga 2324):

```javascript
/**
 * Calcola il dominio pubblico di condivisione di un'istanza, con la stessa
 * logica di EnvironmentService._assignShareLink() (wm-core), alimentata dagli
 * stessi dati (shards/redirects letti da wm-types tramite getJsonEnvironment()).
 * Necessario per generare .well-known e per l'intent-filter/entitlements nativi.
 */
function resolveInstanceDomain(instanceName) {
  const envPath = instancesDir + instanceName + '/src/environments/environment.ts';
  if (!fs.existsSync(envPath)) {
    throw new Error(`File ${envPath} non trovato. Eseguire update() prima di questa funzione.`);
  }
  const envContent = fs.readFileSync(envPath, 'utf8');

  const appIdMatch = envContent.match(/appId:\s*(\d+)/);
  const shardNameMatch = envContent.match(/shardName:\s*'([^']+)'/);
  if (!appIdMatch || !shardNameMatch) {
    throw new Error(`Impossibile determinare appId/shardName da ${envPath}`);
  }
  const appId = parseInt(appIdMatch[1], 10);
  const shardName = shardNameMatch[1];

  const {redirects} = getJsonEnvironment();
  const redirectEntry = Object.entries(redirects).find(
    ([, val]) => val.appId === appId && val.shardName === shardName,
  );
  if (redirectEntry) {
    return redirectEntry[0];
  }

  const subdomain = shardName === 'geohub' ? 'app' : shardName;
  return `${appId}.${subdomain}.webmapp.it`;
}
```

**Nota:** questa funzione va chiamata **dopo** `update(instanceName, ...)`, perché legge il file `environment.ts` che `update()` scrive con `appId`/`shardName` reali (righe 536-549 del gulpfile, esistenti). Chiamarla prima restituirebbe i valori di default del repo principale, non quelli dell'istanza.

**Commit:** `feat(oc:7980): add resolveInstanceDomain helper to gulpfile`

---

## Task 3 — Injection intent-filter Android in `AndroidManifest.xml`

**File:** `gulpfile.js`

> **Nota (deviazione dal piano iniziale):** il `<data>` tag non ha più `android:pathPrefix="/map"` — su richiesta esplicita, l'intent-filter matcha ora l'intero host, non solo `/map`. Vedi `notes.md` e "Rischi" in `overview.md`.

### 3a — Nuova funzione di injection

Aggiungere vicino a `manageAndroidPermissions()` (dopo riga 2267):

```javascript
function manageDeepLinkIntentFilter(domain) {
  const removeMarker = (content) =>
    content.replace(
      /\s*<!-- BEGIN deep-link-intent-filter -->[\s\S]*?<!-- END deep-link-intent-filter -->/g,
      '',
    );

  return through.obj(function (file, encoding, callback) {
    let content = file.contents.toString();
    content = removeMarker(content);

    const intentFilter = `
        <!-- BEGIN deep-link-intent-filter -->
        <intent-filter android:autoVerify="true">
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="https" android:host="${domain}" />
        </intent-filter>
        <!-- END deep-link-intent-filter -->`;

    content = content.replace(/(<\/activity>)/, `${intentFilter}\n        $1`);

    file.contents = Buffer.from(content, encoding);
    this.push(file);
    callback();
  });
}
```

**Nota importante da verificare in fase di test (rischio già noto, vedi overview):** il replace su `(<\/activity>)` con flag globale sostituirebbe **ogni** `</activity>` nel manifest se ce ne fosse più di una — il manifest generato da Capacitor ha tipicamente una sola `<activity>` (la `MainActivity`), ma va verificato sui manifest reali di `camminiditalia`, `carg` e `osm2cai` prima del merge. Se ci fossero più `<activity>`, sostituire il regex globale con uno mirato alla sola `MainActivity` (es. matchare il blocco che contiene `android:name="${appId}.MainActivity"` fino alla sua `</activity>` di chiusura).

Il marker HTML-comment (`BEGIN/END deep-link-intent-filter`) rende l'injection idempotente (remove-then-add), stesso pattern già usato per i permessi Android.

### 3b — Uso nella pipeline esistente

Modificare il blocco "AndroidManifest.xml" in `_updateAndroidFiles` (righe 831-859): serve il dominio, quindi la funzione deve ricevere `instanceName` (già disponibile come parametro di `_updateAndroidFiles`).

```javascript
    // AndroidManifest.xml
    promises.push(
      new Promise((resolve, reject) => {
        const manifestPath = instancesDir + instanceName + '/android/app/src/main/AndroidManifest.xml';
        if (!fs.existsSync(manifestPath)) {
          if (verbose) debug('AndroidManifest.xml not found, skipping update');
          resolve();
          return;
        }
        const domain = resolveInstanceDomain(instanceName);
        gulp
          .src(manifestPath)
          .pipe(
            replace(/<manifest ([^>]*) package="([^"]*)"/g, '<manifest $1 package="' + appId + '"'),
          )
          .pipe(
            replace(
              /android:name="[^"]*.MainActivity"/g,
              'android:name="' + appId + '.MainActivity"',
            ),
          )
          .pipe(manageAndroidPermissions(hasUgc))
          .pipe(manageDeepLinkIntentFilter(domain))
          .pipe(gulp.dest(instancesDir + instanceName + '/android/app/src/main/'))
          .on('end', () => {
            if (verbose) debug('AndroidManifest.xml updated successfully');
            resolve();
          })
          .on('error', reject);
      }),
    );
```

**Commit:** `feat(oc:7980): inject deep link intent-filter into AndroidManifest.xml`

---

## Task 4 — Entitlements + `project.pbxproj` iOS

**File:** `gulpfile.js`

### 4a — Generazione file `.entitlements`

Aggiungere una nuova promise nel blocco iOS di `updateIosPlatform` (dopo la promise "Info.plist", prima di `Promise.all(promises)`, quindi dopo riga 1669):

```javascript
    // App.entitlements — Associated Domains per Universal Links (oc:7980)
    promises.push(
      new Promise((resolve, reject) => {
        const domain = resolveInstanceDomain(instanceName);
        const entitlementsPath = instancesDir + instanceName + '/ios/App/App/App.entitlements';
        const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.associated-domains</key>
	<array>
		<string>applinks:${domain}</string>
	</array>
</dict>
</plist>
`;
        try {
          fs.writeFileSync(entitlementsPath, entitlementsContent, 'utf8');
          if (verbose) debug('App.entitlements creato/aggiornato con dominio: ' + domain);
          resolve();
        } catch (err) {
          reject(err);
        }
      }),
    );

    // Collega App.entitlements al target Xcode tramite CODE_SIGN_ENTITLEMENTS
    promises.push(
      new Promise((resolve, reject) => {
        const pbxprojPath =
          instancesDir + instanceName + '/ios/App/App.xcodeproj/project.pbxproj';
        if (!fs.existsSync(pbxprojPath)) {
          reject(`project.pbxproj non trovato in ${pbxprojPath}`);
          return;
        }
        let content = fs.readFileSync(pbxprojPath, 'utf8');

        // remove-then-add per idempotenza su build ripetute
        content = content.replace(/\s*CODE_SIGN_ENTITLEMENTS = [^;]+;/g, '');
        content = content.replace(
          /(PRODUCT_BUNDLE_IDENTIFIER = [^;]+;)/g,
          '$1\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = App/App.entitlements;',
        );

        try {
          fs.writeFileSync(pbxprojPath, content, 'utf8');
          if (verbose) debug('CODE_SIGN_ENTITLEMENTS collegato in project.pbxproj');
          resolve();
        } catch (err) {
          reject(err);
        }
      }),
    );
```

**Rischio da validare in fase di test (già noto, vedi overview):** questa è l'unica parte del piano che manipola una struttura annidata mai toccata prima da Gulp (`project.pbxproj`, formato OpenStep plist con più blocchi `buildSettings` per Debug/Release, entrambi con `PRODUCT_BUNDLE_IDENTIFIER`). Il replace globale interviene su **tutti** i blocchi che contengono quella chiave (comportamento voluto: sia Debug che Release devono avere l'entitlement collegato) — va verificato aprendo il progetto generato in Xcode (o `xcodebuild -showBuildSettings`) su `camminiditalia` dopo il primo build di test, per confermare che `CODE_SIGN_ENTITLEMENTS` risulti effettivamente impostato in entrambe le configurazioni e che il pbxproj resti un plist valido (nessuna corruzione di sintassi).

**Commit:** `feat(oc:7980): generate App.entitlements and link CODE_SIGN_ENTITLEMENTS in pbxproj`

---

## Task 5 — Registro multi-istanza + task Gulp `generateWellKnown`

I due file `.well-known/apple-app-site-association` e `.well-known/assetlinks.json` sono **fisicamente unici**: tutte le istanze condividono lo stesso dominio wildcard `*.webmapp.it`, servito dallo stesso deploy `wm-webapp` (`app.geohub.webmapp.it`). Non è possibile avere "il file di camminiditalia" e "il file di carg" — è lo stesso file per qualunque sottodominio, quindi deve elencare **tutte** le app associate. Per questo la generazione non è legata a una singola build istanza (a differenza di Task 3/4, che sono già generici per costruzione), ma a un registro condiviso.

### 5a — Nuovo file `deep-links.json`

**File:** `deep-links.json` (nuovo, root del repo, sibling di `gulpfile.js`)

```json
{
  "camminiditalia": {
    "bundleId": "it.webmapp.cammini",
    "androidSha256Fingerprints": [
      "REPLACE_WITH_REAL_SHA256_FINGERPRINT"
    ]
  }
}
```

**Il valore `REPLACE_WITH_REAL_SHA256_FINGERPRINT` è un placeholder deliberato, non un dato reale** — va sostituito a mano prima di eseguire `generateWellKnown` per la prima volta. Per ottenerlo:
- Se l'app **non** usa Play App Signing: `keytool -list -v -keystore builds/keys/camminiditalia.keystore -alias camminiditalia -storepass "$PASS" | grep 'SHA256:'`
- Se l'app usa Play App Signing (default per le app pubblicate dopo il 2021, verificare in Play Console → "Integrità dell'app" → "Certificato di firma dell'app"): il fingerprint va copiato da lì, **non** dal keystore locale (quella è solo la chiave di upload, diversa dalla chiave che firma l'APK distribuito agli utenti)

Contenuto pubblico (bundle id e fingerprint finiscono comunque nel file `.well-known` pubblico) — nessun problema a committarlo in chiaro.

**Commit:** `feat(oc:7980): add deep-links registry for well-known generation`

### 5b — Task Gulp `generateWellKnown`

**File:** `gulpfile.js`

Aggiungere vicino alla dichiarazione del `TEAM_ID` già hardcoded altrove nel file (riga ~1787, `DEVELOPMENT_TEAM="BSTW6XXE23"`) — estrarre in una costante di modulo se non già presente, poi:

```javascript
const DEEP_LINK_TEAM_ID = 'BSTW6XXE23';

function generateWellKnown() {
  const registry = JSON.parse(fs.readFileSync('deep-links.json', 'utf8'));

  const placeholderEntries = Object.entries(registry).filter(([, entry]) =>
    entry.androidSha256Fingerprints.some(fp => fp.includes('REPLACE_WITH')),
  );
  if (placeholderEntries.length > 0) {
    abort(
      'deep-links.json contiene fingerprint placeholder per: ' +
        placeholderEntries.map(([name]) => name).join(', ') +
        ' — sostituirli con valori reali prima di generare i file.',
    );
    return;
  }

  const appleAppSiteAssociation = {
    applinks: {
      apps: [],
      details: Object.values(registry).map(entry => ({
        appID: `${DEEP_LINK_TEAM_ID}.${entry.bundleId}`,
        // "*" = tutti i path del dominio (sintassi Apple dedicata, non un wildcard "/*")
        // Nota (deviazione dal piano iniziale): prima era ['/map', '/map?*'], ampliato
        // su richiesta esplicita — vedi notes.md e "Rischi" in overview.md
        paths: ['*'],
      })),
    },
  };

  const assetlinks = Object.values(registry).map(entry => ({
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: entry.bundleId,
      sha256_cert_fingerprints: entry.androidSha256Fingerprints,
    },
  }));

  const outDir = 'builds/well-known/';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(
    outDir + 'apple-app-site-association',
    JSON.stringify(appleAppSiteAssociation, null, 2),
  );
  fs.writeFileSync(outDir + 'assetlinks.json', JSON.stringify(assetlinks, null, 2));

  info('File generati in ' + outDir + ' — upload manuale su server:/var/www/html/app.geohub.webmapp.it/.well-known/');
}

gulp.task('generateWellKnown', generateWellKnown);
```

**Nota:** il guard sui placeholder evita di generare (e potenzialmente uploadare) un file con un fingerprint finto che romperebbe silenziosamente la verifica — coerente con il rischio "fallimento invisibile" già documentato in overview.md.

**Commit:** `feat(oc:7980): add generateWellKnown gulp task`

### 5c — Upload manuale (istruzioni, non codice)

Da eseguire una tantum dopo aver popolato `deep-links.json` con dati reali, e ripetere solo quando il registro cambia:

```bash
gulp generateWellKnown
scp builds/well-known/apple-app-site-association server:/var/www/html/app.geohub.webmapp.it/.well-known/apple-app-site-association
scp builds/well-known/assetlinks.json server:/var/www/html/app.geohub.webmapp.it/.well-known/assetlinks.json
```

`apple-app-site-association` **non deve avere estensione `.json`** ed **è servito senza autenticazione né redirect** — verificare che il server web non applichi redirect HTTPS→HTTPS con www o simili su quel path specifico.

---

## Verifica

Dopo tutti i commit:

1. **Build nativo di test su tutte le istanze** (non solo `camminiditalia`): eseguire `buildAndroid`/`buildIos` (o almeno `updateAndroidPlatform`/`updateIosPlatform`) per `camminiditalia`, `carg`, `osm2cai` e ispezionare a mano `AndroidManifest.xml` generato (intent-filter presente, XML valido) e `project.pbxproj` (via `xcodebuild -showBuildSettings` o apertura in Xcode, `CODE_SIGN_ENTITLEMENTS` impostato in Debug e Release)
2. **Capability Apple Developer Portal**: abilitare "Associated Domains" sul Bundle ID `it.webmapp.cammini` (accesso già confermato)
3. **Deploy `.well-known`**: dopo aver popolato `deep-links.json` con il fingerprint reale, eseguito `gulp generateWellKnown` e fatto l'upload manuale (Task 5c), verificare:
   ```bash
   curl -sI https://1.camminiditalia.webmapp.it/.well-known/apple-app-site-association
   curl -sI https://1.camminiditalia.webmapp.it/.well-known/assetlinks.json
   ```
   Entrambi devono rispondere `200`, `Content-Type: application/json` (o assente per il primo, ma senza redirect). Se il DNS/hosting di questo dominio non è ancora attivo (rischio noto in overview), questo step blocca tutto il resto — va risolto per primo
4. **Build firmato reale** (TestFlight iOS, APK/AAB firmato Android) di `camminiditalia`, installato su device fisico
5. **Test cold start**: app non in esecuzione (killata, non solo in background) → tap su link `https://1.camminiditalia.webmapp.it/map?track=X` da Note/Messaggi → verificare apertura diretta dell'app sulla traccia X
6. **Test warm start**: app già aperta (su un'altra schermata) → stesso tap → verificare navigazione immediata alla traccia X
7. **Test fallback**: stesso link aperto su device senza l'app installata → verificare apertura normale della PWA in browser, nessun errore
8. **Test id inesistente**: link con `?track=999999999` (id inventato) → verificare comportamento silenzioso (mappa aperta senza selezione, nessun errore visibile)
9. **Test path diverso da `/map`**: link a un altro path del sito (es. la root con `?search=...`, o una pagina esistente) → verificare che l'app nativa si apra comunque e mostri la route corrispondente, coerente con lo scope ampliato a tutto il dominio
10. **Verifica evento PostHog**: controllare in PostHog (live events) che arrivi `deepLinkOpened` per ogni test sopra
