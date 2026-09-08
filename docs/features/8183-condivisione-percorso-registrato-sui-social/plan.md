> Ticket: oc:8183

# Piano implementativo — plugin nativo e orchestrazione (repo principale)

Riferimento: `overview.md` in questa stessa cartella. Dipende dal contratto d'output del componente mini-map (`map-core`) e dall'endpoint di compositing (`wm-package`) — implementare quei due repo per primi, o quantomeno concordare i contratti (formato immagine, campi statistiche) prima di questo.

## Task

1. **Scaffold pacchetto Capacitor locale** in `core/capacitor-plugins/wm-social-story-share/` — struttura standard (`package.json` con manifest Capacitor, `ios/`, `android/`, `src/` con interfaccia TS del plugin).
   `feat(oc:8183): scaffold pacchetto Capacitor locale wm-social-story-share`

2. **Dependency `file:`** verso il plugin locale in `core/package.json` — verificare che `npm install` lo risolva correttamente nell'istanza copiata prima di procedere con l'implementazione nativa.
   `feat(oc:8183): registra il plugin locale come dependency in core/package.json`

3. **Implementazione nativa iOS (Swift)**: metodi `shareToInstagramStories`/`shareToFacebookStories`, `UIPasteboard` con le chiavi documentate da Meta (`com.instagram.sharedSticker.backgroundImage`, equivalenti Facebook), controllo `canOpenURL` per `instagram-stories://`/`facebook-stories://` prima di invocare. Aggiungere le entry `LSApplicationQueriesSchemes` necessarie (`instagram-stories`, `instagram`, `facebook-stories`, `facebook`) — verificare dove va il template Info.plist per questo plugin dato che i progetti nativi sono generati per-istanza (vedi task 8).
   `feat(oc:8183): implementazione nativa iOS per share Instagram/Facebook Stories`

4. **Implementazione nativa Android (Kotlin)**: intent equivalenti (`com.instagram.share.ADD_TO_STORY`, intent Facebook Stories analogo), con i dati passati come richiesto dalle rispettive API. Dichiarare le `<queries>` di package visibility (Android 11+) per `com.instagram.android`/`com.facebook.katana` nel template AndroidManifest — stesso discorso del punto precedente su dove vive il template per-istanza.
   `feat(oc:8183): implementazione nativa Android per share Instagram/Facebook Stories`

5. **Rilevamento app non installata → fallback**: se `canOpenURL`/il controllo Android fallisce, richiamare il generico `Share.share()` già esistente — nessun crash, nessun errore silenzioso.
   `feat(oc:8183): fallback a Share.share() generico se app non installata`

6. **Estensione `share.service.ts`**: orchestrare — richiesta screenshot al componente mini-map (`map-core`) → calcolo statistiche percorso (tempo, km, dislivello — verificare se già disponibili in `properties`/derivabili da servizi esistenti tipo `GeoutilsService` usato in oc:8177, non ricalcolare da zero) → upload screenshot+statistiche all'endpoint di compositing (`wm-package`, coordinare formato payload/risposta con quel piano) → invocazione plugin nativo con l'immagine finale ricevuta. Gestione errore esplicita con retry su ciascuno dei tre step (screenshot, rete, plugin).
   `feat(oc:8183): orchestrazione flusso condivisione in share.service.ts`

7. **Config Facebook App ID**: nuovo file (`instances/facebook.json` o simile, gitignored). Decisione pragmatica per questo ciclo: file condiviso (stesso pattern di `posthog.json`, un solo App ID Meta riusato per tutte le istanze) — da rivedere se in futuro emerge la necessità di isolamento per-istanza (dipende da come il cliente configura l'account Meta Business, fuori dal controllo di questo sviluppo). Validazione in `gulpfile.js` prima della build (stesso pattern `validatePosthogConfig`).
   `feat(oc:8183): config Facebook App ID validata nel gulpfile`

8. **Verificare il meccanismo di template per Info.plist/AndroidManifest per-istanza**: il repo ha già logica che modifica questi file dopo `cap add`/`cap copy` (vedi `gulpfile.js` righe ~1611-1680 per iOS, pattern analogo Android in oc:7294 `manageAndroidPermissions`) — le nuove entry (query schemes iOS, package visibility Android) vanno aggiunte seguendo lo stesso meccanismo esistente, non con un nuovo step separato scoordinato.
   `feat(oc:8183): dichiarazioni Info.plist/AndroidManifest per URL scheme e package visibility`

9. **Test manuale su device reali** (iOS + Android, con e senza Instagram/Facebook installati): verificare che il composer Stories si apra con l'immagine corretta, verificare il fallback quando le app non sono installate. Documentare il piano di test esplicitamente, dato che non esiste copertura CI per questo codice nativo.
   `test(oc:8183): piano di test manuale device reali iOS/Android`
