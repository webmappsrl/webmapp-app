# Il gulpfile: risorse, permessi e build native

## Come funziona oggi

Il `gulpfile.js` prepara config, risorse e `variables.gradle` per le build native, e prima di invocare `cordova-res` valida le dimensioni di `icon.png`, `notification_icon.png` e `splash.png`.

Le soglie sono **platform-specific**, non universali: Android icon e notification_icon ≥ 512×512 (ne usiamo 1024 come margine), Android splash ≥ 1920×1920, iOS icon ≥ 1024×1024, iOS splash ≥ 2732×2732. Nessun vincolo di aspect ratio.

`manageAndroidPermissions(hasUgc)` gestisce i permessi: `READ_MEDIA_IMAGES` viene sempre rimosso, storage aggiunto solo se la UGC è attiva.

La release Android passa da R8 (oc:8892). `_updateAndroidFiles()` porta il blocco `release` del `build.gradle` a `minifyEnabled true` con `proguard-android-optimize.txt`, scrive `android.enableR8.fullMode=false` in `gradle.properties` e copia `resources/android/proguard-rules.pro` nell'istanza. Le trasformazioni stanno in `scripts/android-r8.js`, testate con `npm run test:gulp`. `--skip-r8` prepara la stessa build senza R8. La release si compila e si firma da Android Studio sul progetto preparato da `gulp build-android`.

## Perché così

- **Le soglie vengono dal sorgente, non dal README** (oc:8246): sono verificate in `cordova-res/dist/resources.js` (`getRasterResourceSchema`). Il README riporta 2732×2732 come raccomandazione universale, che letta come requisito Android è fuorviante.
- **La validazione non blocca mai la build da sola** (oc:8246): sotto soglia dà un warning e chiede conferma interattiva; «sì» salta quella risorsa e procede con le altre; «no» o stdin non-TTY interrompe. `--skip-resource-validation` la bypassa.
- **La chiave UGC è `MAP.record_track_show`, non `APP.record_track_show`** (oc:7294): si legge da `dir/config.json` su disco in `_updateAndroidFiles()`, chiamata solo dopo che `build()` ha scaricato il config. Se il file non è leggibile, il default è conservativo — nessun permesso di storage, meglio meno che troppi lato Play Store.
- **`sharp` è una transitiva di `cordova-res` e `@capacitor/assets`** (oc:7480), già in `node_modules`: non va aggiunta a `package.json`. Se quei tool sparissero, andrebbe dichiarata come devDependency.
- **Le chiavi del config sono camelCase** (oc:7480): il backend espone `APP.myPaths`/`APP.myDownloads`; la route API e i nomi dei file restano snake_case.
- **`validatePosthogConfig()` usa `throw`, non `process.exit(1)`** (oc:8105): il throw dentro un Promise executor viene catturato da Node come rejection e permette il teardown di Gulp.
- **R8 per la soglia di ottimizzazione DEX di Play Console** (oc:8892): la 13.1.18 di camminiditalia aveva ottimizzazione assente e offuscamento all'1-2%, sotto il 25% richiesto entro febbraio 2027. Il template di `npx cap add android` ha `minifyEnabled false`, e `instances/` è rigenerata: la modifica deve stare nel gulpfile.
- **`proguard-android-optimize.txt`, non `proguard-android.txt`** (oc:8892): il secondo contiene `-dontoptimize`, e con minify attivo l'ottimizzazione resterebbe a zero.
- **Modalità compatibile, non full mode** (oc:8892): dal plugin Android 8 la full mode è il default e rimuove e rinomina in modo più aggressivo. La modalità compatibile basta per la metrica di Play e rompe meno librerie. Le classi dei plugin Capacitor sono protette dalle regole di `@capacitor/android`; i plugin non hanno regole proprie.
- **Niente `shrinkResources`** (oc:8892): non conta per il punteggio DEX, e i plugin che cercano risorse per nome (`getIdentifier`, per esempio background-geolocation) si romperebbero.
- **Un `build.gradle` inatteso ferma `build-android`** (oc:8892), invece di preparare in silenzio una release senza R8.
- **Tornare indietro richiede una release nuova** (oc:8892): il `versionCode` viene dalla versione del `package.json` della root e Play rifiuta un `versionCode` già caricato. Si ferma il rilascio graduale su Play e si fa una patch release con release-please, preparata con `--skip-r8`.
- **Il `mapping.txt` non si archivia** (oc:8892): viaggia dentro l'AAB (`BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map`) e Play Console lo usa da sé. Per ritrovare quello di una versione si rifà la build dal tag della release, con i submodule allineati, le dipendenze installate con `npm ci` e lo stesso JDK major: R8 è deterministico e le versioni delle librerie native sono fisse.

## Come ci siamo arrivati

- **Controllo dell'esito di Gradle nei task gulp di release** (oc:8892, scartato): era previsto che `build-android-bundle` e `build-android-apk` controllassero il codice di uscita di `./gradlew` e la presenza di `mapping.txt`, perché oggi non lo fanno e firmano qualunque AAB trovino. Tolto perché le release non passano da quei task ma da Android Studio, che mostra da sé l'esito della build.

## Trappole

Il dettaglio operativo di queste e delle altre — invocazioni separate di `cordova-res`, dove va la
validazione, i permessi, i `.webp` veri — sta in
[.claude/rules/gulp-e-risorse.md](../../.claude/rules/gulp-e-risorse.md), che si carica quando si
tocca il `gulpfile.js`. Qui resta il perché.

- **`gulp build-android` non compila**: prepara soltanto config, risorse e `variables.gradle`. Per verificare che una modifica compili si lancia `./gradlew app:bundleRelease` (o `assembleDebug`) in `instances/<app>/android/` dopo `build-android`, oppure si compila da Android Studio. `build-android-apk(-debug)` e `build-android-bundle` funzionano solo per le app dello shard geohub, perché non passano lo shard (oc:8892).
- **`instances/posthog.json` è gitignored**: in CI va creato esplicitamente dai secret prima di invocare gulp.

## Debito noto

- **Il bump a SDK 36 è volutamente il solo numero** (oc:8277): nessun upgrade di Capacitor, che resta 7.4.5, e nessun fix difensivo per i behavior enforced da Android 16 — edge-to-edge, back gesture, foreground service location. Accettato per la scadenza Play Store; il percorso corretto, Capacitor 8, è rimandato.
- **Rischi noti non mitigati** (oc:8277): manca `android:enableOnBackInvokedCallback` nel manifest; le versioni AndroidX sono disallineate fra istanze; la compatibilità di `cordova-android 10.1.1` con API 36 non è verificata; il requisito Play sull'allineamento a 16KB delle librerie native non è verificato.
- **`build-android-apk(-debug)` e `build-android-bundle` ignorano lo shard** (oc:8892): `buildAndroidApk()` e `buildAndroidBundle()` chiamano `buildAndroid()` senza `shardName`, quindi per un'app fuori da geohub (camminiditalia) cercano il config su `geohub.webmapp.it` e si fermano con «Missing app id». Non sono usati per le release, e non sono stati corretti.
- **`notification_icon.png` dipenderebbe da `icon.png` per lo shard carg**, dove non è usata (oc:8246): annotato nel cantiere, non risolto.
