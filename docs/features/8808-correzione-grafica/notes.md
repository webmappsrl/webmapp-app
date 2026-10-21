> Ticket: oc:8808

# Notes — Correzione grafica

## Deviazioni dal piano
Nessuna deviazione rilevante.

## Bug trovati
- Il messaggio non compare quando si elimina una traccia già salvata, ma quando si scarta una
  registrazione appena conclusa: la conferma cancella solo i punti in locale
  (`removeCurrentUgcTrackLocations()`). L'eliminazione di un UGC salvato usa un altro alert, in
  wm-core (`ugc-track-properties-base.component.ts`, «Sicuro di voler eliminare questa traccia?…»),
  che non nomina Webmapp.

## Decisioni
- Testo «dai nostri server» come da note di sviluppo, non «Cammini d'Italia» come chiesto dal
  cliente: la stringa di default è comune a tutte le istanze.
- Proposto un testo aderente all'operazione reale («la registrazione verrà eliminata»); il dev ha
  scelto di restare su «dal tuo profilo e dai nostri server».
- Esiste un override per istanza (`TRANSLATIONS` nella config, applicato da `LangService` di
  wm-core): non usato.

## Verifiche
- `npm run build` con Node 22: ok. Con Node 18 l'Angular CLI non parte.
- `npm run lint` non eseguibile: ESLint 9 non trova `eslint.config.*`.
- Prova manuale sull'alert a cura del dev.

## Follow-up
- Nessuno.
