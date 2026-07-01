> Ticket: oc:8190

# Documentare funzionamento downloadOverlay e hitMapUrl per shard carg

## Cosa cambia

Viene aggiunta al `CLAUDE.md` del repo principale una nuova sezione che documenta, allo stato attuale del codice, il funzionamento del download degli overlay hitmap (`downloadOverlay`) e del campo `hitMapUrl`, entrambi legati oggi esclusivamente allo shard `carg`. È un intervento prevalentemente di documentazione: l'unica modifica di codice è un commento esplicativo in `download-panel.component.ts` (nessun cambio di logica/comportamento).

## Perché

Il meccanismo di download overlay e il campo `hitMapUrl` non sono documentati da nessuna parte nel repository, nonostante coinvolgano un hardcoding esplicito (`overlayXYZ` in `map.page.html:209`) e un campo di configurazione (`IMAP.hitMapUrl`) che oggi solo il backend di carg valorizza. La motivazione è di onboarding/knowledge sharing: chi lavora sul progetto (oggi o in futuro) deve poter capire rapidamente questo meccanismo carg-specifico senza dover ricostruire il flusso leggendo codice sparso su più repo (app principale, wm-core, map-core, wm-types).

## Requisiti

- [ ] Documentare in `CLAUDE.md` (sezione dedicata, non `docs/features/`) il flusso `wm-download` → `wm-download-panel` → `downloadOverlay()` in `localForage.ts`
- [ ] Documentare l'hardcoding `[overlayXYZ]="'https://tiles.webmapp.it/carg'"` in `map.page.html:209`, incluso il fatto che sovrascrive il default (`https://api.webmapp.it/tiles`) definito in `download-panel.component.ts`
- [ ] Documentare il secondo hardcoding carg-specifico, distinto dal primo: il tile layer del basemap geologico in `map-core/src/directives/hit-map.directive.ts:106` (`https://carg.geosciences-ir.it/storage/cargmap/{z}/{x}/{y}.png`), chiarendo che è un meccanismo diverso (basemap vs download overlay) pur riguardando entrambi carg
- [ ] Documentare il campo `IMAP.hitMapUrl` (`wm-core/projects/wm-core/src/types/config.ts:254` — **non** in wm-types): è generico nella definizione di tipo, letto dal `config.json` di qualsiasi backend/shard tramite il selector `confMAPHitMapUrl` (wm-core) e dispatchato in `app.component.ts`, ma oggi è valorizzato solo dal backend carg — nessun altro shard lo usa
- [ ] Documentare la distinzione tra due elementi omonimi:
  - `downloadOverlay()` **metodo** in `map.page.ts:336-338` — è uno dei tre trigger di `showDownload$` (insieme a `openTrackDownload()` e `downloadTiles()`, generici per tutti gli shard), ma è di fatto uno **stub inerte**: fa solo `console.log('downloadOverlay')` e apre il pannello generico — non implementa alcuna logica di download
  - `downloadOverlay()` **funzione** importata da `@map-core/utils`, chiamata nel vero punto di esecuzione: `download-panel.component.ts:139-148`, dentro `start()`, gated su `if (this.overlayUrls != null || this.overlayGeometry != null)`. Questa condizione è di fatto vera solo per carg, perché `overlayUrls`/`overlayGeometry` sono popolati (da `overlayFeatureCollections$`/`hitMapGeometry$` in `map.page.html`) solo quando esistono feature hitmap, cosa che oggi avviene solo su carg
- [ ] Aggiungere un commento in `download-panel.component.ts` sulla riga della condizione `if (this.overlayUrls != null || this.overlayGeometry != null)` (riga 139) che spiega che questo branch esegue di fatto solo per carg, e perché (gli `@Input()` sono valorizzati solo quando `hitMapUrl` è configurato lato backend, oggi solo per carg) — unica modifica di codice prevista da questo ticket, un commento esplicativo, nessuna modifica di logica
- [ ] Documentare che `hitMapUrl`, oltre al download overlay, controlla anche la visibilità della searchbar nella home (`wm-core/.../home/home.component.html:12`, condizione `hitMapUrl==null`) — un effetto collaterale del campo non limitato al solo meccanismo di download
- [ ] Contenuto in italiano, coerente con lo stile già usato nelle sezioni "Feature disponibili" e "Decisioni architetturali" del `CLAUDE.md`

## Rischi

- La documentazione descrive uno snapshot del codice: file/linee citate (`map.page.html:209`, `hit-map.directive.ts:106`) potrebbero disallinearsi in futuro se il codice viene modificato senza aggiornare la doc. Mitigazione: nessuna automazione prevista, è un rischio accettato per un ticket di sola documentazione.
- Non viene documentato/segnalato il rischio "un altro shard adotta hitMapUrl senza rimuovere l'hardcoding" — scelta esplicita dell'utente di limitarsi allo stato attuale.
- **Debito tecnico normalizzato**: descrivere l'hardcoding come "il meccanismo carg" in CLAUDE.md rischia di farlo percepire come comportamento accettato/definitivo invece che come debito tecnico da rifattorizzare. La doc deve limitarsi a descrivere lo stato attuale senza validarlo come buona pratica.
- **Interfacce `IMAP` divergenti tra submoduli**: esistono almeno due definizioni di `IMAP` (`wm-core/projects/wm-core/src/types/config.ts` con `hitMapUrl`, e `map-core/src/types/model.ts:160` senza `hitMapUrl`) invece di un'unica fonte di verità in `wm-types`. Non viene risolto in questo ticket, ma va segnalato come inconsistenza architetturale nota.

## Out of scope

- Refactor per rendere `overlayXYZ` dinamico/configurabile per shard diversi da carg — esplicitamente fuori scope, da trattare in un ticket dedicato se necessario
- Creazione di `docs/features/` come deliverable di contenuto finale (usato solo come artefatto di processo per questo workflow `wm-plan`)
- Qualsiasi modifica di logica al codice applicativo — l'unica eccezione ammessa è un commento esplicativo in `download-panel.component.ts` (vedi Requisiti), nessun comportamento cambia

## Moduli toccati

- `CLAUDE.md` (repo principale) — modifica di contenuto, sezioni "Feature disponibili" e "Decisioni architetturali"
- `core/src/app/pages/map/download-panel/download-panel.component.ts` (riga 139) — aggiunta di un commento esplicativo, nessuna modifica di logica

Nessun altro file viene modificato. I file citati sotto sono solo **riferimenti** letti per scrivere la documentazione, non toccati:
- `core/src/app/pages/map/map.page.html` (riga 209)
- `core/src/app/pages/map/map.page.ts` (righe 186, 328-346)
- `core/src/app/pages/map/download/download.component.ts`
- `core/src/app/pages/map/download-panel/download-panel.component.ts`
- `core/src/app/shared/wm-core/projects/wm-core/src/store/conf/conf.selector.ts` (`confMAPHitMapUrl`)
- `core/src/app/shared/wm-core/projects/wm-core/src/types/config.ts` (riga 254, `IMAP.hitMapUrl`)
- `core/src/app/shared/map-core/src/types/model.ts` (riga 160, `IMAP` divergente senza `hitMapUrl`)
- `core/src/app/shared/wm-core/projects/wm-core/src/home/home.component.html` (riga 12, searchbar gated su `hitMapUrl`)
- `core/src/app/shared/map-core/src/directives/hit-map.directive.ts` (riga 106)
