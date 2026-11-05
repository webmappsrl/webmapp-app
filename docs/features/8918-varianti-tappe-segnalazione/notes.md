> Ticket: oc:8918

# Notes — Varianti escluse dal conteggio delle tappe

## Divergenze dal piano, task per task

### Task 3: badge in variante camminiditalia

Il piano (e l'overview, dopo la challenge) prevedeva un input opzionale `stageCount` sul badge
condiviso, valorizzato da `layer-box.component.camminiditalia.html`. Implementato e approvato in
review, poi in review-gate il dev ha chiesto di tornare alla forma decisa all'inizio: una variante
camminiditalia di `wm-layer-features-counter-badge` attivata con `fileReplacements`.

Forma adottata:
- classe base astratta `layer-features-counter-badge-base.component.ts` (`@Directive()`, mai soggetta
  a `fileReplacements`) con gli observable del conteggio e `stageCount$`, che di default emette
  `null`;
- il componente di default estende la base senza cambiare comportamento;
- il template condiviso mostra `stageCount$` con lo stesso markup ed etichetta del conteggio tracce,
  altrimenti il conteggio di oggi;
- la variante `layer-features-counter-badge.component.camminiditalia.ts` ricava `stageCount$` da
  `attributes.stage_count` del layer `layerId` in `confMAPLayers`;
- voce `fileReplacements` nella configuration `camminiditalia` di `core/angular.json`;
- `layer-box.component.camminiditalia.html` torna com'era (nessun binding `stageCount`).

Conseguenza: la webapp `wm-webapp` non si corregge più da sola; il dev aggiungerà la stessa voce
`fileReplacements` nel suo `angular.json`.

### Task 2: cancellazione da Nova

Oltre all'observer previsto, è stato modificato `app/Nova/EcTrack.php` (camminiditalia): svuotando
«Variant of» la riga di `ec_track_variants` era cancellata con un delete da query builder, che non
emette eventi Eloquent e quindi non avrebbe ricalcolato il cammino. Ora usa
`EcTrackVariant::find($trackId)?->delete()`, con un test in `EcTrackVariantFieldTest`.

### Task 4: uscite GPS e completedStages

Dalla review finale, approvato dal dev: oltre ai km, anche le uscite GPS del traguardo
(`gpsOutings`) ricevono le sole tappe percorse. Per questo `passport.utils.ts` esporta un helper
`completedStages(stages)`, usato da `walkedDistanceKm` e dal dettaglio del passaporto, e importa
`./passport-walked` per il tipo di `userDistanceTotal`. Un secondo test nello spec del dettaglio.

## Bug trovati

- **Svuotare «Variant of» in Nova non ricalcolava il cammino**: la riga di `ec_track_variants` era
  cancellata con un delete da query builder (`whereKey()->delete()`), che non emette eventi
  Eloquent. Corretto con `find()?->delete()` in `app/Nova/EcTrack.php` (camminiditalia), con test.
- **Uscite GPS nascoste nei cammini completati con varianti** (dalla review finale, approvato dal
  dev): `gpsOutings` riceveva tutte le righe e restituiva `null` per una variante non percorsa.
  Ora riceve `completedStages(stages)`.

## Decisioni

- I km del cammino completato nel passaporto sono quelli delle tappe percorse
  (`walkedDistanceKm`, stessa regola del diario), non `km_total` del backend, che usa i km della
  principale: chi passa da una variante deve vedere i km della variante.
- `stage_count = 0` ricade sul conteggio di Elastic: il backend restituisce `null`, mai 0, quindi
  il caso non si presenta.
- Ricalcolo in produzione (Task 5) affidato al dev: valori attesi prima, azione Nova, confronto e
  controllo del `config.json` dopo.

## Follow-up

- **Tab «Tappe N» del dettaglio del cammino** (`home-result.component.html:41-56`): conta i
  risultati di Elastic (`countEcTracks` = `state.hits.length`), quindi varianti comprese, ed è la
  lunghezza dell'elenco sotto. Correggerlo da solo creerebbe un numero diverso dalle card mostrate:
  va fatto insieme alla resa delle varianti negli elenchi, con il dato `variante di` esposto dal
  backend nei payload. Concordato col dev di tracciarlo in un ticket separato.
- Test locale: la Via Valeriana (layer 39) in locale ha le due varianti di produzione
  (579 → 106, 606 → 544), create via Eloquent; `stage_count` è passato a 10 e il config di MinIO
  locale riporta il valore nuovo.

- Lo spec di `diary-editor` fallisce se lanciato da solo con `--include` sulla cartella `diaries`
  («Cannot read properties of null (reading 'commands')») ed è verde nella suite completa:
  dipendenza preesistente dall'ordine dei test, da tracciare a parte.
- Commento di `LayerAttributes.distance` in `wm-types/src/config.ts` da precisare («senza
  varianti») al prossimo lavoro su wm-types.
- `LayerAttributesService::totalDistance` carica anche le varianti prima di filtrarle: si può
  filtrare in query (`whereIn('ec_tracks.id', …)`).
- Km nell'immagine di condivisione del passaporto (`RouteShareImageService`) ancora con le varianti.
