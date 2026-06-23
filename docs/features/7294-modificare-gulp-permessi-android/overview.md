> Ticket: oc:7294

# Modificare il gulp — Permessi Android

## Cosa cambia

La funzione `addPermissionsIfNotPresent()` nel `gulpfile.js` viene sostituita con `manageAndroidPermissions(hasUgc)` che:
- **Rimuove sempre** `android.permission.READ_MEDIA_IMAGES` dal manifest (anche se già presente da build precedenti o da plugin Capacitor)
- **Rimuove** `READ_EXTERNAL_STORAGE` e `WRITE_EXTERNAL_STORAGE` se l'istanza non ha UGC (`MAP.record_track_show !== true`)
- **Aggiunge** `READ_EXTERNAL_STORAGE` e `WRITE_EXTERNAL_STORAGE` se l'istanza ha UGC (`MAP.record_track_show === true`) e non sono già presenti

## Perché

`READ_MEDIA_IMAGES` è un permesso introdotto in Android 13 che non è più necessario nelle versioni attuali dell'app. `READ_EXTERNAL_STORAGE` e `WRITE_EXTERNAL_STORAGE` sono necessari solo per le istanze che consentono la registrazione di tracce GPS (UGC). Aggiungerli a tutte le istanze è una violazione del principio di least privilege e può causare problemi nelle review del Play Store.

## Requisiti

- [ ] `READ_MEDIA_IMAGES` rimosso attivamente dal manifest in ogni build Android, indipendentemente dall'istanza
- [ ] `MAP.record_track_show` letto da `dir/config.json` su disco all'interno di `_updateAndroidFiles()` (il file è già presente perché scritto da `getUrlFile` in `update()`)
- [ ] Se `MAP.record_track_show !== true`: rimuovere attivamente `READ_EXTERNAL_STORAGE` e `WRITE_EXTERNAL_STORAGE`
- [ ] Se `MAP.record_track_show === true`: aggiungere `READ_EXTERNAL_STORAGE` e `WRITE_EXTERNAL_STORAGE` (senza attributi extra) se non presenti
- [ ] `addPermissionsIfNotPresent()` completamente sostituita da `manageAndroidPermissions(hasUgc)` — la vecchia funzione viene rimossa integralmente per evitare conflitti
- [ ] La rimozione avviene nel through2 stream dopo `npx cap copy` — timing già corretto per sovrascrivere quanto aggiunto dai plugin Capacitor

## Rischi

- Se `dir/config.json` non è leggibile o non ha `MAP.record_track_show`, la funzione deve defaultare a **UGC disabilitato** (rimuovere i permessi di storage) per essere conservativa lato Play Store. Un log di warning è sufficiente.
- Plugin Capacitor (es. `@capacitor/camera`) potrebbero dichiarare `READ_MEDIA_IMAGES` nei loro manifest fragment: la rimozione nel through2 stream avviene dopo il merge e sovrascrive correttamente.

## Out of scope

- Version code (già gestito)
- Modifiche alla logica iOS
- Modifiche ai plugin Capacitor installati

## Moduli toccati

| File | Repo | Operazione |
|------|------|-----------|
| `gulpfile.js` | webmapp-app (root) | Modifica — refactor `addPermissionsIfNotPresent` → `manageAndroidPermissions(hasUgc)` |
