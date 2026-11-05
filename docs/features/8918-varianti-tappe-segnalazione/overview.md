> Ticket: oc:8918

# VARIANTI / TAPPE (segnalazione)

> Lavoro distribuito su tre repo. Questo è l'overview del repo principale `webmapp-app`; le parti
> negli altri repo hanno ciascuna il proprio overview con lo stesso slug:
> - `wm-core` (submodule): `docs/features/8918-varianti-tappe-segnalazione/overview.md`
> - backend `camminiditalia`: `docs/features/8918-varianti-tappe-segnalazione/overview.md`

## Cosa cambia

Nello shard camminiditalia il numero di tappe di un cammino non conta più le varianti, ovunque
compaia:

- **card del cammino in home** («12 Tappe» sulla Via Valeriana diventa «10 Tappe»): una variante
  camminiditalia del badge, attivata con `fileReplacements`, legge `attributes.stage_count` del
  layer e lo mostra al posto del conteggio delle tracce nelle aggregazioni di Elastic; se il layer
  non ha `stage_count`, resta il conteggio di oggi. In webapp serve la stessa voce
  `fileReplacements` (a cura del dev, vedi notes.md);
- **filtri della home per numero di tappe e per km**: `stage_count` e `distance` vengono calcolati
  dal backend senza varianti (una tappa principale e le sue varianti contano come una tappa, con i
  km della principale), con la stessa regola già usata dal passaporto;
- **passaporto**: il numero di tappe è già corretto da oc:8165; i km del cammino completato (casella
  «N km» del traguardo) passano dalla somma di tutte le righe, varianti non percorse comprese, ai km
  delle tappe effettivamente completate, con la stessa regola della scheda del diario.

Quando il gestore segna o toglie una variante in Nova, gli attributi del cammino si ricalcolano da
soli.

## Perché

Il cliente (Cammini d'Italia) segnala che una tappa impostata come variante continua a essere
contata: un cammino con 13 tracce di cui una variante mostra 13 tappe invece di 12. In produzione
15 cammini hanno varianti (3 col passaporto attivo); per tutti `stage_count` coincide con il numero
di tracce. Allo scrum del 05/11 è stato deciso di trattarlo come bug e portarlo in produzione.

Il dato si corregge alla fonte, nel backend, invece di leggerlo dalle API del passaporto: quelle
richiedono il login e valgono solo per i cammini col passaporto attivo, quindi lascerebbero
l'errore agli utenti non loggati e ai 12 cammini con varianti senza passaporto (fra cui il Cammino
Grande di Celestino, il caso segnalato).

## Requisiti

- [ ] `wm-core`: classe base astratta del badge con `stageCount$` (default `null`); il template
  condiviso mostra `stageCount$` con lo stesso markup ed etichetta del conteggio tracce, altrimenti
  si comporta come oggi
- [ ] `wm-core`: variante `layer-features-counter-badge.component.camminiditalia.ts` che ricava
  `stageCount$` da `attributes.stage_count` del layer `layerId` in `confMAPLayers`
- [ ] `webmapp-app`: voce `fileReplacements` della variante nella configuration `camminiditalia` di
  `core/angular.json`; lo spec del badge nei due elenchi della suite
- [ ] `wm-core`: le uscite GPS del cammino completato contano le sole tappe percorse
  (`completedStages`)
- [ ] `camminiditalia`: svuotare «Variant of» in Nova cancella la variante con Eloquent, così
  scatta l'observer
- [ ] `wm-core`: `passport-detail` calcola i km del cammino completato come la scheda del diario
  (`diary-route-data.utils.ts`): `userDistanceTotal`, altrimenti la somma delle sole tappe
  `completed`; chi ha percorso una variante vede i km della variante
- [ ] `camminiditalia`: `LayerAttributesService::stageCount` conta un gruppo per tappa (variante +
  principale nello stesso cammino), usando la stessa regola di `StageProgressService::rootSql`,
  non una copia
- [ ] `camminiditalia`: `LayerAttributesService::totalDistance` somma i km della sola tappa
  principale di ogni gruppo
- [ ] `camminiditalia`: observer su `EcTrackVariant` (creazione, modifica, cancellazione) che mette
  in coda `RecalculateLayerAttributesJob` per i cammini che contengono la traccia
- [ ] Deploy: prima del deploy, valori attesi di `stage_count` e km dei 15 cammini con varianti
  salvati con una query in sola lettura in produzione; dopo `RecalculateAppLayerAttributesAction`,
  confronto con gli attributi salvati, controllo che i cammini senza varianti non siano cambiati e
  che il `config.json` servito contenga i valori nuovi (altrimenti nuova rigenerazione del config)
- [ ] Negli altri shard il badge e il passaporto si comportano come oggi
- [ ] Nessun testo nuovo: l'etichetta resta `Sentieri`/`Sentiero`, tradotta «Tappe» per
  camminiditalia

## Rischi

- **Ricalcolo in blocco con numeri plausibili ma sbagliati** (tutti i cammini insieme, nessun
  errore visibile; il config può essere rigenerato prima degli ultimi ricalcoli): mitigato dal
  confronto con i valori attesi prima e dopo, descritto nei requisiti.
- **Due regole delle tappe nel backend**: mitigato riusando la regola di `rootSql` invece di
  copiarla, con un test che confronta `stage_count` e `total` del passaporto sullo stesso cammino.
- **Badge che non segue più ricerca e filtri**: `stage_count` è il numero di tappe del cammino,
  fisso; accettato, l'etichetta «N Tappe» descrive il cammino e non il risultato della ricerca.
- **App native già installate**: il badge corretto arriva solo con la nuova release sugli store,
  mentre i filtri (dato del backend) cambiano subito; accettato, è transitorio.

## Out of scope

- La resa delle varianti negli elenchi delle tappe (dettaglio del passaporto, pagina del cammino):
  oggi compaiono come righe normali; serve un flag variante nei payload e una decisione col cliente.
- Il tab «Tappe N» del dettaglio del cammino, che conta i risultati di Elastic: va con la resa
  delle varianti negli elenchi, in un ticket separato.
- La somma dei km nell'immagine di condivisione del passaporto (`RouteShareImageService`), che
  conta ancora le varianti (limite già annotato nel codice con oc:8165).

## Moduli toccati

| Repo | File |
|---|---|
| wm-core | `projects/wm-core/src/layer-features-counter-badge/`: `-base.component.ts` (nuovo), `.component.ts`, `.component.html`, `.component.camminiditalia.ts` (nuovo) e i due spec |
| wm-core | `projects/wm-core/src/passport/passport.utils.ts`, `passport-detail/passport-detail.component.ts` e spec |
| wm-core | `projects/wm-core/src/diaries/diary-route-data.utils.ts` |
| camminiditalia | `app/Services/LayerAttributesService.php`, `app/Services/StageProgressService.php` (regola della radice condivisa) |
| camminiditalia | `app/Observers/EcTrackVariantObserver.php` (nuovo) e registrazione in `AppServiceProvider`; `app/Nova/EcTrack.php` |
| camminiditalia | `tests/Feature/LayerAttributesServiceTest.php`, `EcTrackVariantObserverTest.php` (nuovo), `EcTrackVariantFieldTest.php` |
| webmapp-app | `core/angular.json` (`fileReplacements` e suite), `core/tsconfig.spec.json`, bump del submodule `wm-core` |
