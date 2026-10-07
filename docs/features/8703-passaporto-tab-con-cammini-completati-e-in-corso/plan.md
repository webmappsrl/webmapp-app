> Ticket: oc:8703

# Passaporto: tab con cammini completati e in corso — piano di implementazione

> **Per chi esegue:** sub-skill richiesta: `superpowers:subagent-driven-development` (consigliata) o
> `superpowers:executing-plans`. I passi usano le checkbox (`- [ ]`). **I commit sono solo
> istruzioni testuali:** non si eseguono senza un ok esplicito del dev, e prima del primo commit
> si crea in ogni repo il branch `feature/oc-8703-passaporto-tab-cammini`.

**Obiettivo:** voce «Passaporto» nella tab bar di camminiditalia con il passaporto a timbri, stato
«completato» del dettaglio del cammino e immagine di condivisione del cammino completato.

**Architettura:** il backend `camminiditalia` aggiunge `POST /api/layer/{layer}/share-image`, sullo
schema della tappa (oc:8702), estraendo il codice comune. `wm-core` aggiunge il componente
`wm-passport-stamps`, lo stato della lettura di `/api/passport`, l'apertura della modale in un
service, lo stato completato di `passport-detail` e l'anteprima di condivisione estesa al cammino.
L'app aggiunge la voce, la rotta e la pagina con due varianti `fileReplacements`.

**Stack:** Angular 20, Ionic 8, NgRx, Jasmine/Karma; Laravel, PHPUnit, Intervention Image (GD).

**Spec:**
- `docs/features/8703-passaporto-tab-con-cammini-completati-e-in-corso/overview.md` (app)
- `core/src/app/shared/wm-core/docs/features/8703-passaporto-tab-con-cammini-completati-e-in-corso/overview.md`
- `~/Documents/BackEnd/camminiditalia/docs/features/8703-passaporto-tab-con-cammini-completati-e-in-corso/overview.md`
- Wireframe: `docs/features/passaporto-camminatore-wireframe.html`, viste 5b, 5c, 6, 7

## Vincoli globali

- Testi nuovi di `wm-core`: chiave = testo italiano, tradotti in `it, en, de, es, fr, pr, sq`
  (`projects/wm-core/src/localization/i18n/*.ts`); prima di aggiungerne uno, `grep` per vedere se
  esiste già. Etichetta della tab bar: nell'app, chiave `tabs.passport` in `core/src/assets/i18n/*.ts`,
  come le altre voci.
- Interfacce senza prefisso `I`; JSDoc su ogni funzione e metodo; documentazione e commenti in
  italiano; ogni commento nuovo cita `oc:8703`.
- `fileReplacements`: solo `.ts`; la variante duplica per intero il file originale, niente classe
  base estratta, niente import dal file sostituito (`.claude/rules/file-replacements.md`).
- `ion-nav` e `OnPush`: niente `[root]`/`[rootParams]`, niente riassegnazione degli observable in
  `ionViewWillEnter()` (`wm-core/.claude/rules/modali-e-ion-nav.md`).
- Niente km nel passaporto a timbri; niente «Racconta la tua esperienza», niente nota
  «Credenziale digitale automatica».
- Backend: test in Docker, `docker exec laravel-camminiditalia php artisan test --filter=<Nome>`.
- Contratto della nuova API: `{image_url, share_url}`, come la tappa.

## Focus della review

1. **Rete lenta o assente all'apertura del tab:** chi ha cammini iniziati non deve mai vederli
   tutti grigi — prima caricamento, poi griglia o errore con «Riprova». Test nel Task 5 e 6.
2. **Logout mentre si è sul tab** (anche per token scaduto, che non naviga): si torna alla Home e
   la voce sparisce. Test nel Task 11.
3. **Cammino completato con una tappa senza distanza:** la casella km non c'è, né nel dettaglio né
   nell'immagine. Test nel Task 4 e 2.
4. **Doppio tocco** su un timbro o su «Condividi il traguardo»: una sola modale, una sola
   anteprima. Test nel Task 7 e 9.
5. **Cammino non più completato** (tappa aggiunta dopo): l'anteprima mostra «Questo cammino non
   risulta più completato», non un errore generico. Test nel Task 9 e 2.

---

## Backend `camminiditalia` (~/Documents/BackEnd/camminiditalia)

### Task 1: test di regressione sull'immagine della tappa ed estrazione del codice comune

**Files:**
- Create: `tests/Feature/StageShareImageRegressionTest.php`
- Create: `app/Services/PassportShare/PassportShareCommon.php`
- Modify: `app/Services/PassportShare/StageShareImageService.php`

**Interfacce:**
- Produce: `PassportShareCommon` (servizio iniettabile) con i metodi oggi privati di
  `StageShareImageService` che servono anche al cammino, resi pubblici con la stessa firma:
  `resolveApp(Layer): App`, `translate(mixed $raw, string $lang): ?string`,
  `loadLayerLogo(Layer): ?InterventionImage`, `drawLayerLogo(InterventionImage, InterventionImage, int $top): void`,
  `loadCdiLogo(App): ?InterventionImage`, `drawCdiLogo(InterventionImage, InterventionImage): void`,
  `routeLineStrings(Layer): array`, `lineStrings(?string $geojson): array`,
  `drawGrid(InterventionImage, array $entries, int $top): void` (con `measureGridCell`,
  `drawGridCell`), `roundCorners(InterventionImage, int $radius): void`.
  `StageShareLayout` e la sua `signature()` **non cambiano**.

- [ ] **Passo 1: test di regressione, prima di toccare il servizio.** In
  `StageShareImageRegressionTest`, con lo stesso setup di `StageShareImageServiceTest` (tile finti
  con `Http::fake`, tappa con geometria fissa, logo del layer e icona dell'App fissi), comporre
  l'immagine e confrontare `md5($image->getEncoded())` con un valore registrato al primo giro:
  `test_stage_image_is_byte_identical_after_refactor`. Aggiungere
  `test_layout_signature_is_unchanged`: `StageShareLayout::signature()` uguale al valore registrato.
- [ ] **Passo 2:** `docker exec laravel-camminiditalia php artisan test --filter=StageShareImageRegressionTest`
  sul codice attuale; registrare i due valori nel test; atteso PASS.
- [ ] **Passo 3:** spostare i metodi elencati in `PassportShareCommon`; `StageShareImageService`
  lo riceve nel costruttore e li chiama. Nessun cambiamento di comportamento.
- [ ] **Passo 4:** `--filter='StageShareImage|PassportStageShare'`: tutto PASS, regressione compresa.
- [ ] **Passo 5 (commit, solo con ok):** `refactor(oc:8703): codice comune delle immagini del passaporto`

### Task 2: tabella polimorfica delle condivisioni e immagine del cammino

> Rivisto il 07/10 con il dev: una sola tabella polimorfica `passport_shares` per tappe e cammini,
> modificando la migration di oc:8702 (non in produzione) dopo il rollback in locale.

**Files:**
- Modify + rename: `database/migrations/2026_10_05_100000_create_passport_stage_shares_table.php` →
  `2026_10_05_100000_create_passport_shares_table.php` (crea `passport_shares`)
- Create: `app/Models/PassportShare.php`; Delete: `app/Models/PassportStageShare.php`
- Create: `app/Http/Controllers/PassportSharePageController.php`; Delete: `PassportStageSharePageController.php`
- Create: `app/Observers/PassportShareCleanupObserver.php`; Delete: `PassportStageShareCleanupObserver.php`
- Create: `app/Services/PassportShare/RouteShareImageService.php`, `app/Http/Controllers/Api/PassportRouteShareController.php`
- Create: `resources/lang/{it,en,de,es,fr,pt}/passport_route_share.php`
- Modify: `PassportStageShareController.php`, `routes/api.php`, `routes/web.php`, `AppServiceProvider.php`,
  `resources/views/share/passport-stage.blade.php` (rinominata `share/passport.blade.php`)
- Test: `PassportRouteShareApiTest.php`, `PassportSharePageTest.php` (al posto di quello della tappa),
  `PassportShareModelTest.php` (al posto di quello della tappa), `PassportStageShareApiTest.php` adattato

**Interfacce:**
- `PassportShare`: `uuid`, `user_id`, `layer_id`, `shareable_type`, `shareable_id`, `snapshot`;
  `shareable(): MorphTo`; `MEDIA_COLLECTION = 'share_image'` (`singleFile`);
  `forUser(User $user, Layer $layer, Model $shareable): self` (con il ripiego sulla violazione
  dell'indice unico); `isRoute(): bool` (`shareable` è un `Layer`).
- `POST /api/layer/{layer}/share-image` → 200 `{image_url, share_url}`, 403 se il cammino non è
  completato, 401, 500. `share_url` = `route('share.passport', uuid)` anche per la tappa.
- `GET /share/passport/{uuid}` (nome `share.passport`).

Decisioni: rate limiter `passport-route-share`; snapshot del cammino `layer_name`, `completed_at`,
`stages_validated`, `stages_total`, `distance_km` (`null` se una tappa vale 0); impronta come la
tappa più i dati dell'utente e `RouteShareImageService::signature()`; etichette in
`passport_route_share.php`; la pagina sceglie le voci dal tipo.

- [ ] **Passo 1: test falliti** (route API: 401, 403 anche con zero tappe, 200, 500, cache, data di
  validazione nuova, km nulli, limite separato, pulizia con layer e utente; pagina: tappa e cammino,
  404; modello: `forUser` idempotente, uuid stabile; tappa adattata).
- [ ] **Passo 2:** `--filter='PassportRouteShare|PassportStageShare|PassportShare'` → FAIL.
- [ ] **Passo 3:** implementare; `migrate` in locale e su `camminiditalia_testing`.
- [ ] **Passo 4:** suite completa → PASS, regressione del Task 1 compresa.
- [ ] **Passo 5:** immagine reale mostrata al dev, ritocchi approvati da lui.
- [ ] **Passo 6 (commit, solo con ok):** `feat(oc:8703): condivisione del cammino completato e tabella unica delle condivisioni`

---

## `wm-core` (core/src/app/shared/wm-core)

Test: `cd core/src/app/shared/wm-core && npm run test:single` (o `ng test wm-core --include=<spec>`).

### Task 3: tipi e calcoli puri del passaporto a timbri

**Files:**
- Modify: `projects/wm-core/src/passport/passport.utils.ts`, `passport.utils.spec.ts`

**Interfacce:**
- Produce:
  - `export type PassportStampStatus = 'in_progress' | 'completed' | 'not_started'`
  - `export interface PassportStamp { layerId: number; title: string; logo: string | null; image: string | null; status: PassportStampStatus; validated: number; total: number | null; percent: number }`
    (`title` è il valore di config, si traduce nel template con `wmtrans`; `total` per i non
    iniziati viene da `attributes.stage_count`, `null` se assente)
  - `passportStamps(layers: ILAYER[] | null | undefined, routes: Map<number, PassportRoute>): PassportStamp[]`
  - `routeShareFileName(layerTitle: string | null | undefined, layerId: number): string` →
    `<slug-cammino>.png`, ripiego `cammino-<layerId>.png`

- [ ] **Passo 1: test falliti** in `passport.utils.spec.ts`:
  - `passportStamps` ordina in corso per `percent` decrescente, a parità nell'ordine della config,
    poi completati nell'ordine della config, poi non iniziati nell'ordine della config (layer
    `A` non iniziato, `B` in corso 30%, `C` completato, `D` in corso 60%, `E` in corso 30% →
    `D, B, E, C, A`);
  - un `PassportRoute` senza layer in config non compare;
  - non iniziato: `validated: 0`, `percent: 0`, `total` = `attributes.stage_count`, `null` senza
    `attributes`;
  - in corso/completato: `validated`, `total`, `percent` da `/api/passport`;
  - `routeShareFileName('Via degli Dei', 4)` → `'via-degli-dei.png'`; `routeShareFileName('', 4)` → `'cammino-4.png'`.
- [ ] **Passo 2:** test → FAIL. **Passo 3:** implementare. **Passo 4:** test → PASS.

### Task 4: calcoli puri del dettaglio completato

**Files:**
- Modify: `projects/wm-core/src/passport/passport.utils.ts`, `passport.utils.spec.ts`

**Interfacce:**
- Produce:
  - `latestCompletedAt(stages: PassportStage[]): string | null` — `completedAt` più recente
  - `totalDistanceKm(stages: PassportStage[]): number | null` — somma arrotondata a 0,1; `null` se
    non ci sono tappe o una tappa ha `distance` ≤ 0
  - `gpsOutings(stages: PassportStage[]): number | null` — numero di giorni distinti (data locale
    del dispositivo) di `completedAt`, solo se ogni tappa è `completed` con `source: 'gps'`;
    altrimenti `null`
  - `passportLongDate(iso: string | undefined, lang: string): string` — giorno, mese esteso, anno
    («12 aprile 2026»), vuota se assente

- [ ] **Passo 1: test falliti:** data più recente fra tre tappe; `null` senza date; km `20.4 + 15.1`
  → `35.5`; una tappa a `0` → `null`; uscite con due tappe gps lo stesso giorno e una il giorno
  dopo → `2`; una tappa `manual` → `null`; `passportLongDate('2026-04-12T10:00:00Z', 'it')`
  contiene `2026` e `aprile`; `'pr'` usa il locale `pt`.
- [ ] **Passo 2–4:** FAIL → implementare → PASS.
- [ ] **Passo 5 (commit dei Task 3–4, solo con ok):** `feat(oc:8703): calcoli del passaporto a timbri e del cammino completato`

### Task 5: stato della lettura di `/api/passport`, rilettura e richiesta dell'immagine del cammino

**Files:**
- Modify: `projects/wm-core/src/passport/passport.service.ts`, `passport.service.spec.ts`

**Interfacce:**
- Produce:
  - `export type PassportRoutesState = {status: 'logged-out'} | {status: 'loading'} | {status: 'error'} | {status: 'ready'; routes: Map<number, PassportRoute>}`
  - `passportRoutesState$(): Observable<PassportRoutesState>` — stream condiviso, uno solo per
    il service; `loading` solo finché non c'è nessuna lettura riuscita nella sessione; una lettura
    fallita con dati precedenti emette `ready` con quei dati, senza dati `error`
  - `passportRoutes$()` resta con la stessa firma e lo stesso comportamento visibile (ne dipende
    `layer-box.component.camminiditalia.ts`): derivato dallo stato, `null` per `logged-out` ed
    `error`, nessuna emissione durante `loading`
  - `refreshPassport(): void` — rilegge solo `/api/passport`; se lo stato è `error` passa da
    `loading`
  - `requestLayerShareImage(layerId: number): Observable<WmShareImageResponse>` — `POST
    /api/layer/{layerId}/share-image`, body `{}`, con `_languageOptions()`

- [ ] **Passo 1: test falliti:** prima emissione `loading` poi `ready`; errore senza dati → `error`;
  errore dopo una lettura riuscita → `ready` con i dati precedenti; logout → `logged-out`;
  `refreshPassport()` fa una nuova GET; `passportRoutes$()` e `stageIndex$()` passano gli spec
  esistenti invariati; `requestLayerShareImage(4)` fa `POST …/api/layer/4/share-image` con
  `Accept-Language`.
- [ ] **Passo 2–4:** FAIL → implementare (una sola richiesta HTTP condivisa fra i due stream) → PASS.

### Task 6: componente `wm-passport-stamps`

**Files:**
- Create: `projects/wm-core/src/passport/passport-stamps/passport-stamps.component.{ts,html,scss,spec.ts}`
- Modify: `projects/wm-core/src/wm-core.module.ts` (dichiarazione ed export)

**Interfacce:**
- Consuma: `passportStamps` (Task 3), `passportRoutesState$`, `refreshPassport` (Task 5),
  `PassportModalService.open` (Task 7), `confMAPLAYERS`.
- Produce: `WmPassportStampsComponent`, selettore `wm-passport-stamps`, nessun input.
  `vm$: Observable<PassportStampsVm>` con
  `type PassportStampsVm = {status: 'loading'} | {status: 'error'} | {status: 'ready'; stamps: PassportStamp[]; anyStarted: boolean}`;
  `open(stamp: PassportStamp): void`; `retry(): void`; `ariaLabel(stamp: PassportStamp): string`.

Decisioni: `loading` finché lo stato è `loading` o `confMAPLAYERS` è `undefined`; `logged-out` vale
come `loading` (la pagina comunque esce). Template come le viste 5b/5c: griglia a 3 colonne,
anello `conic-gradient` con `passportRingDegrees(percent)` (pieno se completato, vuoto se non
iniziato), logo con `wm-img`, nome con `wmtrans`, riga «{{validated}}/{{total}} tappe» /
«✓ Completato» / «{{n}} tappe» (omessa se `total` è `null`); non iniziati in grigio
(`filter: grayscale(1)` sul logo, nome con contrasto ≥ 4,5:1); con `anyStarted === false` la riga
«Ogni tappa che ti viene riconosciuta colora il timbro del suo cammino.»; ogni timbro è un
`<button>` di almeno 44×44 px con `aria-label`; errore: «Impossibile caricare il passaporto» e
«Riprova». Etichette accessibili: «{{cammino}}, {{validated}} di {{total}} tappe»,
«{{cammino}}, completato», «{{cammino}}, non iniziato».

- [ ] **Passo 1: test falliti** (istanza diretta con store e service finti, come gli spec del
  badge): `loading` → vm `loading`, mai `ready` con tutti grigi; `error` → vm `error` e `retry()`
  chiama `refreshPassport`; `ready` senza cammini → tutti `not_started` e `anyStarted: false`;
  `open(stamp)` chiama `PassportModalService.open` con `{layerId, layerTitle (tradotto), layerLogo,
  layerImage}` e `{refresh: true}`; `ariaLabel` nei tre stati.
- [ ] **Passo 2–4:** FAIL → implementare → PASS.

### Task 7: apertura della modale in un punto solo

**Files:**
- Create: `projects/wm-core/src/passport/passport-modal/passport-modal.service.ts`, `.spec.ts`
- Modify: `passport-progress-badge.component.ts` e `.spec.ts`

**Interfacce:**
- Produce: `@Injectable({providedIn: 'root'}) PassportModalService` con
  `open(params: PassportModalParams, options?: {refresh?: boolean}): Promise<void>`;
  `export interface PassportModalParams { layerId: number; layerTitle: string; layerLogo?: string; layerImage?: string }`.
  Crea `WmPassportModalComponent` con `backdropDismiss: false`, alla chiusura
  `refreshProgress(layerId)`; con `refresh: true` chiama `refreshProgress(layerId)` prima di
  `present()`. Ignora una seconda chiamata mentre una modale è in apertura o aperta.
- Il badge riceve `PassportModalService` al posto di `ModalController` e in `openDetail()` chiama
  `open({...})`.

- [ ] **Passo 1: test falliti:** `open` crea la modale con i parametri e `backdropDismiss: false`;
  alla chiusura `refreshProgress`; `refresh: true` rilegge prima di `present`; due `open` di fila
  → una sola `create`. Adattare lo spec del badge al nuovo costruttore, con le stesse aspettative.
- [ ] **Passo 2–4:** FAIL → implementare → PASS.
- [ ] **Passo 5 (commit dei Task 5–7, solo con ok):** `feat(oc:8703): passaporto a timbri`

### Task 8: stato «completato» del dettaglio

**Files:**
- Modify: `passport-detail.component.{ts,html,scss,spec.ts}`

**Interfacce:**
- Consuma: `latestCompletedAt`, `totalDistanceKm`, `gpsOutings`, `passportLongDate` (Task 4).
- Produce: in `PassportDetailVm` i campi `completed: boolean`, `completedAt: string | null`,
  `totalKm: number | null`, `outings: number | null`; `outcome` vale `null` e `showRetry` `false`
  quando `completed`. Nuovo metodo `toggleStages(): void` e proprietà `stagesOpen = false`
  (`markForCheck`). `PassportDetailHost` acquisisce `openRouteSharePreview(): Promise<void>`;
  metodo `shareRoute(): void` che lo chiama.

Template, solo con `vm.completed` (altrimenti identico a oggi): testata «Cammino completato! 🎉» e
«Completato il {{date}}» (data lunga) o, senza data, «Cammino completato»; caselle «km» (solo con
`totalKm`), «tappe» `{{completed}}/{{total}}`, «uscite» (solo con `outings`); pulsante «Condividi
il traguardo»; lista delle tappe chiusa con il pulsante «Vedi le {{n}} tappe» / «Nascondi le
tappe», `aria-expanded` e `aria-controls`, area ≥ 44 px. Nessuna animazione vistosa.

- [ ] **Passo 1: test falliti:** completato → `outcome: null` anche con certificazione `approved`;
  `totalKm: null` con una tappa a 0; `completedAt` più recente; `outings: null` con tappe manuali;
  non completato → vm con gli stessi valori di oggi (spec esistenti invariati); `shareRoute()`
  chiama `host.openRouteSharePreview`; `toggleStages()` alterna `stagesOpen`.
- [ ] **Passo 2–4:** FAIL → implementare → PASS.

### Task 9: anteprima di condivisione del cammino

**Files:**
- Modify: `passport-share-preview.component.{ts,html,spec.ts}`, `passport-modal.component.ts` e `.spec.ts`

**Interfacce:**
- Consuma: `requestLayerShareImage` (Task 5), `routeShareFileName` (Task 3).
- Produce: input `kind: 'stage' | 'route' = 'stage'`; con `'route'` `stage` non serve.
  `WmPassportModalComponent.openRouteSharePreview(): Promise<void>` spinge l'anteprima con
  `{kind: 'route', layerId, layerTitle, host: this}`, protetta dal doppio tocco come
  `openSharePreview`.

Con `kind === 'route'`: titolo «Condividi il traguardo»; testo condiviso «Ho completato
{{cammino}}»; 403/404 → «Questo cammino non risulta più completato»; altri errori «Non è stato
possibile creare l'immagine del cammino»; nome file `routeShareFileName`; PostHog `contentShared`
con `content_type: 'passport-route'`, `content_id: String(layerId)`.

- [ ] **Passo 1: test falliti** (nuovo `describe` per il cammino): chiama `requestLayerShareImage`
  e non `requestStageShareImage`; messaggio per 403; `content_type: 'passport-route'`; nome file;
  doppio `openRouteSharePreview` → un solo `push`. Gli spec della tappa restano invariati.
- [ ] **Passo 2–4:** FAIL → implementare → PASS.

### Task 10 (wm-core): testi

**Files:** `projects/wm-core/src/localization/i18n/{it,en,de,es,fr,pr,sq}.ts`

- [ ] Aggiungere in fondo, nelle sette lingue, i testi nuovi dei Task 6, 8 e 9 non già presenti
  (`grep` prima): «Ogni tappa che ti viene riconosciuta colora il timbro del suo cammino.»,
  «Impossibile caricare il passaporto», «Completato», «{{validated}}/{{total}} tappe»,
  «{{n}} tappe», le tre etichette accessibili, «Cammino completato! 🎉», «Completato il {{date}}»,
  «km», «tappe», «uscite», «Condividi il traguardo», «Vedi le {{n}} tappe», «Nascondi le tappe»,
  «Ho completato {{cammino}}», «Questo cammino non risulta più completato», «Non è stato possibile
  creare l'immagine del cammino».
- [ ] `npm run test:single` → tutta la suite PASS; `npm run lint` se presente.
- [ ] **Commit dei Task 8–10, solo con ok:** `feat(oc:8703): cammino completato e condivisione del traguardo`

---

## App `webmapp-app`

### Task 11: voce, rotta e pagina del tab

**Files:**
- Create: `core/src/app/pages/tabs/tabs.page.camminiditalia.ts`, `tabs.page.camminiditalia.html`
- Create: `core/src/app/pages/tabs/tabs-routing.module.camminiditalia.ts`
- Create: `core/src/app/pages/passport/passport.module.ts`, `passport-routing.module.ts`,
  `passport.page.{ts,html,scss,spec.ts}`, `passport.guard.ts`, `passport.guard.spec.ts`
- Modify: `core/angular.json` (configuration `camminiditalia` di `build`: due `fileReplacements`),
  `core/src/assets/i18n/{it,en,de,es,fr,pr,sq}.ts` (`tabs.passport`)

**Interfacce:**
- Consuma: `WmPassportStampsComponent` (Task 6) via `WmCoreModule`, `refreshPassport()` (Task 5).
- Produce: rotta `passport` figlia di `TabsPage`, solo nella build camminiditalia.

Decisioni:
- `tabs.page.camminiditalia.ts`: copia di `tabs.page.ts` con `templateUrl: 'tabs.page.camminiditalia.html'`;
  il template aggiunge, fra Preferiti e Profilo, `<ion-tab-button tab="passport">` con la stessa
  condizione di Preferiti, icona SVG coerente con `icon-outline-*` e `{{'tabs.passport' | wmtrans}}`.
- `tabs-routing.module.camminiditalia.ts`: copia di `tabs-routing.module.ts` con
  `{path: 'passport', canActivate: [passportGuard], loadChildren: () => import('../passport/passport.module').then(m => m.PassportPageModule)}`.
- `passportGuard: CanActivateFn` — `true` se `confAUTHEnable` e `isLogged`, altrimenti
  `router.parseUrl('/home')`.
- `PassportPage`: header «Passaporto» (`tabs.passport`), `<wm-passport-stamps>`; si iscrive a
  `isLogged` e al primo `false` naviga a `/home` (copre logout e `logoutByError$`); in
  `ionViewWillEnter` chiama `refreshPassport()` dal secondo ingresso in poi (il primo legge già
  con la sottoscrizione).
- Traduzioni `tabs.passport`: it «Passaporto», en «Passport», de «Reisepass», es «Pasaporte»,
  fr «Passeport», pr «Passaporte», sq «Pasaporta».

- [ ] **Passo 1: test falliti:** guard → `true` da loggato con auth attiva, `UrlTree('/home')`
  altrimenti; pagina → al passaggio di `isLogged` a `false` naviga a `/home`; primo
  `ionViewWillEnter` non chiama `refreshPassport`, il secondo sì.
- [ ] **Passo 2–4:** FAIL → implementare → PASS (`cd core && npm run test`).
- [ ] **Passo 5:** `cd core && npx ng build --configuration=camminiditalia` → build riuscita;
  `npx ng build` (generica) → nessuna voce Passaporto e nessun riferimento a `passport.module`
  nel routing generico.
- [ ] **Passo 6: verifica manuale con il dev** (`npm start` con shard camminiditalia):
  voce visibile solo da loggati; viste 5b e 5c; tocco su un timbro grigio, in corso e completato;
  dettaglio completato da tab e dal riquadro verde della home del layer; «Condividi il traguardo»;
  logout dal Profilo con il tab aperto; tab bar a 320 px in de e fr.
- [ ] **Passo 7 (commit, solo con ok):** `feat(oc:8703): tab Passaporto nella tab bar di camminiditalia`
  (comprende `docs/features/passaporto-camminatore-wireframe.html`); poi aggiornamento del
  submodule `wm-core`.

---

## Rilascio (ordine obbligatorio)

0. **Merge della PR di `wm-package`** (parametro `labels` di `renderLayers`) e aggiornamento del
   puntatore del submodule in `camminiditalia` prima del deploy del backend: con il puntatore
   vecchio PHP ignora l'argomento in più e le etichette «Tappa N» non compaiono, senza errori.
1. **Deploy del backend `camminiditalia` in produzione prima della build per gli store e prima di
   `deploy-to-web-camminiditalia`.** Da quel momento `{image_url, share_url}` non cambia più.
2. Verifica in produzione: `POST /api/layer/{id}/share-image` risponde 403 per un cammino non
   completato e 200 per uno completato.
3. Build per gli store e `npm run deploy-to-web-camminiditalia` (mai il deploy web generico con
   `--configuration=camminiditalia`).
4. A ticket approvato, pubblicazione del wireframe su `gh-pages` come `index.html` (solo con ok).
