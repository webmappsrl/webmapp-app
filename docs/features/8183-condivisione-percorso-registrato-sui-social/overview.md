> Ticket: oc:8183

# Condivisione percorso registrato sui social (stile Strava) — orchestrazione semplificata (repo principale)

## Cosa cambia
- **`core/src/app/services/share.service.ts` drasticamente semplificato**: al tap "Condividi", l'app chiama il backend passando **solo lo `uuid`** della `UgcTrack` — nessuno screenshot, nessuna statistica calcolata lato client, nessun `app_id`. Il backend fa tutto (vedi overview `wm-package`): risolve la traccia, calcola le statistiche, genera la mappa, compone l'immagine finale, la persiste, genera l'URL della pagina pubblica.
- **Nessun plugin nativo custom**: si usa `@capacitor/share` (`Share.share({url, files, text})`), già dipendenza esistente nel repo — nessun codice Swift/Kotlin da scrivere/mantenere.
- **Nessuna generazione mappa lato client**: `map-core` non è più coinvolto in questa feature (il componente mini-map isolato, con tutti i problemi di `crossOrigin`/WKWebView incontrati, è stato eliminato insieme a questo approccio).
- **Nessuna configurazione Facebook App ID**: non essendoci più un intent nativo Meta da invocare, questo prerequisito esterno (registrazione Meta Business, coordinamento bundle ID) non serve più.
- L'app riceve dal backend `{image, shareUrl}` e invoca `Share.share({url: shareUrl, files: [image scaricata su cache locale], text})` — ogni app di destinazione (Instagram, Facebook, WhatsApp, ecc.) usa quello che sa gestire: le app "Stories" tendono a usare l'immagine allegata, i canali di messaggistica il link con anteprima OG (vedi overview `wm-package` per la pagina pubblica).

## Perché
Il cliente vuole condividere un percorso "come fa Strava". Il primo approccio (plugin nativo custom per l'intent diretto Instagram/Facebook Stories) si è rivelato bloccato da un problema di WKWebView su iOS (fallimento del caricamento tile anche dopo aver eliminato la dipendenza da `crossOrigin`, causa non completamente isolata nonostante diversi tentativi di fix mirati). Il developer ha scelto di **ridurre drasticamente la complessità tecnica**: usare il meccanismo di condivisione generico già esistente e affidabile (`@capacitor/share`), accettando un'esperienza leggermente meno "one-tap" su iOS (l'utente potrebbe dover scegliere manualmente "Aggiungi alla storia" dentro Instagram) in cambio di eliminare interamente il codice nativo custom e la sua superficie di bug.

## Requisiti
- [ ] Nuovo metodo in `share.service.ts`: chiama `POST /api/share-story-image` con `{uuid}`, riceve `{image, shareUrl}` (formato risposta esatto da definire in `plan.md` — binario+header con URL, o JSON con entrambi i campi)
- [ ] Salvataggio temporaneo dell'immagine ricevuta su cache locale (`@capacitor/filesystem`, già dipendenza esistente, stesso pattern già usato altrove nel repo) per poterla passare a `Share.share({files: [...]})`
- [ ] Chiamata a `Share.share({url: shareUrl, files: [uri locale], text})`
- [ ] Errore chiaro con retry esplicito — molto più semplice da gestire ora che c'è una sola chiamata di rete, non tre step indipendenti
- [ ] Wiring `(share-track)`/`[shareResult]` su `<wm-ugc-track-properties>` in `map.page.ts`/`.html` — il contratto verso wm-core resta lo stesso (vedi overview `wm-core`), cambia solo cosa succede internamente a `share.service.ts`

## Rischi
- **Esperienza meno diretta su iOS**: `Share.share()` generico su iOS non apre sempre Instagram/Facebook direttamente nel composer Stories — l'utente potrebbe dover fare un passaggio manuale in più dentro l'app scelta. Rischio accettato esplicitamente per eliminare la complessità/fragilità del plugin nativo custom.
- **Dipendenza di rete ad ogni condivisione**: nessun caching lato client, ogni tap richiede una chiamata di rete riuscita.
- **Nessuna telemetria di conversione**: non c'è modo di sapere se l'utente ha effettivamente pubblicato dopo aver aperto il composer — se serve, valutare un evento PostHog lato client (pattern già in uso, oc:8127), fuori scope se non richiesto esplicitamente.

## Out of scope
- Plugin nativo Capacitor custom (Swift/Kotlin) — approccio scartato, vedi "Perché"
- Generazione/cattura screenshot mappa lato client — spostata interamente al backend (vedi overview `wm-package`)
- Configurazione Facebook App ID — non più necessaria
- Condivisione su altri social (Twitter/X, TikTok, ecc.)

## Moduli toccati
- `core/src/app/services/share.service.ts`
- `core/src/app/pages/map/map.page.ts` / `.html` (wiring invariato nello spirito)
