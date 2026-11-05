> Ticket: oc:8892

# Android: attivare R8 (minify/offuscamento) nella build di release per superare la soglia di ottimizzazione DEX di Play Console

## Cosa cambia

La build Android di release di **tutte le app** passa da R8: il codice nativo viene ridotto,
ottimizzato e offuscato. Il gulpfile, che già rigenera i file Android di ogni istanza, imposta nel
`build.gradle` della release `minifyEnabled true` con `proguard-android-optimize.txt`, scrive in
`gradle.properties` `android.enableR8.fullMode=false` e copia nell'istanza un `proguard-rules.pro`
versionato nel repo.

Un'opzione di emergenza, `--skip-r8`, permette di fare una singola build senza R8 senza toccare il
codice.

Il flusso di release resta quello di oggi: `gulp build-android` prepara il progetto Android (ed è
qui che entra R8), poi Android Studio compila e firma il bundle di release.

## Perché

Play Console, nella Dashboard della release di camminiditalia 13.1.18, segnala l'ottimizzazione del
codice DEX come «Bassa»: percentuale di ottimizzazione assente, offuscamento all'1-2%. Sotto il 25%
Google avvisa di possibili effetti sulla visibilità e sulle funzionalità di pubblicazione, con
scadenza febbraio 2027.

La causa è che il `build.gradle` generato da `npx cap add android` ha `minifyEnabled false`, e il
gulpfile oggi lo modifica solo per `versionCode` e `versionName`. La cartella `instances/` è
gitignored e rigenerata, quindi la modifica deve stare nel gulpfile.

## Requisiti

- [ ] In `_updateAndroidFiles()` il blocco `buildTypes.release` del `build.gradle` di ogni istanza
      viene portato a `minifyEnabled true`, con `getDefaultProguardFile('proguard-android-optimize.txt')`
      al posto di `proguard-android.txt` (quest'ultimo contiene `-dontoptimize` e lascerebbe
      l'ottimizzazione a zero). La sostituzione è idempotente: rieseguire la build su una cartella
      Android già modificata non cambia nulla
- [ ] `gradle.properties` dell'istanza contiene `android.enableR8.fullMode=false`, scritto da
      `_updateAndroidFiles()` e non da `configureGradleJdk()` (che esce prima se non trova il JDK):
      R8 in modalità compatibile, meno aggressiva della full mode che è il default dal plugin
      Android 8. La riga si aggiunge senza cancellare il resto del file e senza duplicarsi
- [ ] `shrinkResources` **non** viene attivato
- [ ] Un file versionato `resources/android/proguard-rules.pro`, nella root del repo, viene copiato
      in `instances/<app>/android/app/proguard-rules.pro` a ogni build Android, sostituendo il
      template commentato di Capacitor. Contiene almeno
      `-keepattributes SourceFile,LineNumberTable,Signature,*Annotation*`, e regole `-keep` mirate
      solo per le librerie che il test su device mostra rotte
- [ ] L'opzione `--skip-r8` (boolean, default `false`), dichiarata in yargs come
      `--skip-resource-validation`, lascia la release con `minifyEnabled false` e
      `proguard-android.txt` e stampa un avviso. Con l'opzione, una cartella Android già portata a
      R8 da una build precedente torna senza R8
- [ ] La build di debug (`build-android-apk-debug`) resta senza R8
- [ ] Se il `build.gradle` non contiene i testi attesi (template cambiato), `gulp build-android` si
      ferma con un errore esplicito invece di preparare in silenzio una release senza R8
- [ ] Verifica durante lo sviluppo, con `gulp build-android` che prepara senza compilare:
      senza opzione il `build.gradle` ha R8 attivo; con `--skip-r8` torna senza R8; di nuovo senza
      opzione torna attivo, e `fullMode=false` compare una volta sola in `gradle.properties`
- [ ] La build di release di camminiditalia (`bundleRelease`, quella che lancia Android Studio)
      termina senza errori R8 e produce `mapping.txt`
- [ ] Prima della pubblicazione, la build di release di camminiditalia funziona su device: login,
      mappa, download offline, condivisione, notifiche, deep link, e in particolare:
  - una registrazione di almeno 15-20 minuti con schermo spento e app in background, con la traccia
    salvata completa alla fine;
  - gli eventi PostHog della sessione di test arrivano nella dashboard di PostHog;
  - il controllo aggiornamenti non dà errori

## Rischi

- **Librerie native caricate per nome che R8 rimuove o rinomina**: crash o errori silenziosi solo
  in release, perché il debug non passa da R8. I plugin Capacitor sono coperti dalle regole di
  `@capacitor/android/capacitor/proguard-rules.pro` (`-keep public class * extends
  com.getcapacitor.Plugin { *; }`); il servizio di background-geolocation è dichiarato nel manifest
  e quindi protetto in automatico. Restano da verificare le librerie interne: Google Play Services
  Location, l'SDK Android di PostHog, Play Core (app-update). Mitigazione: full mode spenta e test
  su device della release di camminiditalia, che le usa tutte e tre, compresi i malfunzionamenti
  senza crash che Android vitals non vedrebbe; `-keep` mirati se serve
- **Crash in produzione dopo la pubblicazione**: la prima release con R8 è camminiditalia, con
  rilascio graduale su Play e controllo dei crash in Android vitals. Tornare indietro **non è
  immediato**: il `versionCode` viene dalla versione del `package.json` della root, e Play rifiuta
  un AAB con un `versionCode` già caricato. Il ritorno indietro è: fermare il rilascio su Play, poi
  una patch release con release-please compilata con `--skip-r8`. Gli utenti che hanno già ricevuto
  la build restano su quella finché la patch non è pubblicata, quindi per giorni: il rilascio
  graduale limita quanti sono
- **Build R8 fallita scambiata per riuscita**: nel flusso reale la release la compila Android
  Studio, che mostra l'esito di Gradle; i task gulp `build-android-bundle` e `build-android-apk`,
  che ignorano il codice di uscita di Gradle, non sono usati
- **Stack trace illeggibili**: il `mapping.txt` viaggia dentro l'AAB
  (`BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map`, verificato) e Play Console
  lo usa da sé. Quello locale viene sovrascritto alla
  build successiva, ma R8 è deterministico e le versioni delle librerie native sono fisse: per
  ritrovare il mapping di una versione basta rifarne la build dal tag della release, con i
  submodule allineati, le dipendenze installate con `npm ci` e lo stesso JDK major

## Out of scope

- `shrinkResources`: riduce le risorse dell'APK, non conta per il punteggio DEX, ed è il punto in
  cui i plugin che cercano risorse per nome si rompono più spesso
- R8 in full mode: si potrà valutare dopo che la modalità compatibile è stabile in produzione
- Pubblicazione delle altre app: riceveranno R8 alla loro prossima build normale
- Verifica che l'avviso sparisca dalla Dashboard di Play Console: si guarda al primo rilascio di
  camminiditalia, non chiude questo ticket
- Caricamento automatico dell'AAB o del `mapping.txt` su Play, e archiviazione del `mapping.txt`
- I task gulp `build-android-bundle`, `build-android-apk` e `build-android-apk-debug`: non sono usati
  per le release, e restano come sono

## Moduli toccati

Tutto nel repo `webmapp-app`, nessun submodule.

- `gulpfile.js`: opzione `skipR8` in yargs; `_updateAndroidFiles()` (sostituzioni nel
  `build.gradle` di release, `fullMode=false` in `gradle.properties`, copia di
  `proguard-rules.pro`)
- `scripts/android-r8.js` e `scripts/android-r8.test.js`: nuovi, le trasformazioni testate;
  `package.json` (root): script `test:gulp`
- `resources/android/proguard-rules.pro`: nuovo, versionato
- `docs/knowledge/gulp-e-build-native.md` e `.claude/rules/gulp-e-risorse.md`: R8, `--skip-r8`,
  come rifare la build per ritrovare il `mapping.txt`
