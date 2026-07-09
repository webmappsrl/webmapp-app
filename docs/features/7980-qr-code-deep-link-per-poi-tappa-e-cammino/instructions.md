# Abilitare il deep link (QR code / Universal Links / App Links) su una nuova app

Guida operativa per estendere il meccanismo di deep link (oc:7980) a una nuova istanza. Il codice è già generico — questi sono i passaggi manuali (una tantum per istanza) che restano fuori dal codice.

Copertura attuale: **tutto il dominio dell'istanza**, qualunque path e query param (non solo `/map`) — l'app nativa si apre per qualsiasi link a `https://{dominio-istanza}/...`, e il router Angular decide internamente cosa mostrare, esattamente come farebbe aprendo lo stesso URL in un browser. Unica esclusione: `ugc_track`/`ugc_poi` (dati personali) vengono sempre scartati dai query param, indipendentemente dal path.

---

## 1. Prerequisiti (una tantum per istanza)

### 1a — Capability Apple Developer Portal

Su [developer.apple.com](https://developer.apple.com) → Certificates, Identifiers & Profiles → Identifiers → seleziona il Bundle ID della nuova app → Capabilities → abilita **Associated Domains**.

Senza questo passaggio, l'entitlement generato nel build iOS non ha alcun effetto — è un requisito lato Apple, non risolvibile da codice.

### 1b — Fingerprint SHA-256 Android

Verifica se l'app usa **Play App Signing** (praticamente sempre sì per le app pubblicate dopo il 2021):

- **Se sì**: Play Console → l'app → *Test e rilascia* → *Integrità dell'app* → sezione **"Protezione del Play Store"** → riga *"Proteggi la chiave di firma dell'app"* → pulsante **"Gestisci la firma dell'app di Google Play"** → sezione **"Chiave di firma dell'app"** (non "Chiave di caricamento") → campo *"Fingerprint del certificato SHA-256"*.
- **Se no**:
  ```bash
  keytool -list -v -keystore builds/keys/<alias>.keystore -alias <alias> -storepass "$PASS" | grep 'SHA256:'
  ```

Dettagli sul perché serve proprio questo certificato (e non quello di upload/debug) in `deep-links.README.md`.

---

## 2. Aggiungere l'istanza al registro

Apri `deep-links.json` e aggiungi una entry con il nome dell'istanza:

```json
{
  "camminiditalia": { "...": "..." },
  "nuova-istanza": {
    "bundleId": "it.webmapp.nuovaistanza",
    "androidSha256Fingerprints": [
      "XX:XX:...:XX"
    ]
  }
}
```

`bundleId` si trova in `instances/<nome>/capacitor.config.json`, campo `"appId"`. Se il package name Android fosse diverso dal bundle id iOS (raro), aggiungi anche `"packageName"` — vedi `deep-links.README.md` per i dettagli di entrambi i campi.

**Non rimuovere le entry delle altre istanze** — il file `.well-known` generato è condiviso da tutte le app (stesso dominio wildcard `*.webmapp.it`, stesso hosting `wm-webapp`): rimuovere un'entry esistente romperebbe la verifica per quell'istanza.

---

## 3. Generare e caricare i file `.well-known`

```bash
gulp generateWellKnown
```

Genera `builds/well-known/apple-app-site-association` e `builds/well-known/assetlinks.json`, aggregando **tutte** le entry del registro (non solo quella nuova). Se un fingerprint è ancora un placeholder, il task si blocca con un errore esplicito invece di generare un file rotto.

Upload manuale (stesso server per tutte le istanze, va rifatto ogni volta che il registro cambia — non è automatizzato in CI, vedi `plan.md` della feature per il perché):

```bash
ssh root@<host-server> "mkdir -p /var/www/html/app.geohub.webmapp.it/.well-known"
scp builds/well-known/apple-app-site-association server:/var/www/html/app.geohub.webmapp.it/.well-known/apple-app-site-association
scp builds/well-known/assetlinks.json server:/var/www/html/app.geohub.webmapp.it/.well-known/assetlinks.json
```

Verifica che siano raggiungibili (bloccante — se falliscono qui, niente altro funzionerà):

```bash
curl -sI https://<dominio-istanza>/.well-known/apple-app-site-association
curl -sI https://<dominio-istanza>/.well-known/assetlinks.json
```

Devono rispondere `200`, senza redirect.

---

## 4. Build nativo

Nessuna azione manuale aggiuntiva: il dominio (intent-filter Android, entitlements iOS) viene calcolato automaticamente per qualsiasi istanza da `resolveInstanceDomain()` in `gulpfile.js`, alimentata dagli stessi dati (`shards`/`redirects` di wm-types) usati a runtime da `EnvironmentService`.

```bash
gulp build-android --instance <nuova-istanza> --geohubInstanceId <id> --shardName <shard>
gulp build-ios --instance <nuova-istanza> --geohubInstanceId <id> --shardName <shard>
```

Verifiche consigliate sui file generati prima di firmare/pubblicare:

- `instances/<nuova-istanza>/android/app/src/main/AndroidManifest.xml` contiene il blocco `<!-- BEGIN deep-link-intent-filter -->` con `android:host` uguale al dominio reale dell'istanza
- `instances/<nuova-istanza>/ios/App/App/App.entitlements` esiste, con `applinks:<dominio-istanza>`
- `instances/<nuova-istanza>/ios/App/App.xcodeproj/project.pbxproj` contiene `CODE_SIGN_ENTITLEMENTS = App/App.entitlements;` in Debug e Release

Poi build firmata (TestFlight iOS / Play Console Android o keystore locale, vedi nota sotto) su device reale.

---

## 5. Test end-to-end

### iOS

Non serve necessariamente TestFlight: build diretta da Xcode su device reale funziona, a patto che il provisioning profile usato includa davvero l'entitlement (con firma automatica in Xcode, si rigenera da solo dopo aver abilitato la capability al punto 1a; con firma manuale — quella usata dalla pipeline di release — il profile va rigenerato/riscaricato a mano).

### Android

#### Il problema del certificato — build da Android Studio vs build reale

Se l'app usa Play App Signing (praticamente sempre, vedi punto 1b), una build lanciata da Android Studio ("Run", firma debug) o firmata con il keystore locale di upload **non combacerà** con il fingerprint in `assetlinks.json` (che è quello di Google) — la verifica fallisce non per un errore di configurazione, ma perché è firmata con una chiave diversa da quella che finisce sui device reali.

**Come trovare il fingerprint della build locale e aggiungerlo per testare:**

```bash
# Build lanciata da Android Studio ("Run") → firma debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android | grep 'SHA256:'

# Build firmata con il keystore locale di upload (gulp build-android-apk / build-android-bundle)
keytool -list -v -keystore builds/keys/<alias>.keystore -alias <alias> -storepass "$PASS" | grep 'SHA256:'
```

Copia il valore (formato `XX:XX:XX:...`, mantieni i due punti e le lettere in MAIUSCOLO — un fingerprint non maiuscolo è una causa nota di fallimento verifica) e aggiungilo come **seconda entry** nell'array, senza rimuovere quello reale:

```json
"androidSha256Fingerprints": [
  "<fingerprint reale da Play Console>",
  "<fingerprint locale, solo per test>"
]
```

Poi:
```bash
gulp generateWellKnown
scp builds/well-known/assetlinks.json server:/var/www/html/app.geohub.webmapp.it/.well-known/assetlinks.json
```

**Importante — togli il fingerprint locale prima di considerare la feature pronta per produzione**: è stato aggiunto solo per permettere il test, non è una chiave di firma legittima.

#### Comandi di debug Android

```bash
# Stato di verifica corrente
adb shell pm get-app-links <bundleId>

# Forza una nuova verifica (non garantisce che sia immediata, vedi nota sotto)
adb shell pm verify-app-links --re-verify <bundleId>

# Reset completo dello stato (utile prima di un nuovo giro di test puliti)
adb shell pm set-app-links --package <bundleId> 0 all

# Forza manualmente lo stato a "verificato" — SOLO per isolare/testare il codice
# dell'app, bypassa la verifica reale, non usare come sostituto della verifica vera
adb shell pm set-app-links --package <bundleId> 1 <dominio-istanza>
adb shell pm set-app-links-user-selection --user 0 --package <bundleId> true <dominio-istanza>

# Simula il tap su un link (utile per testare senza dover davvero cliccare da un'altra app)
adb shell am start -a android.intent.action.VIEW -d "https://<dominio-istanza>/map?track=<id>"

# Verifica quale app ha effettivamente gestito l'intent
adb shell dumpsys activity activities | grep -A3 topResumedActivity
```

#### La verifica automatica può richiedere tempo — non è istantanea anche a configurazione corretta

Scoperto testando su device reale (Pixel 9 Pro XL, Android 16): dopo aver aggiornato `assetlinks.json` sul server (raggiungibile, `200`, contenuto corretto), `pm verify-app-links --re-verify` non ha portato lo stato a `verified` nemmeno dopo diversi tentativi e ~1 minuto di attesa. Causa identificata: la verifica dipende (almeno in parte) da un'infrastruttura di Google con **cache propria**, indipendente da quella del device — interrogando l'API pubblica `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://<dominio-istanza>&relation=delegate_permission/common.handle_all_urls` è emerso un campo `maxAge` di ~2221 secondi (~37 minuti), e il contenuto restituito non rifletteva ancora una modifica appena fatta al file.

**Conseguenze pratiche:**
- Dopo ogni modifica a `assetlinks.json`, aspettarsi **fino a ~40 minuti** prima che la verifica possa avere successo, anche con tutto configurato correttamente
- Usare l'API sopra per controllare cosa vede davvero Google in un dato momento, senza dipendere dallo stato (potenzialmente stantio) del device:
  ```bash
  curl -s "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://<dominio-istanza>&relation=delegate_permission/common.handle_all_urls"
  ```
- Se serve testare subito senza aspettare, usare i comandi di force manuale sopra (`pm set-app-links` + `pm set-app-links-user-selection`) per bypassare la verifica e testare solo il comportamento dell'app — **non è un sostituto della verifica reale**, serve solo a isolare "il codice funziona?" da "la propagazione è già avvenuta?"
- Testare con una build da un canale Play Console (Internal testing) invece che con una build locale evita il problema per il fingerprint reale, che è tipicamente già stabile nella cache di Google

### Casi da testare (entrambe le piattaforme)

1. Cold start (app killata) → tap su link `https://<dominio-istanza>/map?track=<id>` → apre l'app nativa
2. Warm start (app già aperta) → stesso link → naviga subito
3. Fallback (app non installata) → apre la PWA in browser, nessun errore
4. Id inesistente (`?track=999999999`) → nessun crash, comportamento silenzioso
5. Path diverso da `/map` (es. root con `?search=...`, o un'altra pagina del sito) → apre comunque l'app nativa sulla route corrispondente
6. Evento PostHog `deepLinkOpened` visibile nei live events per ogni tap

Prima di ogni test: disinstalla e reinstalla l'app dopo aver aggiornato `.well-known` — il sistema operativo cachea la verifica all'installazione, non la rifà da solo (Android permette di forzarla con `pm verify-app-links --re-verify`, iOS no).

---

## Nota: perché tutto il dominio, e non solo `/map`

Scelta deliberata (non il default iniziale di questo ticket, ampliato successivamente su richiesta): qualunque link al dominio dell'istanza apre l'app nativa, non solo `/map`. Implementazione:

- **`handleDeepLink()`** (`wm-core/projects/wm-core/src/services/url-handler.service.ts`) inoltra path e query param generici al router — nessun allowlist di path/param, solo l'esclusione di `ugc_track`/`ugc_poi`
- **`apple-app-site-association`** usa `"paths": ["*"]` — sintassi Apple dedicata per "gestisci l'intero dominio" (non un semplice wildcard `/*`)
- **Intent-filter Android** (`manageDeepLinkIntentFilter()`, `gulpfile.js`) non specifica `pathPrefix`/`path` — matcha qualunque path sull'host

**Tradeoff accettato**: se il sito avesse pagine puramente web senza un vero equivalente nell'app (es. una privacy policy pubblicata sullo stesso dominio), anche quei link tenterebbero di aprire l'app nativa invece del browser — la SPA gestisce comunque qualunque path tramite il router Angular, quindi non c'è rottura funzionale, ma il comportamento (app invece di browser) si applica a tutto il dominio, non solo ai contenuti pensati per il deep link. Se in futuro serve restringere di nuovo a path specifici, vedi i tre punti sopra come riferimento a cosa modificare (e nota che Android non supporta comunque il matching su query string a livello di manifest — la selettività fine andrebbe gestita dentro l'app).

### Attenzione: cambiare lo scope dei path (`*` ↔ path specifici) non ha lo stesso effetto/tempistica su iOS e Android

Il path (`*` vs `/map`) vive in due posti diversi a seconda della piattaforma, con conseguenze diverse quando si cambia:

- **iOS**: il path vive **solo** in `apple-app-site-association`, lato server. L'entitlement dentro l'app dichiara solo il dominio, non i path — l'app li scopre ogni volta consultando quel file. Per cambiare scope basta: `gulp generateWellKnown` (dopo aver modificato `paths` in `generateWellKnown()`, `gulpfile.js`) → ricaricare il file sul server → disinstallare/reinstallare l'app per forzare la riverifica. **Nessun nuovo build nativo richiesto.**
- **Android**: il path vive dentro l'`<intent-filter>`, **compilato nell'APK stesso** (`manageDeepLinkIntentFilter()`, `gulpfile.js`). `assetlinks.json` non contiene informazioni sui path, solo sull'identità dell'app. Per cambiare scope serve: modificare `manageDeepLinkIntentFilter()` → **nuovo build Android** (`gulp build-android ...`) → **nuova distribuzione** (Play Store o installazione manuale) → l'utente deve aggiornare/reinstallare l'app.

Conseguenza pratica: un'app Android già installata con l'intent-filter "aperto a tutti i path" **continua a comportarsi così** anche dopo aver ristretto il codice/`assetlinks.json`, finché quell'utente non riceve un nuovo APK con l'intent-filter ristretto. Su iOS invece il cambio è effettivo per tutti non appena il file server-side è aggiornato e l'app viene reinstallata (nessuna nuova versione dell'app da distribuire). Vale in entrambe le direzioni: sia per allargare lo scope sia per restringerlo di nuovo.
