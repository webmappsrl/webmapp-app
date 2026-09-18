---
paths:
  - "gulpfile.js"
  - "instances/**"
---

# Trappole: gulp, risorse native e permessi

Il perché sta in [docs/knowledge/gulp-e-build-native.md](../../docs/knowledge/gulp-e-build-native.md).

- **`gulp build-android` non compila niente**: prepara solo config, risorse e `variables.gradle`.
  Per verificare che una modifica compili davvero servono `build-android-apk(-debug)` o
  `build-android-bundle`, che invocano `./gradlew`.

- **`cordova-res` va invocato una volta per tipo di risorsa**, mai in una chiamata combinata: se una
  sola risorsa non supera la validazione interna, fallisce l'**intera invocazione** — exit code 1,
  nessun file generato — e le risorse valide non vengono prodotte.

- **Le soglie di dimensione sono platform-specific**, e il README di `cordova-res` è fuorviante:
  riporta 2732×2732 come raccomandazione universale, che letta come requisito Android è falsa. I
  valori veri stanno in `cordova-res/dist/resources.js`.

- **La chiave che dice se la UGC è attiva è `MAP.record_track_show`**, non `APP.record_track_show`,
  e si legge da `dir/config.json` su disco — quindi solo dopo che `build()` ha scaricato il config.
  Se il file non è leggibile il default è «niente permessi di storage», ed è quello giusto.

- **`manageAndroidPermissions()` ha sostituito `addPermissionsIfNotPresent()`**: non devono
  coesistere, una rimuove ciò che l'altra ri-aggiunge.

- **Un `.webp` deve essere WebP vero.** Salvare un PNG con quell'estensione fa fallire iOS: WKWebView
  riceve `Content-Type: image/webp` e bytes PNG. La conversione via `sharp` è obbligatoria — e
  `sharp` è già presente come transitiva di `cordova-res`, non va aggiunta a `package.json`.

- **`instances/posthog.json` è gitignored**: in CI va creato dai secret prima di invocare gulp.
