> Ticket: oc:8918

# Varianti escluse dal conteggio delle tappe — piano di implementazione

> **Per chi esegue:** sub-skill richiesta `superpowers:subagent-driven-development` (consigliata) o
> `superpowers:executing-plans`. Gli step usano le checkbox (`- [ ]`).
>
> **Nessun commit, `git add` o branch automatico.** I blocchi «Commit» sono istruzioni per il dev,
> da eseguire solo dopo la review e il suo via libera esplicito.

**Obiettivo:** nello shard camminiditalia il numero di tappe (card della home, filtri per tappe e
km) non conta più le varianti, e i km del cammino completato nel passaporto sono quelli delle tappe
percorse.

> ⚠️ Per il badge l'architettura è cambiata durante l'implementazione: [notes.md](notes.md#task-3-badge-in-variante-camminiditalia)

**Architettura:** il backend camminiditalia calcola `stage_count` e `distance` del layer solo sulle
tappe «radice» (la regola di `StageProgressService::rootSql`, già usata dal passaporto) e li
ricalcola quando cambia una variante. In wm-core il badge della card riceve `stage_count` con un
input opzionale passato dalla sola variante camminiditalia di `layer-box`; il dettaglio del
passaporto usa per i km la regola già scritta per il diario.

**Stack:** Laravel + PostgreSQL (camminiditalia, PHPUnit in Docker), Angular 20 + Jasmine/Karma
(wm-core, eseguito dall'app).

**Spec:** gli overview approvati, uno per repo, con lo stesso slug
`8918-varianti-tappe-segnalazione`:
- `webmapp-app/docs/features/…/overview.md` (principale)
- `wm-core/docs/features/…/overview.md`
- `camminiditalia/docs/features/…/overview.md`

## Vincoli globali

- Branch `feature/oc-8918-varianti-tappe-segnalazione` in `camminiditalia`, `wm-core` e
  `webmapp-app`, creato dal dev prima di scrivere file; PR verso `develop`.
- Commit `fix(oc:8918): …`, messaggi e commenti in italiano.
- Nessun testo nuovo da tradurre: l'etichetta resta `Sentieri`/`Sentiero` (tradotta «Tappe» per
  camminiditalia).
- Negli altri shard badge e passaporto restano identici.
- Nessuna nuova voce `fileReplacements`, nessuna classe base per il badge.
  > ⚠️ Superato dalla divergenza del Task 3: [notes.md](notes.md#task-3-badge-in-variante-camminiditalia)
- La regola della radice esiste in un punto solo del backend: `StageProgressService`.
- La regola dei km percorsi esiste in un punto solo di wm-core: `passport.utils.ts`.
- wm-core: identificatori in inglese, prosa in italiano (`CLAUDE.md` di wm-core).

## Review Focus

1. **Variante la cui principale non è nello stesso cammino**: conta come tappa normale, con i suoi
   km (test in Task 1).
2. **Cambio di principale in Nova** (variante di A → variante di B): si ricalcolano i cammini di A,
   di B e della variante (test in Task 2).
3. **Layer senza `stage_count`** (attributo assente): il badge mostra il conteggio di Elastic come
   oggi (test in Task 3).
4. **Cammino completato passando da una variante**: i km sono quelli della variante, non della
   principale né di entrambe (test in Task 4).
5. **Cammino senza varianti**: `stage_count`, `distance` e km del passaporto invariati rispetto a
   oggi (test in Task 1 e Task 4, verifica in Task 5).

---

### Task 1: `stage_count` e `distance` senza varianti (camminiditalia)

**File:**
- Modifica: `app/Services/StageProgressService.php` (nuovo metodo pubblico accanto a `routeTracksQuery`, righe ~66-73)
- Modifica: `app/Services/LayerAttributesService.php:124-166` (`totalDistance`, `stageCount`)
- Test: `tests/Feature/LayerAttributesServiceTest.php`

**Interfacce:**
- Produce: `StageProgressService::rootTrackIds(int $layerId): array<int>`, cioè gli id delle tracce
  del layer la cui radice è la traccia stessa (principali e tappe senza variante). Costruito su
  `routeTracksQuery()` filtrata per `layer_id`, con `ec_track_id = root_ec_track_id`.
- `LayerAttributesService` lo ottiene con `app(StageProgressService::class)`: la classe non ha
  costruttore.

- [ ] **Step 1: test che falliscono** in `LayerAttributesServiceTest` (fixture come in
  `StageProgressVariantsTest`):
  - `test_stage_count_excludes_variants_whose_main_is_in_the_same_layer`: layer con 3 tracce, di cui
    1 variante della prima → `stageCount` = 2.
  - `test_stage_count_counts_variant_whose_main_is_outside_the_layer`: variante nel layer, principale
    in un altro layer → conta 1 per la variante.
  - `test_total_distance_uses_only_the_main_of_each_group`: principale 10 km, variante 14 km, altra
    tappa 5 km → `totalDistance` = 15.0.
  - `test_stage_count_matches_passport_total`: sullo stesso layer con variante, `stageCount` è
    uguale a `total` di `StageProgressService` per un utente qualsiasi.
  - Restano verdi i test esistenti (`test_stage_count_returns_number_of_associated_tracks`, quelli
    di `total_distance_*`).
- [ ] **Step 2: eseguirli e vederli fallire**
  `docker compose -f local.compose.yml exec -T camminiditalia php artisan test --filter=LayerAttributesServiceTest`
  Atteso: FAIL sui tre test nuovi di conteggio e distanza.
- [ ] **Step 3: implementare** `rootTrackIds()`; `stageCount` = `count(rootTrackIds)` (null se 0);
  `totalDistance` itera solo le `ecTracks` il cui id è in `rootTrackIds`, mantenendo
  `classifyField(..., 'distance')` e la regola del `null`.
- [ ] **Step 4: eseguire** il filtro dello Step 2, poi `--filter='LayerAttributes|StageProgress'`.
  Atteso: PASS.
- [ ] **Step 5: commit (istruzione per il dev)**
  `fix(oc:8918): stage_count e distance del cammino senza le varianti`

### Task 2: ricalcolo quando cambia una variante (camminiditalia)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-2-cancellazione-da-nova)

**File:**
- Crea: `app/Observers/EcTrackVariantObserver.php`
- Modifica: `app/Providers/AppServiceProvider.php:95-99` (registrazione `EcTrackVariant::observe(...)`)
- Test: `tests/Feature/EcTrackVariantObserverTest.php`

**Interfacce:**
- Consuma: `RecalculateLayerAttributesJob::dispatch(int $layerId)`.
- Produce: `EcTrackVariantObserver` con `created`, `updated` e `deleted(EcTrackVariant $variant): void`.

- [ ] **Step 1: test che falliscono** con `Queue::fake()`:
  - `test_creating_a_variant_queues_recalculation_of_its_layers`: variante e principale nel layer
    L → job per L.
  - `test_changing_the_main_queues_old_and_new_layers`: principale da A (layer L1) a B (layer L2)
    → job per L1 e L2.
  - `test_deleting_a_variant_queues_recalculation`: → job per il layer della traccia.
  - `test_variant_without_layers_queues_nothing`.
- [ ] **Step 2: eseguirli** con `--filter=EcTrackVariantObserverTest`. Atteso: FAIL.
- [ ] **Step 3: implementare** l'observer: raccoglie i `layer_id` da `layerables` (tipo
  `config('wm-package.ec_track_model')`) per `ec_track_id`, `main_ec_track_id` e, su `updated`,
  `getOriginal('main_ec_track_id')`; un dispatch per layer distinto. Registrarlo in
  `AppServiceProvider`.
- [ ] **Step 4: eseguire** i test dell'observer, poi `EcTrackVariantFieldTest` ed
  `EcTrackVariantTest`. Atteso: PASS.
- [ ] **Step 5: commit (istruzione per il dev)**
  `fix(oc:8918): ricalcolo degli attributi del cammino al cambio di una variante`

### Task 3: badge con `stageCount` nella card camminiditalia (wm-core + webmapp-app)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-3-badge-in-variante-camminiditalia)

**File:**
- Modifica: `wm-core/projects/wm-core/src/layer-features-counter-badge/layer-features-counter-badge.component.ts`
- Modifica: `wm-core/projects/wm-core/src/layer-features-counter-badge/layer-features-counter-badge.component.html`
- Modifica: `wm-core/projects/wm-core/src/box/layer-box/layer-box.component.camminiditalia.html:42-46`
- Crea: `wm-core/projects/wm-core/src/layer-features-counter-badge/layer-features-counter-badge.component.spec.ts`
- Modifica (webmapp-app): `core/tsconfig.spec.json` (`include`) e `core/angular.json`
  (`architect.test.options.include`): aggiungere la cartella `layer-features-counter-badge`, come
  da trappola `test-unitari`.

**Interfacce:**
- Produce: `@Input() stageCount: number | null | undefined` su
  `WmLayerFeaturesCounterBadgeComponent`.

- [ ] **Step 1: test che falliscono** (store mock con `layerFeaturesCount` = `{5: {tracks: 12}}`):
  - `mostra stageCount al posto del conteggio delle tracce`: `stageCount = 10` → testo `10` e
    nessun `12`.
  - `senza stageCount mostra il conteggio di Elastic`: `stageCount` undefined → `12`.
  - `il conteggio dei POI resta`: con `pois: 3` e `stageCount = 10` compaiono sia `10` sia `3`.
- [ ] **Step 2: eseguirli** da `core/` con Node 22:
  `npx ng test --watch=false --include='src/app/shared/wm-core/projects/wm-core/src/layer-features-counter-badge/**/*.spec.ts'`
  Atteso: FAIL.
- [ ] **Step 3: implementare** l'input e, nel template, il ramo `stageCount` con lo stesso
  `<div><span>{{n}}</span><span>{{(n > 1 ? 'Sentieri' : 'Sentiero')|wmtrans}}</span></div>` del
  ramo tracce; il ramo tracce compare solo se `stageCount` è assente. In
  `layer-box.component.camminiditalia.html` aggiungere
  `[stageCount]="data.layer?.attributes?.stage_count"`.
- [ ] **Step 4: eseguire** lo Step 2 (PASS), poi `npm run test` e verificare che il totale della
  suite cresca di 3.
- [ ] **Step 5: commit (istruzione per il dev)** in wm-core
  `fix(oc:8918): numero di tappe della card camminiditalia da stage_count`; in webmapp-app
  `test(oc:8918): spec del badge nella suite`.

### Task 4: km del cammino completato nel passaporto (wm-core)

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-4-uscite-gps-e-completedstages)

**File:**
- Modifica: `wm-core/projects/wm-core/src/passport/passport.utils.ts` (accanto a `totalDistanceKm`, riga ~351)
- Modifica: `wm-core/projects/wm-core/src/diaries/diary-route-data.utils.ts:51-53`
- Modifica: `wm-core/projects/wm-core/src/passport/passport-detail/passport-detail.component.ts:161`
- Test: `diaries/diary-route-data.utils.spec.ts`, `passport/passport-detail/passport-detail.component.spec.ts`
  (già nelle due liste della suite)

**Interfacce:**
- Produce: `walkedDistanceKm(progress: PassportProgress): number | null`, che restituisce
  `progress.userDistanceTotal ?? totalDistanceKm(stages con status 'completed')`.

- [ ] **Step 1: test che falliscono** in `passport-detail.component.spec.ts`:
  `km del cammino completato: solo le tappe percorse`. Fixture: tappe A 10 km completed, A' variante
  14 km completed, B variante 7 km not_started, C 5 km completed, `completed: true`, senza
  `userDistanceTotal` → `totalKm` = 29. Con `userDistanceTotal: 31` → 31.
- [ ] **Step 2: eseguirlo** con `--include` sulla cartella `passport-detail`. Atteso: FAIL (oggi 36).
- [ ] **Step 3: implementare** `walkedDistanceKm`, usarlo in `passport-detail` (`totalKm`) e in
  `diaryRouteData` al posto delle righe 51-53 (le date restano calcolate su `walked`).
- [ ] **Step 4: eseguire** `passport-detail` e `diaries` con `--include` (PASS: i test esistenti del
  diario, compreso «cammino con varianti», restano verdi), poi `npm run test`.
- [ ] **Step 5: commit (istruzione per il dev)**
  `fix(oc:8918): km del cammino completato dalle sole tappe percorse`

### Task 5: verifica sulla build e in produzione

Nessun file di codice. Le query sul server `cammini` sono in sola lettura
(`SET default_transaction_read_only = on`), con le credenziali lette dal container senza
stamparle.

- [ ] **Step 1: build camminiditalia in locale.** Da `core/`, con `environment.ts` sullo shard
  camminiditalia e il server riavviato (trappola `file-replacements`), aprire la home: la card della
  Via Valeriana deve dire «10 Tappe» con il backend di sviluppo aggiornato (oppure con
  `attributes.stage_count` modificato nel config locale).
- [ ] **Step 2: valori attesi prima del deploy.** Query in produzione che, per i 15 cammini con
  varianti, calcola tappe (tracce del layer meno varianti con principale nello stesso layer) e
  somma dei km delle sole radici; salvare l'output in `notes.md`. Atteso, per esempio: Via
  Valeriana 10, Cammino Grande di Celestino 12, Cammino della Pace 29.
- [ ] **Step 3: dopo il deploy del backend** il dev lancia in Nova
  `RecalculateAppLayerAttributesAction` sull'app camminiditalia.
- [ ] **Step 4: confronto.** `layers.properties->attributes` dei 15 cammini = valori attesi; i
  cammini senza varianti hanno `stage_count` uguale al numero di tracce e `distance` uguale a prima.
- [ ] **Step 5: config servito.** Il `config.json` pubblico dell'app contiene i valori nuovi; se ne
  manca qualcuno, rigenerare una seconda volta il config dell'app.
> ⚠️ Con la variante del badge il solo bump non basta in `wm-webapp`: serve anche la voce `fileReplacements` nella sua configuration camminiditalia, poi la stessa verifica della card (vedi [notes.md](notes.md#task-3-badge-in-variante-camminiditalia)).

- [ ] **Step 6: bump del submodule** `wm-core` in `webmapp-app` (e in `wm-webapp`, che monta la
  stessa variante di `layer-box`), poi deploy web camminiditalia con
  `npm run deploy-to-web-camminiditalia`.

## Ordine di merge

1. camminiditalia (Task 1-2), deploy, Task 5 step 2-5.
2. wm-core (Task 3-4), poi bump in `webmapp-app` (con le due liste della suite) e in `wm-webapp`.

Il frontend senza il backend aggiornato mostra `stage_count` vecchio, cioè lo stesso numero di
oggi: l'ordine inverso non rompe nulla, ma non corregge.
