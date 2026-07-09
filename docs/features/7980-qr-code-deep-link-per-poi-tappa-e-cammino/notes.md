> Ticket: oc:7980

# Notes — QR code deep link per poi, tappa e cammino (repo principale)

## Deviazioni dal piano

- **Cold-start guard semplificato**: il piano iniziale prevedeva un guard su `isConfLoaded$` **e** sulla prima `NavigationEnd`. In fase di implementazione si è verificato che non esiste nessun precedente d'uso di `NavigationEnd` nel repo, e che non serve: `isConfLoaded$` da solo copre sia cold start (aspetta che sia `true`) sia warm start (emette subito se già `true`), perché è un selettore NgRx con valore corrente sempre disponibile. Rimosso il riferimento a `NavigationEnd` da `app.component.ts` e da `overview.md`.
- **Deploy `.well-known` spostato da CI a manuale una tantum**: l'idea iniziale era un step in `deploy_prod.yml` che rigenerava e caricava i file ad ogni deploy. Il contenuto è statico (non dipende da variabili di build) e riguarda solo `camminiditalia` in questo ciclo — un'automazione CI avrebbe aggiunto un punto di fallimento nella pipeline di produzione per qualcosa che va bene fare a mano quando il registro cambia. Rimosso lo step da `deploy_prod.yml`, sostituito da `gulp generateWellKnown` + upload manuale via scp.
- **Generazione `.well-known` estesa a registro multi-istanza**: emerso durante l'esecuzione che tutte le istanze condividono lo stesso file fisico (stesso dominio wildcard `*.webmapp.it`, stesso deploy `wm-webapp`) — non è possibile avere "il file di camminiditalia" isolato. Introdotto `deep-links.json` (registro, root repo) + task Gulp `generateWellKnown` che aggrega tutte le entry, invece di generare un file specifico per una singola istanza.
- **Campo `packageName` opzionale aggiunto al registro**: su richiesta, per i rari casi in cui il package name Android sia diverso dal bundle id iOS. Se assente, `bundleId` vale per entrambe le piattaforme (comportamento originale, comune con Capacitor).
- **Scope ampliato da "solo `/map`" a "tutto il dominio"**: la versione iniziale limitava deep link/intent-filter/entitlements al path `/map`. Su richiesta esplicita, rimossa la restrizione:
  - `apple-app-site-association`: `paths` da `['/map', '/map?*']` a `['*']` (sintassi Apple per "tutti i path")
  - Intent-filter Android: rimosso `android:pathPrefix="/map"` dal `<data>` tag — matcha ora l'intero host
  - Vedi `overview.md` → Rischi per il tradeoff accettato (qualunque link al dominio, anche pagine senza equivalente nell'app, tenta di aprire l'app nativa)
- **Documentazione registro spostata da JSON a file separato**: prima tentativo di documentare i campi di `deep-links.json` con un campo `_readme` dentro il file stesso (workaround per la mancanza di commenti in JSON, con relativo filtro in `generateWellKnown()`). Scartato per mantenere il file puramente dati — documentazione spostata in `deep-links.README.md`.

## Bug trovati

Nessun bug nel codice scritto in questo ciclo. Un comportamento non ovvio scoperto durante il test su device reale (Pixel 9 Pro XL, Android 16):

- **La verifica App Links su Android non riflette immediatamente le modifiche ad `assetlinks.json`**: dopo aver aggiornato il file sul server con un secondo fingerprint (per testare una build locale) e forzato `adb shell pm verify-app-links --re-verify`, lo stato restava a `1024` (fallimento) anche con il file server-side corretto e raggiungibile. Interrogando direttamente l'API pubblica di Google (`https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=...`) è emerso un campo `maxAge` di ~2221s (~37 minuti) e un contenuto ancora non aggiornato (mancava il secondo fingerprint appena aggiunto) — la verifica dipende (almeno in parte) da un'infrastruttura Google con cache propria, non da un fetch immediato dal device. Vedi `overview.md` → Rischi e `instructions.md` per il dettaglio.
- Test isolato che invece ha confermato il funzionamento del codice: forzando manualmente lo stato a `verified` via `adb shell pm set-app-links` (bypass della verifica automatica, solo per testing) e lanciando `adb shell am start -a android.intent.action.VIEW -d "https://1.camminiditalia.webmapp.it/map?track=1026"`, l'intent è stato risolto correttamente da `it.webmapp.cammini` (confermato da `dumpsys activity`/`dumpsys package`) — la catena intent-filter → `handleDeepLink()` → navigazione funziona; il problema riscontrato è solo nella propagazione della verifica automatica, non nel codice della feature.

## Decisioni

- **`resolveInstanceDomain()` (gulpfile.js) riusa `getJsonEnvironment()` esistente** invece di reimplementare il calcolo del dominio da zero — stessa fonte dati (`shards`/`redirects` di wm-types) usata a runtime da `EnvironmentService._assignShareLink()`, non due formule indipendenti.
- **Fingerprint SHA256 Android preso dalla "Chiave di firma dell'app" (Play App Signing)**, non dal keystore locale di upload — confermato che `camminiditalia` usa Play App Signing (Play Console → Integrità dell'app → Protezione del Play Store).
- **`.well-known` generato da Gulp ma caricato a mano**, non automatizzato in CI — vedi Deviazioni sopra.
- **`CODE_SIGN_ENTITLEMENTS` iniettato in `project.pbxproj`** in aggiunta al file `.entitlements` — senza questo riferimento l'entitlement non ha effetto lato firma/capability (verificato leggendo la struttura del pbxproj generato da Capacitor).

## Follow-up

- Verificare che il DNS/hosting di `{appId}.{shardName}.webmapp.it` sia effettivamente attivo (test diretto durante questo ciclo non ha trovato un record risolvibile) — prerequisito bloccante per il test end-to-end, indipendente da questa feature. **Aggiornamento**: in un test successivo con device reale il dominio risultava raggiungibile (200 su entrambi i file `.well-known`) — il problema DNS iniziale potrebbe essere stato transitorio o specifico all'ambiente sandbox usato per il primo test, non un blocco reale.
- Popolare `deep-links.json` con le altre istanze (`carg`, `osm2cai`) quando/se richiesto — il meccanismo è generico e pronto, manca solo bundle id + fingerprint reali di quelle istanze.
- Se in futuro serve restringere di nuovo il deep link a path specifici (invece di tutto il dominio), vedi `instructions.md` → "Nota: perché tutto il dominio" per cosa modificare.
- Rimuovere il fingerprint di test locale (`A6:E2:12:0F:49:1A:E7:AA:D9:91:7F:E9:DA:D5:B6:6E:7B:09:B7:A8:84:9B:78:C7:9C:FA:93:B3:6B:90:2B:56`) da `deep-links.json`/`assetlinks.json` prima di considerare la feature production-ready — aggiunto solo per testare una build locale (Android Studio "Run"), non è la chiave di firma reale.
