> Ticket: oc:7294

# Notes — Modificare il gulp — Permessi Android

## Deviazioni dal piano

- La chiave UGC è `MAP.record_track_show` (non `APP.record_track_show` come ipotizzato inizialmente) — confermato guardando il config live di PNFC
- `maxSdkVersion="32"` su `READ_EXTERNAL_STORAGE` rimosso dopo revisione dell'utente — semplificazione accettabile
- Logica `manageAndroidPermissions` semplificata: rimuovi tutto prima, poi re-aggiungi solo se UGC — eliminata duplicazione con helper `removePermission`

## Decisioni

- Il test con istanza locale PNFC inizialmente sembrava fallire (manifest solo con `INTERNET`) perché il config locale era stale e non aveva `MAP.record_track_show`. Il config live (`geohub.webmapp.it/api/app/webmapp/49/config.json`) ha invece `record_track_show: true` — build fresca produce il risultato corretto
- Default conservativo: se `config.json` non è leggibile → `hasUgc = false` → nessun permesso di storage

## Follow-up

- Nessuno
