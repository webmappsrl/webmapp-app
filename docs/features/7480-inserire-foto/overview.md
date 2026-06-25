> Ticket: oc:7480

# [wm-package][app] inserire foto — Gulp my_paths / my_downloads

## Cosa cambia

**App mobile (gulp):** Il `gulpfile.js` scarica e converte le immagini di profilo (`my-path.webp`, `downloads.webp`) dall'URL S3 configurato nel backend, sovrascrivendo i file default nell'istanza durante il build. Se la chiave non è presente nel config o il download fallisce, il file default resta invariato. I file legacy `cammini-my-path.webp` e `cammini-downloads.webp` vengono rimossi dal core.

**Web (wm-core):** Il componente `wm-ugc-box` legge `APP.myPaths` dallo store NgRx (`confAPP` selector) e lo usa come sorgente dell'immagine al posto del path statico hardcoded, con fallback a `assets/images/profile/my-path.webp`. Il box dei download (`downloads-ec-track-box`) non viene modificato — è una funzionalità esclusiva della versione mobile.

## Perché

Il backend (wm-package, già completato su branch `oc_7480_3`) ha aggiunto i campi `my_paths` e `my_downloads` come media collection su App, con URL assolute S3 nel `config.json` sotto `APP.myPaths` / `APP.myDownloads`. Senza questa modifica al gulp, le immagini caricate dal backend non verrebbero mai recepite nel bundle app. Senza la modifica a wm-core, la versione web continua a mostrare sempre l'immagine di default.

## Requisiti

### Mobile (gulp — già completato)
- [x] In `update()`, se `configJson.APP.myPaths` è presente, scaricare l'immagine dall'URL S3 in buffer → convertire in WebP reale via `sharp` → salvare come `assets/images/profile/my-path.webp`
- [x] In `update()`, se `configJson.APP.myDownloads` è presente, stesso pattern → `assets/images/profile/downloads.webp`
- [x] `sharp` usato come dipendenza transitiva già presente in `node_modules` (via `cordova-res` / `@capacitor/assets`) — nessuna modifica a `package.json`
- [x] Se la chiave è assente nel config → skip silenzioso (il file default resta)
- [x] Se il download o la conversione fallisce → `warn()` + resolve (non bloccare il build)
- [x] Rimossi i file legacy `core/src/assets/images/profile/cammini-my-path.webp` e `core/src/assets/images/profile/cammini-downloads.webp`

### Web (wm-core)
- [ ] In `ugc-box.component.ts`: leggere `APP.myPaths` tramite `confAPP` selector dallo store NgRx
- [ ] Esporre `myPathsImage$: Observable<string>` con fallback a `'assets/images/profile/my-path.webp'` se la chiave è assente
- [ ] In `ugc-box.component.html`: sostituire `[src]="defaultPhotoPath"` con `[src]="myPathsImage$ | async"`
- [ ] `downloads-ec-track-box` non viene modificato (funzionalità mobile only)

## Rischi

- I file default `my-path.webp` e `downloads.webp` sono WebP reali (VP8). Salvare PNG/JPG con estensione `.webp` causerebbe failure su iOS (WKWebView riceve `Content-Type: image/webp` da Capacitor ma bytes PNG → decode fallisce). Mitigazione: conversione reale via `sharp` (già in `node_modules` come transitiva di `cordova-res`).
- Un URL S3 rotto (403, expired, file corrotto) causa un errore nel download o nella conversione. La gestione warn + resolve garantisce che il build non si interrompa, ma l'immagine custom viene persa silenziosamente. Mitigazione: il `warn()` nel log è sufficiente per il debugging.
- `sharp` come transitiva non è dichiarata in `package.json` — rimane finché `cordova-res` / `@capacitor/assets` sono nel progetto. Rischio basso ma documentato.
- Nella versione web l'immagine viene caricata direttamente dall'URL S3 — se S3 ha CORS restrittivo l'immagine potrebbe non caricarsi nel browser. Mitigazione: verificare che il bucket S3 permetta richieste dal dominio della webapp.

## Out of scope

- Modifiche a `downloads-ec-track-box` per la versione web (funzionalità mobile only)
- Modifica alla route API `/{app}/resources/my_paths.png` (solo il backend)
- Configurazione Nova / wm-package (già completata)
- Nuovi campi nel `config.json` (già aggiunti dal backend)

## Moduli toccati

| File | Repo | Operazione |
|------|------|-----------|
| `gulpfile.js` | webmapp-app (root) | Modifica — aggiunta download condizionale + conversione WebP via sharp ✅ |
| `core/src/assets/images/profile/cammini-my-path.webp` | webmapp-app | Eliminazione ✅ |
| `core/src/assets/images/profile/cammini-downloads.webp` | webmapp-app | Eliminazione ✅ |
| `projects/wm-core/src/box/ugc-box/ugc-box.component.ts` | wm-core | Modifica — lettura `APP.myPaths` da store |
| `projects/wm-core/src/box/ugc-box/ugc-box.component.html` | wm-core | Modifica — `[src]` binding su Observable |
