# deep-links.json — registro app per Universal Links / App Links

Registro delle app abilitate al deep link (oc:7980). Ogni chiave è il nome di un'istanza (es. `camminiditalia`). Letto da `gulp generateWellKnown`, che genera `apple-app-site-association` e `assetlinks.json` in `builds/well-known/` (da caricare manualmente sul server — vedi `plan.md` della feature).

## Campi per ogni istanza

### `bundleId` (obbligatorio)

Identificativo dell'app. Usato per iOS (`appID` = Team ID + `bundleId`) e, se `packageName` è assente, anche per Android (`package_name`).

Si trova in `instances/<nome>/capacitor.config.json`, campo `"appId"` — con Capacitor è normalmente lo stesso valore su entrambe le piattaforme.

### `packageName` (opzionale)

Da specificare **solo** nei rari casi in cui il package name Android sia diverso dal bundle id iOS.

- Se presente: `bundleId` viene usato solo per iOS, `packageName` solo per Android.
- Se assente: `bundleId` vale per entrambe le piattaforme.

### `androidSha256Fingerprints` (obbligatorio, array)

Impronta/e SHA-256 del certificato che firma davvero l'APK/AAB installato sugli utenti. Dove trovarla:

- **Se l'app usa Play App Signing** (default per le app pubblicate dopo il 2021): Play Console → l'app → *Test e rilascia* → *Integrità dell'app* → sezione **"Protezione del Play Store"** → riga *"Proteggi la chiave di firma dell'app"* → pulsante **"Gestisci la firma dell'app di Google Play"** → sezione **"Chiave di firma dell'app"** (non "Chiave di caricamento") → campo *"Fingerprint del certificato SHA-256"*.
- **Se l'app NON usa Play App Signing**:
  ```bash
  keytool -list -v -keystore builds/keys/<alias>.keystore -alias <alias> -storepass "$PASS" | grep 'SHA256:'
  ```

L'array supporta più valori — utile per testare in locale con un keystore diverso da quello di produzione (debug o upload key) senza sostituire il fingerprint reale. Vedi la guida di test manuale della feature per i comandi.
