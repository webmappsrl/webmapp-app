> Ticket: oc:8702

# Passaporto: condivisione della tappa percorsa

Figlio di oc:8166. Riferimenti visivi: vista 3 e vista 4 di
[docs/features/passaporto-camminatore-wireframe.html](../passaporto-camminatore-wireframe.html) e il
mockup del cliente `mockup-app.png` (cartella Drive `1OHscIxWg0OTrsO6opJ-15WChwEEC-d_i`).

Il lavoro è **misto** e tocca cinque repo. Ognuno ha il proprio `overview.md` con lo stesso slug,
limitato alla sua parte; questo è il documento d'insieme.

| Repo | Parte |
|---|---|
| `camminiditalia` (backend) | campi nuovi in `/api/layer/{layer}/progress`, endpoint dell'immagine, tabella delle condivisioni, pagina pubblica |
| `wm-package` (submodule di `camminiditalia`) | metodo generico di `MapRenderService` per più tracciati con stili diversi |
| `wm-types` | campi opzionali nuovi in `PassportStage` |
| `wm-core` | servizio di condivisione spostato qui, traduzioni, pagina della tappa arricchita, pulsante «Condividi» |
| `webmapp-app` | `ShareService` ridotto a facciata che delega a `wm-core` |

## Cosa cambia

La pagina della tappa del passaporto (`wm-passport-stage-detail`, nella modale del passaporto) resta
una pagina separata, ma si allinea alla vista 3: mostra la foto della tappa, la distanza, il
dislivello positivo e negativo, il chip di stato e, sulle tappe percorse, il pulsante «Condividi».

Il pulsante chiede al backend un'immagine in formato storia (1080×1920) costruita sul mockup del
cliente e la passa alla condivisione di sistema, insieme al link di una pagina pubblica dedicata
alla tappa condivisa. Sul web la condivisione si fa in due tocchi, e dove il browser non sa
condividere file l'immagine viene scaricata.

## Perché

Il cliente (Cammini d'Italia) vuole che il camminatore possa pubblicare sui social la tappa che ha
percorso, con un'immagine riconoscibile del cammino. La pagina della tappa fatta in oc:8676 aveva
lasciato fuori la condivisione e i dati tecnici della traccia.

## Requisiti

**Backend (`camminiditalia`)**

- [ ] `/api/layer/{layer}/progress` aggiunge per ogni tappa, quando presenti: `ref`, `from`, `to`,
      `ascent`, `descent`, la miniatura della `feature_image` della traccia, e `shareable: true`
      sulle tappe validate per l'utente. I campi esistenti non cambiano.
- [ ] Tabella nuova `passport_stage_shares`: `uuid` generato alla creazione, `user_id`,
      `layer_id`, `ec_track_id`, `snapshot` JSON, unica per (utente, tappa). L'immagine sta in una
      media collection `share_image` di tipo `singleFile`: ricondividere la stessa tappa aggiorna
      la stessa riga e la stessa immagine.
- [ ] Endpoint nuovo autenticato, es. `POST /api/layer/{layer}/stage/{track}/share-image`: risponde
      solo se la tappa appartiene al layer ed è validata per l'utente, altrimenti 403/404. Legge la
      lingua da `Accept-Language`, con l'italiano come ripiego. Restituisce `image_url` e
      `share_url`.
- [ ] Pagina pubblica `GET /share/passport-stage/{uuid}` con meta Open Graph (`og:image` è
      l'immagine generata). Mostra solo lo snapshot salvato alla condivisione — cammino, tappa,
      partenza, arrivo, lunghezza, dislivello, data — e un link all'app. Nessun nome dell'utente,
      nessun id interno.
- [ ] Immagine 1080×1920, generata sempre dal backend, dall'alto in basso:
      - sfondo beige con curve di livello, come nel mockup del cliente;
      - logo del cammino in un cerchio bianco, omesso se il cammino non lo ha;
      - nome del cammino;
      - mappa in un riquadro con cornice arancione: inquadratura centrata sulla tappa con un
        margine di circa il 30%; la tappa in giallo, spessa, con bordo bianco; il resto del cammino
        in rosso sottile al 70% di opacità, sotto la tappa; marker di partenza e di arrivo;
        nessuna etichetta sulle altre tappe;
      - «Tappa {ref}» se `ref` c'è, altrimenti il nome della tappa;
      - partenza, arrivo, lunghezza; dislivello positivo solo se presente. **Il tempo non
        compare**: per le tappe validate non esiste;
      - logo di Cammini d'Italia in fondo.
- [ ] Un dato mancante (partenza, arrivo, dislivello) toglie la sua voce, senza etichette vuote.
- [ ] Testi lunghi: ogni campo ha un riquadro fisso; il testo va a capo fino a due righe, poi riduce
      il corpo fino a un minimo, poi tronca con «…». Un test compone l'immagine con i testi più
      lunghi del database e con le etichette in tedesco.
- [ ] La mappa si disegna con il metodo generico nuovo di `MapRenderService` (`wm-package`); il
      layout dell'immagine della tappa si compone in `camminiditalia` con Intervention Image.

**`wm-package`**

- [ ] `MapRenderService` espone un metodo pubblico generico (es. `renderLayers`) per più tracciati,
      ciascuno con colore, spessore, opacità ed eventuale bordo, più marker e un'inquadratura scelta.
      `render(UgcTrack …)` ne diventa un involucro con firma e risultato invariati.
- [ ] I test esistenti di `MapRenderService`, `StoryShareImageService`, `ShareStoryImageController`
      e della pagina pubblica UGC passano senza modifiche; test nuovi coprono il metodo generico.

**Tipi (`wm-types`)**

- [ ] `PassportStage` acquista i campi opzionali `ref`, `from`, `to`, `ascent`, `descent`, `image`,
      `shareable`.

**Frontend (`wm-core`, `webmapp-app`)**

- [ ] Prima di spostare qualunque cosa, test di caratterizzazione di
      `ShareService.shareTrackToStories` sul codice attuale: traccia non sincronizzata, richiesta
      già in corso, successo, errori 404/403/422, annullamento della condivisione nativa. Dopo lo
      spostamento devono passare senza modifiche.
- [ ] In un servizio di `wm-core` va solo la parte comune: POST, download dell'immagine,
      `Share.share()`. Guardia sulle richieste in corso e messaggi d'errore restano specifici di
      ciascun chiamante; i messaggi UGC non cambiano.
- [ ] Il servizio di `wm-core` non legge chiavi dell'app: le traduzioni di `services.share` si
      spostano in `wm-core`, con la chiave in italiano (`'Hai visto questo percorso?'`, …), in tutte
      le lingue. Le chiavi vecchie nell'app si rimuovono solo dopo aver verificato che nessuno le
      usa più.
- [ ] `ShareService` dell'app resta come facciata e `shareTrackToStories` mantiene firma e
      comportamento.
- [ ] `PassportService` mappa i campi nuovi di `progress` e chiama l'endpoint dell'immagine con
      `Accept-Language`, riusando l'helper già esistente.
- [ ] La pagina della tappa mostra la miniatura della `feature_image`, la distanza, il dislivello
      positivo e negativo; ogni voce assente sparisce. Senza `feature_image`, o senza rete, il blocco
      della foto non compare e il titolo sale in cima.
- [ ] «Condividi» compare solo sulle tappe con `shareable: true`. Il campo arriva solo dal backend
      nuovo, e il backend può spegnere il pulsante su tutte le app installate smettendo di mandarlo.
- [ ] Nativo: un tocco genera l'immagine e apre la condivisione di sistema.
- [ ] Web: il primo tocco genera l'immagine; a immagine pronta il pulsante diventa «Condividi ora»
      e il secondo tocco chiama `navigator.share` con il file già in memoria. Se il browser non sa
      condividere file, o la condivisione fallisce, l'immagine si scarica da un `Blob` locale.
      Niente `Filesystem.downloadFile` sul web.
- [ ] Testi della tappa: messaggi d'errore propri (`'Non è stato possibile creare l\'immagine della
      tappa'`, `'Questa tappa non risulta più percorsa'` per 403/404) e titolo della condivisione
      propri, tradotti in it, en, de, es, fr, pr, sq con la chiave in italiano. Si riusano le chiavi
      esistenti (`'Condividi'`, `ascent`, `descent`, `from`, `to`, `'Lunghezza'`).
- [ ] [UX] «Condividi» ha un'etichetta testuale accanto all'icona e un'area di tocco di almeno
      44×44px.
- [ ] [UX] Durante la generazione dell'immagine il pulsante mostra uno spinner ed è disabilitato.
- [ ] [UX] Se la generazione fallisce compare il messaggio d'errore e il pulsante torna attivo.

## Rischi

- **Regressione silenziosa della condivisione UGC.** `ShareService` non ha nessuno spec, e lo
  spostamento in `wm-core` arriva anche a `wm-webapp`. Mitigazione: test di caratterizzazione scritti
  prima dello spostamento; nel servizio condiviso va solo la parte comune.
- **Sul web la condivisione di sistema scade.** `navigator.share` vale solo per pochi secondi dopo
  il tocco, meno di quanti ne servano a generare l'immagine. Mitigazione: due tocchi, download come
  ripiego.
- **CORS del disco media.** `image_url` sta sul disco `wmfe`, su un dominio diverso dall'app web:
  scaricarla come `Blob` richiede il CORS configurato. Prerequisito da verificare prima del ramo web.
- **Ordine di rilascio obbligato.** Prima il merge di oc:8676 nel backend (PR ancora da fare, scrum
  del 05/10), poi `wm-package` e il suo bump in `camminiditalia`, poi il backend di oc:8702 e il suo deploy, poi `wm-types`, `wm-core`, i puntatori
  nell'app, infine il rilascio. Il pulsante legato a `shareable` evita che un'app uscita prima del
  backend mostri un pulsante rotto.
- **`wm-package` è condiviso da tutti i backend.** Il metodo generico di `MapRenderService` tocca il
  disegno della mappa della condivisione UGC. Mitigazione: `render(UgcTrack …)` invariato e i test
  esistenti come rete.
- **Branch del backend.** Parte da `feature/oc-8676-…` e va ribasato su `develop` dopo il merge di
  oc:8676.
- **`ref` non compilato.** L'immagine mostra il nome della tappa: è il ripiego scelto.
- [UX] **Attesa senza segnali** durante la generazione: mitigata dallo spinner.

## Out of scope

- Validazione delle tappe da GPS e da credenziale cartacea (oc:8166, oc:8165).
- Il tempo impiegato sulla tappa: arriverà con la validazione da GPS.
- La versione web della condivisione delle tracce UGC.
- L'adeguamento della grafica del passaporto al design system di Cammini d'Italia, proposto allo
  scrum del 05/10.

## Moduli toccati

**`camminiditalia`**
- `app/Services/StageProgressService.php` — campi nuovi per tappa
- `database/migrations/…` — tabella `passport_stage_shares`
- `app/Models/…` — model della condivisione, con media collection `share_image`
- `routes/api.php`, `routes/web.php` — endpoint dell'immagine e pagina pubblica
- `app/Http/Controllers/…` — controller dell'immagine e della pagina pubblica
- `app/Services/…` — composizione dell'immagine della tappa
- `resources/views/…` — template della pagina pubblica
- asset: sfondo e logo Cammini d'Italia

**`wm-package`**
- `src/Services/Models/StoryShare/MapRenderService.php` — metodo generico
- `tests/Unit/Services/StoryShare/MapRenderServiceTest.php`

**`wm-types`**
- `src/passport.ts` — campi opzionali di `PassportStage`

**`wm-core`**
- `projects/wm-core/src/services/` — servizio di condivisione con la parte comune
- `projects/wm-core/src/passport/passport.service.ts` — mappatura dei campi nuovi, chiamata all'endpoint
- `projects/wm-core/src/passport/passport-stage-detail/passport-stage-detail.component.{ts,html,scss}` — foto, dislivelli, pulsante
- `projects/wm-core/src/localization/i18n/*.ts` — traduzioni spostate e testi della tappa

**`webmapp-app`**
- `core/src/app/services/share.service.ts` — facciata che delega a `wm-core`, più lo spec nuovo
- `core/src/assets/i18n/*.ts` — rimozione delle chiavi `services.share`, solo se non più usate
