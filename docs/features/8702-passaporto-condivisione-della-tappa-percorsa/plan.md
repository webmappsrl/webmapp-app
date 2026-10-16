> Ticket: oc:8702

# Passaporto: condivisione della tappa percorsa — piano di implementazione

> **Per chi esegue:** usare `superpowers:subagent-driven-development` (consigliato) o
> `superpowers:executing-plans`, task per task. I passi usano le checkbox (`- [ ]`).
> **Nessun commit, `git add` o `git push` durante l'esecuzione**: i comandi di commit qui sotto sono
> istruzioni per il developer, da eseguire solo dopo la sua approvazione nel review-gate.

**Obiettivo:** il camminatore condivide sui social una tappa percorsa del passaporto con
un'immagine generata dal backend e un link a una pagina pubblica dedicata.

**Architettura:** `wm-package` espone un renderer di mappa generico a più layer; `camminiditalia`
arricchisce `progress`, salva le condivisioni in una tabella propria, compone l'immagine e serve la
pagina pubblica; `wm-types` estende `PassportStage`; `wm-core` riceve la parte comune della
condivisione e la usa dalla pagina della tappa; l'app tiene `ShareService` come facciata.

**Stack:** Laravel + Pest + Intervention Image (GD) + PostGIS; Angular 20 + Ionic 8 + Capacitor 7
(`@capacitor/share`, `@capacitor/filesystem`) + Karma/Jasmine.

**Spec:** gli `overview.md` con lo slug `8702-passaporto-condivisione-della-tappa-percorsa` nei
cinque repo; il documento d'insieme è [overview.md](overview.md).

## Repo e percorsi

| Sigla | Repo | Percorso |
|---|---|---|
| PKG | `wm-package` | `/Users/peco/Documents/BackEnd/camminiditalia/wm-package` |
| CDI | `camminiditalia` | `/Users/peco/Documents/BackEnd/camminiditalia` |
| TYP | `wm-types` | `/Users/peco/Documents/Apps/webmapp-app/core/src/app/shared/wm-types` |
| CORE | `wm-core` | `/Users/peco/Documents/Apps/webmapp-app/core/src/app/shared/wm-core` |
| APP | `webmapp-app` | `/Users/peco/Documents/Apps/webmapp-app` |

Comandi di test: CDI e PKG `docker compose -f local.compose.yml exec -T camminiditalia php artisan test --filter=<Nome>`
(PKG dalla directory `wm-package` con `vendor/bin/pest <file>` se ha il proprio vendor);
CORE `npm run test:single` dalla sua root; APP `cd core && npx ng test --watch=false --include=<spec>`.

## Vincoli globali

- Ordine di merge e rilascio: oc:8676 (CDI) → PKG → bump PKG in CDI → CDI → TYP → CORE → puntatori in APP → rilascio app.
- Branch `feature/oc-8702-passaporto-condivisione-della-tappa-percorsa` in tutti i repo: da `Passaporto` in TYP, CORE e APP; da `feature/oc-8676-…` in CDI; da `develop` in PKG.
- Test di caratterizzazione **prima** di ogni spostamento o estrazione (Task 1 e Task 6).
- i18n di CORE: la chiave è il testo italiano, ripetuto come valore in `it.ts`; traduzione in it, en, de, es, fr, pr, sq; cercare prima che il testo non esista già.
- Documentazione e commenti in italiano; JSDoc su ogni funzione e metodo; niente prefisso `I` sulle interfacce.
- Immagine 1080×1920. Il tempo non compare mai.
- `render(UgcTrack …)` e `shareTrackToStories` mantengono firma e comportamento.

## Review Focus

1. Tappa con `ref` vuoto: l'immagine mostra il nome della tappa, nessun «Tappa » vuoto — test in Task 4.
2. Tappa senza `from`, `to` o `ascent`: la voce sparisce nell'immagine, nella pagina pubblica e nella pagina dell'app — test in Task 4, 5, 9.
3. Ricondivisione della stessa tappa: stessa riga, stesso `uuid`, una sola immagine — test in Task 3.
4. Web con `navigator.canShare` assente o `share()` rifiutata con `NotAllowedError`: si scarica l'immagine — test in Task 8.
5. Lingua `de` con nome del cammino lungo: niente testo fuori dal riquadro — test in Task 4.

---

## Task 0: prerequisito CORS del disco `wmfe` (CDI)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-0-prerequisito-cors)

Nessun codice. Verifica che il browser possa scaricare un'immagine del disco media come `Blob`.

- [ ] **Passo 1:** prendere un `image_url` reale di una condivisione UGC (`media` con `collection_name = 'share_image'`) ed eseguire
  `curl -sI -H 'Origin: https://camminiditalia.webmapp.it' '<image_url>' | grep -i access-control-allow-origin`.
  Atteso: l'header è presente con l'origine o `*`.
- [ ] **Passo 2:** se manca, segnalarlo al developer prima del Task 8: va configurata la policy CORS del bucket. Annotare l'esito in `notes.md`, sezione «Decisioni».

## Task 1: renderer a più layer (PKG)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-1-trasparenza-dei-layer)

**File:**
- Modifica: `src/Services/Models/StoryShare/MapRenderService.php`
- Test: `tests/Unit/Services/StoryShare/MapRenderServiceTest.php`

**Interfacce prodotte:**
- `public function renderLayers(array $layers, array $markers, array $focusBbox, App $app, int $width, int $height): InterventionImage`
  - `$layers`: `list<array{lineStrings: list<list<array{0: float, 1: float}>>, color: string, thickness: int, opacity: float, outlineColor?: string, outlineThickness?: int}>`, disegnati nell'ordine dato;
  - `$markers`: `list<array{lon: float, lat: float, type: 'start'|'end'}>`;
  - `$focusBbox`: `array{xmin: float, ymin: float, xmax: float, ymax: float}`, a cui si applicano `expandDegenerateBbox` e `padBbox` esistenti.
- `render(UgcTrack …)` invariato nella firma: estrae la geometria come oggi e chiama `renderLayers` con un layer `{color: TRACK_LINE_COLOR, thickness: TRACK_LINE_THICKNESS_PX, opacity: 1.0}`, nessun marker, `focusBbox` = bbox della traccia.

- [ ] **Passo 1:** eseguire i test esistenti del file e di `StoryShareImageServiceTest`, `ShareStoryImageControllerTest`, `ShareUgcTrackPageTest`. Atteso: tutti PASS (base di partenza).
- [ ] **Passo 2:** aggiungere un test di caratterizzazione: `render()` su una UgcTrack di fixture produce un'immagine con lo stesso hash dei pixel prima e dopo (calcolare l'hash ora, con i tile finti dei test esistenti, e fissarlo nel test). Atteso: PASS sul codice attuale.
- [ ] **Passo 3:** scrivere i test che falliscono:
  - `it('draws layers in the given order')`: due layer sovrapposti, rosso poi giallo; il pixel al centro del tracciato è giallo;
  - `it('applies opacity to a layer')`: un layer rosso con opacità 0.7 su sfondo bianco dà un pixel non pienamente rosso;
  - `it('draws start and end markers')`: i pixel nelle posizioni dei due marker non sono del colore dello sfondo;
  - `it('frames the focus bbox, not the whole layers')`: con un layer lungo e un `focusBbox` piccolo, lo zoom è maggiore di quello ottenuto inquadrando l'intero layer.
- [ ] **Passo 4:** eseguire i test. Atteso: FAIL, `renderLayers` non esiste.
- [ ] **Passo 5:** implementare `renderLayers` e riscrivere `render` come involucro. Opacità: GD non ha alpha sulle linee di `drawThickLine`; disegnare il layer su un canvas trasparente e inserirlo con `$canvas->place($layerCanvas, 'top-left', 0, 0, (int) round($opacity * 100))`. Bordo: se c'è `outlineColor`, disegnare prima la stessa linea con `thickness + 2 * outlineThickness`.
- [ ] **Passo 6:** eseguire tutti i test del Passo 1, del Passo 2 e del Passo 3. Atteso: PASS, l'hash di caratterizzazione invariato.
- [ ] **Passo 7 (commit, istruzione per il developer):** `git add src/Services/Models/StoryShare/MapRenderService.php tests/Unit/Services/StoryShare/MapRenderServiceTest.php` → `feat(oc:8702): renderer della mappa a più layer con marker e inquadratura`.

## Task 2: campi nuovi in `progress` (CDI)

**File:**
- Modifica: `app/Services/StageProgressService.php` (`progressFor`, righe 91-127)
- Test: `tests/Feature/StageProgressServiceTest.php`, `tests/Feature/StageProgressApiTest.php`

**Interfacce prodotte:** ogni elemento di `tracks` aggiunge
`ref: ?string`, `from: ?string`, `to: ?string`, `ascent: ?int`, `descent: ?int`, `image: ?string`, `shareable: bool`.
Valori vuoti (`''`, `0`) diventano `null`. `shareable` è `true` se e solo se la tappa è `validated`.

- [ ] **Passo 1:** test che falliscono in `StageProgressServiceTest`:
  - una tappa con `properties.ref = '01'`, `from`, `to`, `ascent`/`descent` in `manual_data` e una `feature_image` restituisce quei valori (l'immagine è la miniatura, come `getThumbnailUrl`);
  - una tappa senza nessuno di questi dati restituisce `null` per ciascuno;
  - `shareable` è `true` per la tappa validata dall'utente e `false` per le altre;
  - i campi esistenti (`id`, `name`, `distance`, `status`, `progress`, `validated_at`, `source`) restano identici.
- [ ] **Passo 2:** eseguire. Atteso: FAIL.
- [ ] **Passo 3:** implementare. Caricare in un'unica query i model `EcTrack` delle tappe del layer con i media (`EcTrack::with('media')->whereIn('id', $ids)->get()->keyBy('id')`), e per ciascuno ricavare i valori con la stessa logica di `EcTrack.php:731-751`: `properties['ref']`, `from`/`to` con il ripiego su `osmfeatures_data`, `classifyField($track, 'ascent')` e `'descent'`, miniatura della prima media. Metodo privato `stageDetails(EcTrack $track): array`.
- [ ] **Passo 4:** eseguire i due file di test. Atteso: PASS.
- [ ] **Passo 5 (commit):** `feat(oc:8702): dati tecnici e shareable nelle tappe di progress`.

## Task 3: tabella e model delle condivisioni (CDI)

**File:**
- Crea: `database/migrations/<data>_create_passport_stage_shares_table.php`
- Crea: `app/Models/PassportStageShare.php`
- Test: `tests/Feature/PassportStageShareModelTest.php`

**Interfacce prodotte:**
- tabella `passport_stage_shares`: `id`, `uuid` (unico), `user_id` (FK users, cascade), `layer_id` (FK layers, cascade), `ec_track_id` (FK ec_tracks, cascade), `snapshot` jsonb nullable, timestamps; indice unico (`user_id`, `ec_track_id`);
- `PassportStageShare` con `HasMedia`, collection `share_image` `singleFile()`, `uuid` generato in `creating` con `Str::uuid()`, cast `snapshot` → `array`;
- `PassportStageShare::forUserAndTrack(User $user, Layer $layer, EcTrack $track): self` — `firstOrCreate` sulla coppia (`user_id`, `ec_track_id`).

- [ ] **Passo 1:** test che falliscono:
  - `forUserAndTrack` due volte sulla stessa coppia restituisce la stessa riga con lo stesso `uuid`;
  - due utenti sulla stessa tappa ottengono due `uuid` diversi;
  - aggiungere due volte un file a `share_image` lascia una sola media.
- [ ] **Passo 2:** eseguire. Atteso: FAIL.
- [ ] **Passo 3:** creare migrazione e model.
- [ ] **Passo 4:** `php artisan migrate` ed eseguire il test. Atteso: PASS.
- [ ] **Passo 5 (commit):** `feat(oc:8702): tabella delle condivisioni delle tappe del passaporto`.

## Task 4: composizione dell'immagine della tappa (CDI)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-4-asset)

**File:**
- Crea: `app/Services/PassportShare/StageShareImageService.php`
- Crea: `app/Services/PassportShare/StageShareLayout.php` (costanti)
- Crea: `resources/images/passport-share/background.png`, `resources/images/passport-share/camminiditalia-logo.png`
- Test: `tests/Feature/StageShareImageServiceTest.php`

**Interfacce:**
- Consuma: `MapRenderService::renderLayers` (Task 1).
- Produce: `StageShareImageService::compose(Layer $layer, EcTrack $track, string $lang): InterventionImage`, e `StageShareImageService::snapshot(Layer $layer, EcTrack $track, string $lang): array` con le chiavi `layer_name`, `stage_label`, `from`, `to`, `distance_km`, `ascent_m` (valori `null` se assenti).

Composizione, dall'alto in basso, su 1080×1920 (valori in `StageShareLayout`):
- sfondo `background.png` (curve di livello beige del mockup del cliente);
- logo del cammino (`$layer->getFirstMediaUrl('logo')`) in un cerchio bianco di 240px centrato; se manca, il blocco si salta e il resto sale;
- nome del cammino nella lingua `$lang`, ripiego `it`;
- riquadro mappa 960×720 con bordo arancione `#E8822E` di 12px e angoli arrotondati: layer 1 = tutte le tappe del layer, rosso `#D93025`, 4px, opacità 0.7; layer 2 = la tappa, giallo `#F2C200`, 14px, bordo bianco 3px; marker `start` e `end` agli estremi della tappa; `focusBbox` = bbox della tappa;
- `stage_label`: `'Tappa ' . ref` tradotto se `ref` non è vuoto, altrimenti il nome della tappa;
- griglia: Partenza, Arrivo, Lunghezza (`20,4 km`), Dislivello (`+358 m`); ogni voce `null` si toglie e le restanti si ricompongono;
- logo Cammini d'Italia centrato in fondo.

Testi: riquadro fisso per campo; a capo fino a 2 righe; poi riduzione del corpo a passi di 2px fino a `MIN_FONT_SIZE`; oltre, troncamento con `…`. Funzione privata `fitText(string $text, int $boxWidth, int $maxLines, int $fontSize, int $minFontSize): array{lines: list<string>, fontSize: int}`. Etichette tradotte con i file `lang/<lang>/passport_share.php` per it, en, de, es, fr, pt (ripiego `it`).

- [ ] **Passo 1:** test che falliscono (rendering con tile finti, come nei test di PKG):
  - l'immagine è 1080×1920;
  - `snapshot` con `ref = '01'` dà `stage_label = 'Tappa 01'`; con `ref` vuoto dà il nome della tappa;
  - `snapshot` senza `from` ha `from = null`, e `compose` non lancia eccezioni;
  - senza logo del layer `compose` non lancia eccezioni;
  - `fitText` con «Santa Maria Capua Vetere – Stazione FS» e il riquadro della partenza restituisce al massimo 2 righe e `fontSize >= MIN_FONT_SIZE`; con un testo di 200 caratteri l'ultima riga finisce con `…`;
  - con `$lang = 'de'` le etichette sono in tedesco.
- [ ] **Passo 2:** eseguire. Atteso: FAIL.
- [ ] **Passo 3:** implementare servizio, layout, file di lingua; aggiungere gli asset. Lo sfondo e il logo li fornisce il developer: se non ci sono, fermarsi e chiederli.
- [ ] **Passo 4:** eseguire. Atteso: PASS. Salvare un'immagine di prova in `storage/app/tmp/` e mostrarla al developer.
- [ ] **Passo 5 (commit):** `feat(oc:8702): composizione dell'immagine di condivisione della tappa`.

## Task 5: endpoint dell'immagine e pagina pubblica (CDI)

**File:**
- Crea: `app/Http/Controllers/Api/PassportStageShareController.php`
- Crea: `app/Http/Controllers/PassportStageSharePageController.php`
- Crea: `resources/views/share/passport-stage.blade.php`
- Modifica: `routes/api.php` (gruppo del layer, accanto a `progress`), `routes/web.php`
- Test: `tests/Feature/PassportStageShareApiTest.php`, `tests/Feature/PassportStageSharePageTest.php`

**Interfacce prodotte:**
- `POST /api/layer/{layer}/stage/{track}/share-image`, `auth:api`, `whereNumber` su entrambi → `200 {image_url: string, share_url: string}`; `404 {error}` se la tappa non è del layer; `403 {error}` se non è validata per l'utente; `500 {error}` se la composizione fallisce. Lingua da `Accept-Language` (prima parte, es. `de-DE` → `de`; `pr` → `pt`), ripiego `it`. Throttle `10,1` come la certificazione.
- `GET /share/passport-stage/{uuid}`, nome rotta `share.passport-stage` → pagina HTML con `og:title`, `og:description`, `og:image` = immagine, `og:url`; contenuto = `snapshot` + `shared_at` + link all'app; `404` per `uuid` sconosciuto.

- [ ] **Passo 1:** test API che falliscono: 200 con `image_url` e `share_url = route('share.passport-stage', uuid)`; seconda chiamata → stesso `share_url`; 403 su tappa non validata; 404 su tappa di un altro layer; 401 senza token; `Accept-Language: de` salva `snapshot` con etichetta tedesca.
- [ ] **Passo 2:** test pagina che falliscono: 200 con `og:image` uguale a `image_url`; nessun nome dell'utente né `user_id` o `ec_track_id` nell'HTML; la voce Partenza manca se `snapshot.from` è `null`; 404 su `uuid` sconosciuto.
- [ ] **Passo 3:** eseguire. Atteso: FAIL.
- [ ] **Passo 4:** implementare. Il controller API: verifica tramite `StageProgressService::layerTracksQuery` e `ValidatedEcTrack::validatedSql`, poi `PassportStageShare::forUserAndTrack`, `compose`, `addMediaFromString(...)->toMediaCollection('share_image')`, salva `snapshot` + `shared_at`. Errori loggati con il prefisso `[oc:8702]`.
- [ ] **Passo 5:** eseguire. Atteso: PASS.
- [ ] **Passo 6 (commit):** `feat(oc:8702): endpoint dell'immagine e pagina pubblica della tappa condivisa`.

## Task 6: tipi della tappa (TYP)

**File:** Modifica `src/passport.ts` (`PassportStage`, righe 19-32).

**Interfacce prodotte:** in `PassportStage`, opzionali e con JSDoc in italiano:
`ref?: string`, `from?: string`, `to?: string`, `ascent?: number` (m), `descent?: number` (m), `image?: string` (URL della miniatura), `shareable?: boolean`.

- [ ] **Passo 1:** aggiungere i campi.
- [ ] **Passo 2:** `npm run build`. Atteso: nessun errore.
- [ ] **Passo 3 (commit):** `feat(oc:8702): dati tecnici e shareable in PassportStage`.

## Task 7: caratterizzazione di `ShareService` (APP)

**File:** Crea `core/src/app/services/share.service.spec.ts`.

Mock di `Share.share`, `Filesystem.downloadFile`, `Filesystem.getUri`, `HttpClient`, `LangService`, `POSTHOG_CLIENT`.

- [ ] **Passo 1:** test sul codice **attuale**:
  - senza `properties.uuid` → `{success: false, errorMessage: 'Impossibile condividere: percorso non ancora sincronizzato.'}` e nessuna POST;
  - seconda chiamata mentre la prima è in corso → `'Una condivisione è già in corso.'`;
  - successo → POST a `${origin}/api/share-story-image` con `{uuid}`, `Share.share` con `url: share_url`, `files: [uri]`, `title` e `dialogTitle` tradotti; evento `contentShared` con `content_type: 'track-story'`; esito `{success: true}`;
  - errori HTTP 404, 403, 422 → i tre messaggi di `share.service.ts:275-280`;
  - `Share.share` rifiutata con `'Share canceled'` → `'Condivisione annullata.'`;
  - `sharePoiByID(5)` → `Share.share` con `url: https://<shareLink>/map?poi=5`.
- [ ] **Passo 2:** eseguire. Atteso: PASS sul codice attuale. Se un test fallisce, il test è sbagliato: correggerlo, non il servizio.
- [ ] **Passo 3 (commit):** `test(oc:8702): caratterizzazione di ShareService prima dello spostamento`.

## Task 8: condivisione comune e traduzioni in CORE, facciata in APP

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-8-spec-di-caratterizzazione)

**File:**
- Crea: `CORE projects/wm-core/src/services/share-image.service.ts`, `share-image.service.spec.ts`
- Modifica: `CORE projects/wm-core/src/localization/i18n/{it,en,de,es,fr,pr,sq}.ts`
- Modifica: `APP core/src/app/services/share.service.ts`

**Interfacce prodotte:**

```ts
/** Testi del foglio di condivisione, già tradotti da chi chiama. */
export interface WmShareTexts { title: string; dialogTitle: string; text?: string; }

/** Esito della preparazione sul web: il file è pronto per il secondo tocco. */
export interface WmPreparedShare { file: File; shareUrl: string; }

@Injectable({providedIn: 'root'})
export class WmShareImageService {
  /** Nativo: POST, download in cache, Share.share. Lancia in caso d'errore. */
  shareNative(request: Observable<{image_url: string; share_url: string}>, texts: WmShareTexts, fileName: string): Promise<void>;
  /** Web, primo tocco: esegue la richiesta e scarica l'immagine come File. */
  prepareWeb(request: Observable<{image_url: string; share_url: string}>, fileName: string): Promise<WmPreparedShare>;
  /** Web, secondo tocco: navigator.share se canShare({files}), altrimenti o su errore scarica il Blob. Restituisce 'shared' | 'downloaded'. */
  shareWeb(prepared: WmPreparedShare, texts: WmShareTexts): Promise<'shared' | 'downloaded'>;
  /** true su piattaforma nativa (Capacitor.isNativePlatform()). */
  isNative(): boolean;
}
```

Nessuna guardia «in corso» e nessun messaggio d'errore nel servizio: restano ai chiamanti.

Traduzioni nuove in CORE (chiave = testo italiano): `'Hai visto questo percorso?'` e `'Condividi con i tuoi amici'`, con i valori delle lingue presi da `services.share.title` e `services.share.dialogTitle` dei file `core/src/assets/i18n/*.ts` dell'app. `url` non è un testo: resta il default `'www.webmapp.it'` in `ShareService`; `services.share.text` non è letto da nessuno e non si sposta.

- [ ] **Passo 1:** test che falliscono in `share-image.service.spec.ts`:
  - `shareNative` chiama `Filesystem.downloadFile` con `directory: Directory.Cache` e `Share.share` con `files: [uri]`, `url: share_url` e i testi passati;
  - `shareWeb` con `navigator.canShare` che restituisce `true` chiama `navigator.share({files: [file], url, title, text})` e restituisce `'shared'`;
  - `shareWeb` con `navigator.canShare` assente → crea un `<a download>` con `URL.createObjectURL` e restituisce `'downloaded'`;
  - `shareWeb` con `navigator.share` rifiutata con `NotAllowedError` → `'downloaded'`;
  - `shareWeb` con `AbortError` (utente che annulla) → rilancia l'errore, senza scaricare.
- [ ] **Passo 2:** eseguire. Atteso: FAIL.
- [ ] **Passo 3:** implementare `WmShareImageService`; aggiungere le due chiavi in tutte e sette le lingue di CORE (prima `grep` che non esistano).
- [ ] **Passo 4:** riscrivere `shareTrackToStories` in APP perché deleghi a `WmShareImageService.shareNative`, mantenendo guardia, gating su `uuid`, PostHog e `_resolveErrorMessage`. `defaultShareObj.title` e `dialogTitle` si leggono con le chiavi nuove `'Hai visto questo percorso?'` e `'Condividi con i tuoi amici'`.
- [ ] **Passo 5:** eseguire `share-image.service.spec.ts` (CORE) e `share.service.spec.ts` (APP, Task 7). Atteso: PASS, **senza aver modificato** lo spec del Task 7.
- [ ] **Passo 6:** `grep -rn "services.share" core/src/app --include=*.ts --include=*.html | grep -v shared/`. Se non resta nessun uso, togliere il blocco `share` di `services` da `core/src/assets/i18n/*.ts`; altrimenti lasciarlo e annotarlo in `notes.md`.
- [ ] **Passo 7 (commit, due repo):** CORE `feat(oc:8702): servizio comune di condivisione dell'immagine`; APP `refactor(oc:8702): ShareService delega la condivisione a wm-core`.

## Task 9: dati e condivisione nel `PassportService` (CORE)

**File:**
- Modifica: `projects/wm-core/src/passport/passport.service.ts` (`ProgressResponse` righe 32-47, `_toProgress` righe 406-428)
- Test: `projects/wm-core/src/passport/passport.service.spec.ts`

**Interfacce:**
- Consuma: `PassportStage` (Task 6), `WmShareImageService` (Task 8).
- Produce:
  - `requestStageShareImage(layerId: number, trackId: number): Observable<{image_url: string; share_url: string}>` — POST a `${origin}/api/layer/${layerId}/stage/${trackId}/share-image` con `this._languageOptions()`;
  - `ProgressResponse.tracks[]` con `ref`, `from`, `to`, `ascent`, `descent`, `image`, `shareable`, tutti `?: … | null`;
  - `_toProgress` copia in `PassportStage` solo i valori non `null` e non vuoti; `shareable` solo se `true`.

- [ ] **Passo 1:** test che falliscono:
  - una risposta con `ref: '01'`, `ascent: 358`, `shareable: true` produce una tappa con quei campi;
  - una risposta con `ref: null`, `from: ''` produce una tappa **senza** le chiavi `ref` e `from`;
  - una risposta senza i campi nuovi (backend vecchio) produce `shareable` assente;
  - `requestStageShareImage(3, 42)` fa una POST a `/api/layer/3/stage/42/share-image` con `Accept-Language` quando la lingua è impostata.
- [ ] **Passo 2:** eseguire. Atteso: FAIL.
- [ ] **Passo 3:** implementare.
- [ ] **Passo 4:** eseguire lo spec intero. Atteso: PASS, compresi i test esistenti di oc:8671 su `Accept-Language`.
- [ ] **Passo 5 (commit):** `feat(oc:8702): dati tecnici della tappa e richiesta dell'immagine in PassportService`.

## Task 10: pagina della tappa e pulsante (CORE)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#anteprima-della-condivisione-al-posto-di-condividi-ora)

**File:**
- Modifica: `projects/wm-core/src/passport/passport-stage-detail/passport-stage-detail.component.{ts,html,scss}`
- Modifica: `projects/wm-core/src/localization/i18n/{it,en,de,es,fr,pr,sq}.ts`
- Test: `projects/wm-core/src/passport/passport-stage-detail/passport-stage-detail.component.spec.ts`

**Interfacce:**
- Consuma: `PassportService.requestStageShareImage` (Task 9), `WmShareImageService` (Task 8).
- Il componente riceve già `stage`, `layerTitle`, `host`; aggiunge l'`@Input() layerId: number`, passato da `passport-modal.component.ts:109` nel `nav.push`.
- Stato del pulsante: `shareState: 'idle' | 'loading' | 'ready' | 'error'`; su web `ready` mostra «Condividi ora».

Testi nuovi (chiave = testo italiano, sette lingue, `grep` prima): `'Condividi ora'`,
`'Non è stato possibile creare l\'immagine della tappa'`, `'Questa tappa non risulta più percorsa'`,
`'Ho percorso una tappa di {{cammino}}'` (titolo della condivisione). Riusati: `'Condividi'`,
`ascent`, `descent`, `'Distanza'`.

Template, in ordine: foto (`stage.image`, `<img>` alto 130px, `object-fit: cover`, nascosto se manca o su `(error)`), titolo, riga con chip a sinistra e pulsante a destra, righe Distanza, Dislivello positivo, Dislivello negativo (ognuna solo se il valore è > 0).

- [ ] **Passo 1:** test che falliscono:
  - con `shareable: true` il pulsante «Condividi» c'è; senza `shareable` non c'è, anche se `status === 'completed'`;
  - senza `image` il blocco foto non c'è; con `image` e un evento `error` sparisce;
  - `ascent: 290` mostra «Dislivello positivo 290 m»; senza `descent` la riga non c'è;
  - nativo: il tocco chiama `requestStageShareImage(layerId, trackId)` e `shareNative`; durante l'attesa il pulsante è `disabled` con uno spinner;
  - nativo, errore HTTP 403 → messaggio `'Questa tappa non risulta più percorsa'`; errore 500 → `'Non è stato possibile creare l\'immagine della tappa'`; il pulsante torna attivo;
  - web: primo tocco → `prepareWeb`, poi etichetta «Condividi ora»; secondo tocco → `shareWeb`;
  - doppio tocco durante `loading` → una sola richiesta.
- [ ] **Passo 2:** eseguire. Atteso: FAIL.
- [ ] **Passo 3:** implementare componente, template, stile (pulsante con icona `share-social-outline` ed etichetta, `min-height` e `min-width` 44px), traduzioni; passare `layerId` dalla modale.
- [ ] **Passo 4:** eseguire lo spec del componente e quello della modale. Atteso: PASS.
- [ ] **Passo 5:** verifica manuale con `npm start` in APP sullo shard camminiditalia: aprire il passaporto, una tappa validata, toccare «Condividi» nel browser (secondo tocco, download o condivisione) e mostrare il risultato al developer.
- [ ] **Passo 6 (commit):** `feat(oc:8702): foto, dislivelli e condivisione nella pagina della tappa`.

## Task 11: integrazione e documentazione

- [ ] **Passo 1:** bump dei puntatori: PKG in CDI; TYP e CORE in APP. Eseguire tutte le suite toccate. Atteso: PASS.
- [ ] **Passo 2:** `npm run lint` in APP. Atteso: nessun errore nei file toccati.
- [ ] **Passo 3:** compilare `notes.md` in ogni repo e aggiornare la conoscenza (fase `update-context` di wm-plan).
