> Ticket: oc:7480

# Notes — [wm-package][app] inserire foto

## Deviazioni dal piano

- La conversione PNG/JPG → WebP è necessaria (file default `my-path.webp` e `downloads.webp` sono WebP reali VP8): `sharp` usato come transitiva di `cordova-res`, nessuna modifica a `package.json`
- Il commit è stato fatto direttamente dall'utente dopo aver testato le build

## Decisioni

- `sharp` lazy-required dentro `downloadProfileImage()` — non rompe se in futuro la transitiva dovesse sparire: il fallimento avviene solo quando la chiave è presente nel config
- Warn + resolve su errori di download e conversione — il build non si interrompe mai per immagini opzionali
- Usato URL S3 direttamente da `configJson.APP.my_paths` / `configJson.APP.my_downloads` — evita un hop via server Laravel

## Follow-up

- Se `cordova-res` o `@capacitor/assets` venissero rimossi dal progetto, `sharp` sparirebbe da `node_modules` — in quel caso aggiungere `sharp` come devDependency esplicita in `package.json`
