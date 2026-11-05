> Ticket: oc:8892

# Notes — R8 nella build Android di release

## Divergenze dal piano, task per task

### Task 1: comando dei test

Il piano indicava `node --test scripts/`. Con Node 22 un percorso di cartella passato a `--test`
viene eseguito come file e fallisce; lo script `test:gulp` usa quindi `node --test scripts/*.test.js`,
che funziona con Node 18 e Node 22. Il runner di Node 18 rifiuta anche le lettere accentate nei nomi
dei test: il test `è idempotente` si chiama `idempotente`.

### Task 2: R8 fuori dalla pipeline gulp

Il piano lasciava aperto come innestare `applyR8ToBuildGradle()` nella pipeline gulp del
`build.gradle`. Un errore lanciato dentro un `replace` di gulp si perde nello stream (l'handler
`error` è sul `gulp.dest`, non sul `replace`), quindi la trasformazione R8 è fatta prima, in modo
sincrono (`readFileSync` / `writeFileSync`, `try/catch` → `reject`). Verificato: togliendo
`minifyEnabled` dal `build.gradle` dell'istanza, `gulp build-android` si ferma con «build.gradle:
nessun "minifyEnabled" nel blocco release, impossibile configurare R8».

### Task 3: tolto

Il Task 3 (pulizia dell'output, codice di uscita di `./gradlew`, controllo di `mapping.txt` in
`buildAndroidBundle()` e `buildAndroidApk()`) era stato scritto e poi tolto, su decisione del dev.
Le release non passano da quei task: si fanno con `gulp build-android`, che prepara il progetto, e
poi con Android Studio, che compila e firma e mostra da sé l'esito di Gradle. Il rischio che il
Task 3 copriva (un AAB vecchio firmato dopo una build fallita) nel flusso reale non si presenta.

La verifica della build di release è stata fatta lanciando `./gradlew app:bundleRelease` nel
progetto preparato da `gulp build-android`: BUILD SUCCESSFUL, nessun avviso di R8, `mapping.txt` di
circa 17 MB, e il mapping incluso nell'AAB in
`BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map`.

## Bug trovati

- **I task gulp che compilano ignorano lo shard** (preesistente, non corretto: fuori scope).
  `buildAndroidApk()` e `buildAndroidBundle()` chiamano `buildAndroid(instanceName, geohubInstanceId)`
  senza `shardName`, quindi `build()` usa il default `'geohub'`. Per un'app su uno shard diverso
  (camminiditalia) `gulp build-android-apk-debug -s camminiditalia` cerca la config su
  `geohub.webmapp.it` e si ferma con «Missing app id». Il task `build-android` invece passa lo
  shard. Sono task non usati per le release.

- **Crash a ogni pausa dell'app nella release con R8** (trovato nel test su device, corretto).
  Un deep link con l'app aperta, o il tasto Home, mandava in crash la release
  («Unable to pause activity»): retrace col `mapping.txt` → `BackgroundGeolocation.handleOnPause`
  → `Plugin.getPermissionState("location")` → `Bridge.getPermissionStates` (`Bridge.java:1220`),
  dove `getPluginAnnotation()` era `null`. La build debug, con lo stesso deep link, non crasha;
  nel dex della release l'annotazione `@CapacitorPlugin` c'è (rinominata). Le regole di
  `@capacitor/android` proteggono i plugin ma non il nucleo `com.getcapacitor`, che legge
  l'annotazione a runtime. Corretto con `-keep class com.getcapacitor.** { *; }` e
  `-keep @interface com.getcapacitor.annotation.** { *; }` in
  `resources/android/proguard-rules.pro`: release rifatta, deep link e Home senza crash.

## Decisioni

- Nessun tag Orchestrator associato al ticket, su scelta del dev.
- I comandi gulp vanno lanciati con Node ≥ 20.19: con Node 18 `ng build` si rifiuta di partire e
  `build-android` si ferma su «Failed to copy android platform». Le verifiche sono state fatte con
  Node 22.23.2.
- Il `mapping.txt` non viene archiviato: R8 è deterministico e le versioni delle librerie native
  sono fisse, quindi lo si ritrova rifacendo la build dal tag della release (submodule allineati,
  `npm ci`, stesso JDK major).

## Follow-up

- ~~Test su device della release di camminiditalia (Task 4 del piano)~~ — fatto il 05/11/2026 su
  Pixel 9 Pro XL, release 13.1.18 compilata con R8 e firmata con la chiave di debug, dopo la
  correzione `-keep` del nucleo di Capacitor (vedi «Bug trovati»): registrazione in background,
  login, home e mappa, download offline in modalità aereo, condivisione, PostHog (eventi arrivati
  in dashboard), controllo aggiornamenti di Play Core, deep link e pausa dell'app: tutto
  funzionante, nessun crash né errore di classi rimosse in logcat. **Notifiche non provate**: il
  permesso era negato sul dispositivo.
- Rilascio graduale su Play e controllo dei crash in Android vitals.
