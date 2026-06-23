> Ticket: oc:7480

# Notes — [wm-package][app] inserire foto

## Deviazioni dal piano

- La conversione PNG/JPG → WebP è necessaria (file default `my-path.webp` e `downloads.webp` sono WebP reali VP8): `sharp` usato come transitiva di `cordova-res`, nessuna modifica a `package.json`
- Il commit è stato fatto direttamente dall'utente dopo aver testato le build

## Decisioni

- `sharp` lazy-required dentro `downloadProfileImage()` — non rompe se in futuro la transitiva dovesse sparire: il fallimento avviene solo quando la chiave è presente nel config
- Warn + resolve su errori di download e conversione — il build non si interrompe mai per immagini opzionali
- Usato URL S3 direttamente da `configJson.APP.myPaths` / `configJson.APP.myDownloads` — evita un hop via server Laravel

## Follow-up

- Se `cordova-res` o `@capacitor/assets` venissero rimossi dal progetto, `sharp` sparirebbe da `node_modules` — in quel caso aggiungere `sharp` come devDependency esplicita in `package.json`
- Scope ampliato: aggiunto supporto web in `wm-ugc-box` (wm-core) — legge `APP.myPaths` dallo store NgRx tramite `confAPP` selector con fallback al path statico. `downloads-ec-track-box` escluso (mobile only). Branch wm-core già creato dall'utente.
- Rischio CORS: nella versione web l'immagine è caricata direttamente dall'URL S3 — verificare che il bucket permetta richieste dal dominio della webapp
