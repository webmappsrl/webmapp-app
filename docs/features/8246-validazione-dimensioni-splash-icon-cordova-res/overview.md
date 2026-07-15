> Ticket: oc:8246

# Gulp non genera icone/splash Android se lo splash caricato da backend è sotto le dimensioni minime

## Cosa cambia
In `gulpfile.js`, dentro `updateResources(instanceName, platform)` (riga 608), subito prima di ogni invocazione di `cordova-res` per la piattaforma richiesta, viene aggiunta una validazione delle dimensioni di `icon.png`, `notification_icon.png` e `splash.png` già scaricati in `instances/<name>/resources/` da `update()` (tramite `sharp`, già presente come dipendenza transitiva nel progetto).

**Nota sulla collocazione:** la validazione non può stare in `update()` (dove i file vengono scaricati) perché quella funzione è platform-agnostic — viene eseguita una sola volta indipendentemente dalla piattaforma target, senza mai ricevere `'android'`/`'ios'` come parametro. Le soglie invece sono platform-specific (vedi sotto), quindi la validazione deve stare in `updateResources()`, che riceve già `platform` ed è il punto immediatamente precedente alla chiamata di `cordova-res` — coerente con la nota dev originale ("validare... prima di invocare cordova-res").

**Icona, notification_icon e splash hanno lo stesso identico comportamento** (deciso esplicitamente dal dev dopo aver osservato in test manuale un'inconsistenza — vedi `notes.md`): nessuna delle tre blocca mai la build in automatico. Sotto soglia minima → warning esplicito da terminale + prompt interattivo (`readline` nativo, nessuna nuova dipendenza) che chiede se continuare comunque senza quella risorsa:
  - Android icon/notification_icon: soglia 512×512px (uso soglia di sicurezza **1024×1024px**, sopra il minimo tecnico); iOS icon: 1024×1024px
  - Android splash: **1920×1920px**; iOS splash: **2732×2732px**
  - risposta "sì" → la build prosegue: quella specifica risorsa non viene generata (resta quella esistente/di default), le altre due vengono generate normalmente se valide
  - risposta "no" → la build si interrompe
  - se `process.stdin.isTTY` è `false` (nessun terminale interattivo disponibile) → la build si interrompe automaticamente, fail-safe, nessun prompt
  - **escape hatch**: flag `--skip-resource-validation` per bypassare la validazione di tutte e tre le risorse in scenari di emergenza (es. release urgente bloccata da un problema lato backend non ancora risolto); il flag logga sempre un warning ben visibile quando usato
- **Aspect ratio non 1:1**: solo warning informativo, **non bloccante**, per tutte e tre le risorse — cordova-res non richiede il quadrato (verificato nel sorgente, vedi sotto), quindi non genera prompt
- **File scaricato non è un'immagine valida** (es. pagina di errore HTML per un 404 lato backend): la lettura `sharp().metadata()` è wrappata in un try/catch dedicato che produce un errore esplicito e distinto da quello di "dimensioni insufficienti"
- **Fix architetturale necessario**: `icon.png`, `notification_icon.png` e `splash.png` vengono generati con **tre invocazioni `cordova-res` separate e indipendenti** (`--type icon` per le due icone, `--type splash` per lo splash), ciascuna eseguita solo se quella specifica risorsa è "usabile" (valida, o validazione bypassata). Necessario perché `cordova-res` fa fallire l'**intera invocazione** se anche una sola risorsa richiesta non supera la sua validazione interna (verificato empiricamente, vedi `notes.md`) — con un'unica chiamata combinata, una risorsa invalida impedirebbe la generazione anche delle altre due, valide
- **Fix collaterale**: il task `build-android` (riga 1944-1951) ignora oggi silenziosamente qualsiasi errore di `buildAndroid()` (nessun log, nessun exit code non-zero) — allineato al pattern già corretto di `build-ios` (`abort(err)`), altrimenti la validazione risulterebbe invisibile proprio sulla piattaforma Android

La validazione si applica sia a `buildAndroid` che a `buildIos`, perché entrambe condividono la stessa funzione `updateResources()`.

## Perché
La build Android per l'istanza carg falliva silenziosamente nella generazione di icone/splash perché lo `splash.png` caricato sul backend era sotto le dimensioni minime richieste da `cordova-res`. Il problema veniva scoperto solo ispezionando le risorse già generate in Android Studio (che legge risorse già generate localmente, senza riscaricare nulla), senza nessun segnale di errore durante la build gulp.

**Nota di correzione rispetto al ticket (verificata due volte sul sorgente):** la nota dev indicava 1920×1920px come soglia minima per lo splash Android — è **corretta**. Una prima verifica sul solo README di `cordova-res` (righe 25-26) aveva suggerito erroneamente 2732×2732px come soglia universale; approfondendo nel sorgente reale (`core/node_modules/cordova-res/dist/resources.js`, funzione `getRasterResourceSchema`, righe 63-123) risulta che i requisiti sono **specifici per piattaforma**:

| Piattaforma | Tipo | Minimo richiesto |
|---|---|---|
| Android | icon | 512×512 |
| Android | splash | 1920×1920 |
| iOS | icon | 1024×1024 |
| iOS | splash | 2732×2732 |

La funzione di validazione di cordova-res (`validateRasterResource`, righe 27-49) controlla solo `width < requiredWidth \|\| height < requiredHeight` — **nessun controllo di aspect ratio/quadratura** nel codice reale, quindi un mismatch di aspect ratio non causa un errore lato cordova-res.

## Requisiti
- [x] Validare le dimensioni di `icon.png`, `notification_icon.png` (Android ≥1024×1024px, iOS ≥1024×1024px) e `splash.png` (Android ≥1920×1920px, iOS ≥2732×2732px) subito prima di ogni invocazione `cordova-res` in `updateResources()`
- [x] Comportamento identico per tutte e tre le risorse: sotto soglia → warning esplicito da terminale e conferma interattiva (prompt y/n via `readline` nativo) se continuare comunque senza quella risorsa
- [x] Sopra soglia ma aspect ratio non 1:1: solo warning informativo, nessun prompt bloccante (per tutte e tre le risorse)
- [x] Risposta "no" al prompt → abortire la build con errore
- [x] Risposta "sì" al prompt → proseguire la build: quella risorsa non viene generata (cordova-res non viene invocato per quella specifica risorsa), le altre due vengono generate normalmente se valide
- [x] Se `process.stdin.isTTY` è `false` → abortire automaticamente in caso di risorsa sotto soglia (nessun prompt possibile, fail-safe)
- [x] Aggiungere flag `--skip-resource-validation` per bypassare la validazione di tutte e tre le risorse, con warning esplicito quando usato
- [x] Se il file scaricato non è un'immagine valida (errore di parsing `sharp`), produrre un messaggio d'errore distinto da quello di "dimensioni insufficienti" (es. possibile 404/errore backend)
- [x] `icon.png`, `notification_icon.png` e `splash.png` generati con tre invocazioni `cordova-res` separate (`--type icon` / `--type splash`), pienamente indipendenti tra loro
- [x] La validazione si applica sia a `buildAndroid` che a `buildIos` (stessa funzione `updateResources()`), con soglie platform-specific
- [x] Allineare il task `build-android` (riga 1927-1952) al pattern di `build-ios`: aggiungere `abort(err)` nel branch di errore, altrimenti gli errori di validazione restano invisibili
- [x] Documentare in `notes.md` il punto 2 del ticket (dependency `notification_icon.png`/`icon.png` per lo shard carg) come debito tecnico annotato, non implementato in questo ciclo

## Rischi
Emersi dalla Fase: challenge, con relativa gestione:

- **Pipeline headless futura bloccata senza via di escape** — mitigato con il flag `--skip-resource-validation`
- **Icona valida non generata quando lo splash è invalido e l'utente sceglie di proseguire** (bug trovato in test manuale) — mitigato: icona, notification_icon e splash generati con tre invocazioni `cordova-res` separate e pienamente indipendenti, invece di una singola invocazione combinata che falliva per intero se anche una sola risorsa non era valida
- **`notification_icon.png` fuori dal perimetro di validazione** — mitigato: incluso nei requisiti con la stessa soglia icona
- **File scaricato non è un'immagine valida** (404/errore backend) → eccezione `sharp` fuorviante — mitigato: messaggio d'errore dedicato e distinto
- **Task `build-android` ignora silenziosamente gli errori** — mitigato: allineato a `build-ios` con `abort(err)`
- **Aspect ratio come gate bloccante avrebbe causato "alert fatigue"** — mitigato: reso solo warning informativo, non bloccante (confermato che cordova-res non lo richiede)

Rischi noti e **accettati consapevolmente** (nessuna modifica di codice in questo ciclo):
- **Altri shard oltre carg non auditati** — non sappiamo se altre istanze hanno già uno splash/icon sotto soglia; la prima build successiva al deploy di questa feature potrebbe bloccarsi a sorpresa (mitigato parzialmente dal flag `--skip-resource-validation` e dal fatto che ora anche l'icona chiede conferma invece di bloccare sempre)
- **5 download separati di `icon.png`** (righe 462-466 di `gulpfile.js`) non garantiti byte-identici tra loro in caso di deploy concorrente sul backend — edge case raro
- **`splash-dark.png` mai validato** — oggi non è usato da `cordova-res` (nessuna sorgente dark-mode configurata), gap innocuo allo stato attuale
- **Nessun timeout sul prompt readline** — se lo sviluppatore si allontana con terminale interattivo aperto, la build resta in attesa indefinita (accettabile: nessun uso CI/headless oggi)
- **Stato parzialmente scaricato su abort** — se la validazione fa fallire una promise in `Promise.all`, altri download possono comunque completare e scrivere file su disco prima del reject complessivo; nessuna pulizia automatica introdotta in questo ciclo
- **`sharp` resta dipendenza transitiva non dichiarata** in `package.json` — stesso debito già noto e documentato per `downloadProfileImage()` (oc:7480); questa feature aumenta il numero di punti che dipendono silenziosamente da questa transitiva

## Out of scope
- Punto 3 del ticket (validazione dimensioni a monte, nel backend `wm-package`, al momento dell'upload) — spostato su ticket separato **oc:8247**
- Punto 2 del ticket (dependency `notification_icon.png`/`icon.png` per lo shard carg) — solo annotato come debito tecnico, nessuna modifica al codice in questo ciclo
- Audit sistematico di tutti gli shard esistenti in `instances/*` per verificare se hanno già splash/icon sotto soglia
- Nessuna modifica alla UI dell'app runtime — questa feature riguarda esclusivamente il tool di build (`gulpfile.js`), non l'app Angular/Ionic
- Nessuna modifica a `config.json` o al backend Geohub/wm-package

## Moduli toccati
- `gulpfile.js` (root del repo `webmapp-app`) — funzioni `update()` (righe 362-551), `updateResources()` (righe 608-687), task `build-android` (righe 1927-1952)
