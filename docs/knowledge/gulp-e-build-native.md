# Il gulpfile: risorse, permessi e build native

## Come funziona oggi

Il `gulpfile.js` prepara config, risorse e `variables.gradle` per le build native, e prima di invocare `cordova-res` valida le dimensioni di `icon.png`, `notification_icon.png` e `splash.png`.

Le soglie sono **platform-specific**, non universali: Android icon e notification_icon ≥ 512×512 (ne usiamo 1024 come margine), Android splash ≥ 1920×1920, iOS icon ≥ 1024×1024, iOS splash ≥ 2732×2732. Nessun vincolo di aspect ratio.

`manageAndroidPermissions(hasUgc)` gestisce i permessi: `READ_MEDIA_IMAGES` viene sempre rimosso, storage aggiunto solo se la UGC è attiva.

## Perché così

- **Le soglie vengono dal sorgente, non dal README** (oc:8246): sono verificate in `cordova-res/dist/resources.js` (`getRasterResourceSchema`). Il README riporta 2732×2732 come raccomandazione universale, che letta come requisito Android è fuorviante.
- **La validazione non blocca mai la build da sola** (oc:8246): sotto soglia dà un warning e chiede conferma interattiva; «sì» salta quella risorsa e procede con le altre; «no» o stdin non-TTY interrompe. `--skip-resource-validation` la bypassa.
- **La chiave UGC è `MAP.record_track_show`, non `APP.record_track_show`** (oc:7294): si legge da `dir/config.json` su disco in `_updateAndroidFiles()`, chiamata solo dopo che `build()` ha scaricato il config. Se il file non è leggibile, il default è conservativo — nessun permesso di storage, meglio meno che troppi lato Play Store.
- **`sharp` è una transitiva di `cordova-res` e `@capacitor/assets`** (oc:7480), già in `node_modules`: non va aggiunta a `package.json`. Se quei tool sparissero, andrebbe dichiarata come devDependency.
- **Le chiavi del config sono camelCase** (oc:7480): il backend espone `APP.myPaths`/`APP.myDownloads`; la route API e i nomi dei file restano snake_case.
- **`validatePosthogConfig()` usa `throw`, non `process.exit(1)`** (oc:8105): il throw dentro un Promise executor viene catturato da Node come rejection e permette il teardown di Gulp.

## Trappole

Il dettaglio operativo di queste e delle altre — invocazioni separate di `cordova-res`, dove va la
validazione, i permessi, i `.webp` veri — sta in
[.claude/rules/gulp-e-risorse.md](../../.claude/rules/gulp-e-risorse.md), che si carica quando si
tocca il `gulpfile.js`. Qui resta il perché.

- **`gulp build-android` non compila**: prepara soltanto config, risorse e `variables.gradle`. Per verificare che una modifica compili servono `build-android-apk(-debug)` o `build-android-bundle`, che invocano `./gradlew`.
- **`instances/posthog.json` è gitignored**: in CI va creato esplicitamente dai secret prima di invocare gulp.

## Debito noto

- **Il bump a SDK 36 è volutamente il solo numero** (oc:8277): nessun upgrade di Capacitor, che resta 7.4.5, e nessun fix difensivo per i behavior enforced da Android 16 — edge-to-edge, back gesture, foreground service location. Accettato per la scadenza Play Store; il percorso corretto, Capacitor 8, è rimandato.
- **Rischi noti non mitigati** (oc:8277): manca `android:enableOnBackInvokedCallback` nel manifest; le versioni AndroidX sono disallineate fra istanze; la compatibilità di `cordova-android 10.1.1` con API 36 non è verificata; il requisito Play sull'allineamento a 16KB delle librerie native non è verificato.
- **`notification_icon.png` dipenderebbe da `icon.png` per lo shard carg**, dove non è usata (oc:8246): annotato nel cantiere, non risolto.
