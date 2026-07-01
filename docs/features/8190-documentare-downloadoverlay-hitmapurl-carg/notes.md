> Ticket: oc:8190

# Notes — Documentare funzionamento downloadOverlay e hitMapUrl per shard carg

## Deviazioni dal piano

- Durante la fase di execution, l'inserimento del commento in `download-panel.component.ts` ha spostato di una riga il blocco `if (this.overlayUrls != null || this.overlayGeometry != null) { ... }`. I riferimenti a riga nel testo di CLAUDE.md sono stati aggiornati da `139-148` a `140-149` per restare accurati.
- Dopo la review formale (`wm-skills:wm-review-ticket`), il commento è stato riformattato su due righe con una riga vuota di separazione (fix di stile suggerito dal finder cleanup), spostando ulteriormente il blocco `if` a `142-151`. I riferimenti in CLAUDE.md sono stati aggiornati di conseguenza.

## Bug trovati

- Nessun bug introdotto. Rilevato (ma non corretto, fuori scope) un warning TypeScript pre-esistente in `download-panel.component.ts:147`: la variabile locale `properties` (`const properties = current.properties;`) è dichiarata ma mai letta. Non è stato toccato perché non richiesto dal ticket e per non introdurre una modifica di logica non pianificata.

## Decisioni

- Durante la Fase: challenge sono emersi due errori fattuali nell'overview iniziale, corretti prima di procedere: (1) il path di `IMAP.hitMapUrl` era attribuito erroneamente a `wm-types` invece che a `wm-core/projects/wm-core/src/types/config.ts:254`; (2) `downloadOverlay()` era descritto come un trigger funzionante mentre il metodo in `map.page.ts` è uno stub inerte — il download reale avviene in una funzione omonima diversa, chiamata in `download-panel.component.ts`.
- Su richiesta esplicita dell'utente durante la review dell'overview, è stato aggiunto un piccolo commento esplicativo in `download-panel.component.ts:139` (ora riga 140) — unica modifica di codice del ticket, nessun cambio di comportamento. L'overview e il plan sono stati aggiornati di conseguenza per riflettere questa estensione di scope minima.
- Scelte esplicite di scope, confermate dall'utente: il refactor per generalizzare `overlayXYZ` ad altri shard resta fuori scope; il rischio "un altro shard adotta hitMapUrl senza rimuovere l'hardcoding" non viene documentato; il comportamento di fallimento silenzioso del fetch di `hitMapUrl` in `home-hitmap.component.ts` resta fuori scope.

## Follow-up

- Le due interfacce `IMAP` divergenti tra `wm-core` e `map-core` (invece di un'unica fonte di verità in `wm-types`) sono un'inconsistenza architetturale nota, segnalata in CLAUDE.md ma non risolta — possibile ticket futuro di consolidamento tipi.
- Nessun test copre l'area downloadOverlay/hitMapUrl (assenza confermata durante la Fase: challenge). Non in scope per questo ticket di sola documentazione.
