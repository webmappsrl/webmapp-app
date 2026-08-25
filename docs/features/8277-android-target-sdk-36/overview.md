> Ticket: oc:8277

# [android] api target

## Cosa cambia
In `gulpfile.js`, funzione `_updateAndroidFiles()` (Android-only, righe 985-987), i valori scritti in `variables.gradle` di ogni istanza vengono aggiornati da 35 a 36:

- `compileSdkVersion`: 35 → 36
- `targetSdkVersion`: 35 → 36
- `minSdkVersion`: invariato (28)

Nessuna modifica a Capacitor (resta v7.4.5) né alle versioni AndroidX/Cordova già presenti nel template.

## Perché
Google Play richiede `targetSdkVersion` ≥ API 36 (Android 16) per tutte le app nuove e gli aggiornamenti a partire dal **31 agosto 2026** (fonte: [developer.android.com/google/play/requirements/target-sdk](https://developer.android.com/google/play/requirements/target-sdk?hl=it)). A oggi (23/07/2026) mancano circa 5 settimane alla scadenza.

Il percorso "corretto" richiederebbe l'upgrade a Capacitor 8 (unica major certificata per API 36), ma è stato esplicitamente deciso di **non** aggiornare Capacitor in questo ciclo: si accetta il rischio di un setup non ufficialmente supportato pur di superare il gate di Play Store nei tempi. L'upgrade a Capacitor 8 resta un lavoro separato, da programmare a parte.

## Requisiti
- [ ] Verificare che Android SDK Platform 36 sia installato sulla macchina di build (altrimenti la build fallisce con `Failed to find target with hash string 'android-36'`)
- [ ] `compileSdkVersion` in `_updateAndroidFiles()` aggiornato da 35 a 36
- [ ] `targetSdkVersion` in `_updateAndroidFiles()` aggiornato da 35 a 36
- [ ] `minSdkVersion` invariato a 28
- [ ] Capacitor resta alla versione 7.4.5 attuale — nessun upgrade di `@capacitor/*` in questo ticket
- [ ] Build Android locale dell'istanza `camminiditalia` completata senza errori con i nuovi valori
- [ ] Nessuno smoke test manuale richiesto in questo ciclo — la validazione è solo la build che compila senza errori
- [ ] Nessun upload su Play Console richiesto in questo ciclo

## Rischi
- **Setup non ufficialmente supportato da Capacitor**: Capacitor 7 non include gli adattamenti fatti in Capacitor 8 per i nuovi behavior di Android 16/API 36 (edge-to-edge, back gesture, WebView/AndroidX). Se qualcosa si rompe, non è un setup supportato da Capacitor — accettato esplicitamente dall'utente per rispettare la deadline Play Store del 31/08/2026. Nessuna mitigazione attiva in questo ciclo (nessuno smoke test)
- **`android:enableOnBackInvokedCallback` mancante in `AndroidManifest.xml`**: causa radice concreta e non mitigata del possibile comportamento inconsistente del predictive back gesture su target 36. Rischio noto, nessuna azione in questo ciclo
- **Foreground service location (`record_track_show: true` su `camminiditalia`)**: API 36 stringe i requisiti sui foreground service di tipo location; comportamento non verificato in questo ciclo (nessuno smoke test)
- **Disallineamento AndroidX tra istanze**: le versioni AndroidX in `variables.gradle` (es. `androidxCoreVersion = 1.15.0` su `camminiditalia` vs `1.12.0` su `ville`/`ville_old_manifest_sdk`) non vengono toccate da questo ticket. Comportamento non uniforme tra istanze, non verificato
- **`cordova-android 10.1.1`**: compatibilità con API 36 non verificata
- **Requisito Play separato — allineamento 16KB pagine di memoria per librerie native** (in vigore per app/update dal 01/11/2025, indipendente dal gate `targetSdkVersion`): non verificato in questo ciclo poiché l'upload reale su Play Console è out of scope. Rischio che l'upload fallisca comunque più avanti per questo motivo, a prescindere dal bump SDK
- Tutti i rischi sopra sono **documentati e accettati, nessuna azione richiesta in questo ciclo**; eventuali regressioni emerse in uso reale verranno gestite in ticket separati

## Out of scope
- Upgrade di Capacitor a v8 (percorso "corretto" secondo la documentazione ufficiale, ma esplicitamente escluso da questo ciclo)
- Aggiunta del flag `android:enableOnBackInvokedCallback` o altri fix difensivi preventivi per edge-to-edge, back gesture, layout tablet, foreground service o disallineamenti WebView/AndroidX
- Qualsiasi smoke test o verifica manuale di comportamento runtime (su `camminiditalia` o altre istanze)
- Verifica dell'allineamento a 16KB delle librerie native
- Upload reale su Play Console (internal testing o altro canale)
- Modifiche a iOS (il ticket riguarda solo Android)
- Validazione su istanze diverse da `camminiditalia` — il bump è condiviso da tutte le istanze via `gulpfile.js` (nessun meccanismo di override per-istanza)

## Moduli toccati
- `gulpfile.js` (repo principale, righe 985-987, funzione `_updateAndroidFiles()`)
