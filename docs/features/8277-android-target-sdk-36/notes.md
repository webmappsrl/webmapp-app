> Ticket: oc:8277

# Notes — [android] api target

## Deviazioni dal piano
- Il piano (Task 3) indicava `npx gulp build-android -i camminiditalia -g <ID>` come comando di verifica. Verificato che questo task **non compila effettivamente il progetto**: prepara solo config/risorse/`variables.gradle` (funzione `buildAndroid()` → `build()` + `updateAndroidPlatform()` + `updateResources()`, nessuna invocazione di `gradlew`). La reale compilazione Gradle (che può fallire per problemi di `compileSdk`/AAPT2/AndroidX) avviene solo con `gulp build-android-apk-debug` / `build-android-apk` / `build-android-bundle`, che internamente eseguono `./gradlew tasks app:assemble<Type>` o `app:bundle<Type>` (righe 1317-1319, 1454-1456 di `gulpfile.js`). Il comando corretto per il Task 3 è `npx gulp build-android-apk-debug -i camminiditalia -g <GEOHUB_INSTANCE_ID>`.

## Bug trovati
Nessuno riscontrato nel codice modificato.

## Decisioni
- Il dev ha eseguito `gulp build-android -i camminiditalia -g <ID>` in locale (Task 1 + parte di Task 3): confermato che `instances/camminiditalia/android/variables.gradle` generato riporta correttamente `compileSdkVersion = 36`, `targetSdkVersion = 36`, `minSdkVersion = 28` (invariato) — Android SDK Platform 36 risultava quindi già installato correttamente sulla macchina di sviluppo
- La vera compilazione Gradle (`gulp build-android-apk-debug`, vedi Deviazioni) non è stata ancora eseguita al momento di questo commit — resta un passo di verifica manuale da completare prima del merge, coerente con il precedente già annotato in `docs/features/8246-validazione-dimensioni-splash-icon-cordova-res/notes.md` (build Android end-to-end non eseguibile/verificabile nella sessione di pianificazione, demandata al developer)
- Il commit del bump `gulpfile.js` procede comunque prima del completamento della verifica di compilazione: la modifica di codice è a basso rischio (2 righe, stesso pattern già usato nei bump storici 33→34→35 documentati in `CHANGELOG.md`) e la verifica di compilazione è un passo di QA indipendente, non blocca la review del codice

## Follow-up
- Eseguire `npx gulp build-android-apk-debug -i camminiditalia -g <GEOHUB_INSTANCE_ID>` e verificare che completi senza errori Gradle, prima di aprire/mergiare la PR
- Aggiornare `plan.md` Task 3 con il comando corretto (`build-android-apk-debug` invece di `build-android`) se questo piano viene riutilizzato come riferimento futuro
- Rischi noti non mitigati in questo ciclo (vedi `overview.md` → Rischi): nessuna azione richiesta salvo emersione di problemi concreti in uso reale
